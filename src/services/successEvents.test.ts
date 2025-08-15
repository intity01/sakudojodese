// Success Events Service Tests
// Comprehensive test suite for success events and metrics system

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuccessEventsService, DEFAULT_SUCCESS_CONFIG } from './successEventsService';
import type { 
  SuccessEventType, 
  SuccessCategory, 
  CreateSuccessEventParams,
  SuccessEventFilter 
} from '../types/successEvents';
import allAchievements from '../data/achievements';

describe('SuccessEventsService', () => {
  let service: SuccessEventsService;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Create service with achievements
    const config = {
      ...DEFAULT_SUCCESS_CONFIG,
      achievements: allAchievements
    };
    service = new SuccessEventsService(config);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Event Creation', () => {
    it('should create a basic success event', async () => {
      const params: CreateSuccessEventParams = {
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: {
          track: 'EN',
          framework: 'CEFR',
          level: 'A1',
          questionsTotal: 10,
          questionsCorrect: 8,
          scorePct: 80
        }
      };

      const event = await service.createSuccessEvent(params);

      expect(event).toBeDefined();
      expect(event.userId).toBe(testUserId);
      expect(event.eventType).toBe('quiz_completed');
      expect(event.category).toBe('learning');
      expect(event.points).toBeGreaterThan(0);
      expect(event.metadata.scorePct).toBe(80);
      expect(event.timestamp).toBeDefined();
      expect(event.id).toBeDefined();
    });

    it('should calculate points correctly with score bonus', async () => {
      const basePoints = DEFAULT_SUCCESS_CONFIG.pointValues.quiz_completed;
      const scoreBonus = Math.floor(90 / 10) * 5; // 9 * 5 = 45 bonus points
      
      const event = await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: { scorePct: 90 }
      });

      expect(event.points).toBe(basePoints + scoreBonus);
    });

    it('should apply difficulty multipliers', async () => {
      const event = await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: { level: 'C2', scorePct: 80 }
      });

      const basePoints = DEFAULT_SUCCESS_CONFIG.pointValues.quiz_completed + 40; // 80% score bonus
      const expectedPoints = Math.round(basePoints * DEFAULT_SUCCESS_CONFIG.difficultyMultipliers.C2);
      
      expect(event.points).toBe(expectedPoints);
    });

    it('should apply streak multipliers', async () => {
      const event = await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: { streakLength: 7 }
      });

      expect(event.multiplier).toBe(DEFAULT_SUCCESS_CONFIG.streakMultipliers[7]);
      expect(event.points).toBeGreaterThan(DEFAULT_SUCCESS_CONFIG.pointValues.quiz_completed);
    });

    it('should categorize events correctly', async () => {
      const testCases: Array<{ eventType: SuccessEventType; expectedCategory: SuccessCategory }> = [
        { eventType: 'quiz_completed', expectedCategory: 'learning' },
        { eventType: 'focus_session_completed', expectedCategory: 'focus' },
        { eventType: 'daily_streak_continued', expectedCategory: 'streak' },
        { eventType: 'badge_earned', expectedCategory: 'achievement' },
        { eventType: 'helped_others', expectedCategory: 'social' }
      ];

      for (const { eventType, expectedCategory } of testCases) {
        const event = await service.createSuccessEvent({
          userId: testUserId,
          eventType
        });
        
        expect(event.category).toBe(expectedCategory);
      }
    });
  });

  describe('Batch Event Creation', () => {
    it('should create multiple events in batch', async () => {
      const events = await service.createBatchEvents({
        events: [
          { userId: testUserId, eventType: 'quiz_completed' },
          { userId: testUserId, eventType: 'study_session_completed' },
          { userId: testUserId, eventType: 'focus_session_completed' }
        ]
      });

      expect(events).toHaveLength(3);
      expect(events[0].eventType).toBe('quiz_completed');
      expect(events[1].eventType).toBe('study_session_completed');
      expect(events[2].eventType).toBe('focus_session_completed');
    });

    it('should skip duplicates when requested', async () => {
      const sessionId = 'test-session-123';
      
      // Create first event
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_started',
        sessionId
      });

      // Try to create duplicate
      const events = await service.createBatchEvents({
        events: [
          { userId: testUserId, eventType: 'session_started', sessionId }
        ],
        skipDuplicates: true
      });

      expect(events).toHaveLength(0); // Should skip duplicate
    });
  });

  describe('User Metrics', () => {
    it('should initialize user metrics correctly', async () => {
      const metrics = await service.getUserMetrics(testUserId);

      expect(metrics.userId).toBe(testUserId);
      expect(metrics.totalPoints).toBe(0);
      expect(metrics.level).toBe(1);
      expect(metrics.experiencePoints).toBe(0);
      expect(metrics.currentStreak).toBe(0);
      expect(metrics.totalSessions).toBe(0);
      expect(metrics.totalQuestions).toBe(0);
      expect(metrics.correctAnswers).toBe(0);
    });

    it('should update metrics when events are created', async () => {
      // Create some learning events
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_finished',
        metadata: { timeSpent: 300000 } // 5 minutes
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'question_answered_correct'
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'question_answered_incorrect'
      });

      const metrics = await service.getUserMetrics(testUserId);

      expect(metrics.totalSessions).toBe(1);
      expect(metrics.totalQuestions).toBe(2);
      expect(metrics.correctAnswers).toBe(1);
      expect(metrics.averageScore).toBe(50); // 1/2 * 100
      expect(metrics.timeSpent).toBe(5); // 5 minutes
      expect(metrics.totalPoints).toBeGreaterThan(0);
    });

    it('should update focus metrics correctly', async () => {
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'focus_session_completed',
        metadata: { focusDuration: 25 } // 25 minutes
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'focus_session_completed',
        metadata: { focusDuration: 45 } // 45 minutes
      });

      const metrics = await service.getUserMetrics(testUserId);

      expect(metrics.focusSessions).toBe(2);
      expect(metrics.totalFocusTime).toBe(70); // 25 + 45
      expect(metrics.averageFocusSession).toBe(35); // 70 / 2
      expect(metrics.longestFocusSession).toBe(45);
    });

    it('should trigger level up events', async () => {
      // Create enough events to level up
      const pointsNeeded = DEFAULT_SUCCESS_CONFIG.levelThresholds[1]; // Points for level 2
      const eventsNeeded = Math.ceil(pointsNeeded / DEFAULT_SUCCESS_CONFIG.pointValues.quiz_completed);

      for (let i = 0; i < eventsNeeded; i++) {
        await service.createSuccessEvent({
          userId: testUserId,
          eventType: 'quiz_completed'
        });
      }

      const metrics = await service.getUserMetrics(testUserId);
      expect(metrics.level).toBeGreaterThan(1);
    });
  });

  describe('Event Querying', () => {
    beforeEach(async () => {
      // Create test events
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: { track: 'EN' }
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'focus_session_completed',
        metadata: { focusDuration: 30 }
      });

      await service.createSuccessEvent({
        userId: 'other-user',
        eventType: 'quiz_completed'
      });
    });

    it('should filter events by user', async () => {
      const events = await service.getEvents({ userId: testUserId });
      
      expect(events).toHaveLength(2);
      expect(events.every(e => e.userId === testUserId)).toBe(true);
    });

    it('should filter events by type', async () => {
      const events = await service.getEvents({
        userId: testUserId,
        eventTypes: ['quiz_completed']
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('quiz_completed');
    });

    it('should filter events by category', async () => {
      const events = await service.getEvents({
        userId: testUserId,
        categories: ['learning']
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].category).toBe('learning');
    });

    it('should apply pagination', async () => {
      const events = await service.getEvents({
        userId: testUserId,
        limit: 1,
        offset: 0
      });
      
      expect(events).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const events = await service.getEvents({
        userId: testUserId,
        startDate: oneHourAgo.toISOString(),
        endDate: now.toISOString()
      });
      
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(new Date(event.timestamp)).toBeInstanceOf(Date);
      });
    });
  });

  describe('Achievements', () => {
    it('should award first session achievement', async () => {
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_finished'
      });

      const events = await service.getEvents({
        userId: testUserId,
        eventTypes: ['badge_earned']
      });

      const firstSessionAchievement = events.find(e => 
        e.metadata.achievementId === 'first_session'
      );
      
      expect(firstSessionAchievement).toBeDefined();
    });

    it('should award quiz achievements based on count', async () => {
      // Complete 10 quizzes to earn quiz_novice achievement
      for (let i = 0; i < 10; i++) {
        await service.createSuccessEvent({
          userId: testUserId,
          eventType: 'quiz_completed'
        });
      }

      const events = await service.getEvents({
        userId: testUserId,
        eventTypes: ['badge_earned']
      });

      const quizNoviceAchievement = events.find(e => 
        e.metadata.achievementId === 'quiz_novice'
      );
      
      expect(quizNoviceAchievement).toBeDefined();
    });

    it('should award perfect score achievement', async () => {
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'perfect_score'
      });

      const events = await service.getEvents({
        userId: testUserId,
        eventTypes: ['badge_earned']
      });

      const perfectionistAchievement = events.find(e => 
        e.metadata.achievementId === 'perfectionist'
      );
      
      expect(perfectionistAchievement).toBeDefined();
    });

    it('should not award duplicate achievements', async () => {
      // Complete first session twice
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_finished'
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_finished'
      });

      const events = await service.getEvents({
        userId: testUserId,
        eventTypes: ['badge_earned']
      });

      const firstSessionAchievements = events.filter(e => 
        e.metadata.achievementId === 'first_session'
      );
      
      expect(firstSessionAchievements).toHaveLength(1);
    });
  });

  describe('Leaderboards', () => {
    beforeEach(async () => {
      // Create events for multiple users
      await service.createSuccessEvent({
        userId: 'user1',
        eventType: 'quiz_completed',
        customPoints: 100
      });

      await service.createSuccessEvent({
        userId: 'user2',
        eventType: 'quiz_completed',
        customPoints: 200
      });

      await service.createSuccessEvent({
        userId: 'user3',
        eventType: 'quiz_completed',
        customPoints: 150
      });

      // Trigger leaderboard update
      await service['updateLeaderboards']();
    });

    it('should create leaderboards for different categories and timeframes', async () => {
      const dailyLearning = await service.getLeaderboard('learning', 'daily');
      const weeklyLearning = await service.getLeaderboard('learning', 'weekly');
      
      expect(dailyLearning).toBeDefined();
      expect(weeklyLearning).toBeDefined();
      expect(dailyLearning?.category).toBe('learning');
      expect(dailyLearning?.timeframe).toBe('daily');
    });

    it('should rank users correctly', async () => {
      const leaderboard = await service.getLeaderboard('learning', 'daily');
      
      expect(leaderboard?.entries).toHaveLength(3);
      expect(leaderboard?.entries[0].userId).toBe('user2'); // Highest points
      expect(leaderboard?.entries[0].rank).toBe(1);
      expect(leaderboard?.entries[1].userId).toBe('user3'); // Second highest
      expect(leaderboard?.entries[1].rank).toBe(2);
      expect(leaderboard?.entries[2].userId).toBe('user1'); // Lowest points
      expect(leaderboard?.entries[2].rank).toBe(3);
    });

    it('should get user rank correctly', async () => {
      const user2Rank = await service.getUserRank('user2', 'learning', 'daily');
      const user1Rank = await service.getUserRank('user1', 'learning', 'daily');
      
      expect(user2Rank).toBe(1);
      expect(user1Rank).toBe(3);
    });
  });

  describe('Personal Stats', () => {
    beforeEach(async () => {
      // Create various events for comprehensive stats
      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_finished',
        metadata: { timeSpent: 600000 } // 10 minutes
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        metadata: { scorePct: 85, questionsTotal: 10, questionsCorrect: 8 }
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'focus_session_completed',
        metadata: { focusDuration: 25 }
      });

      await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'daily_streak_continued',
        metadata: { streakLength: 5 }
      });
    });

    it('should generate comprehensive personal stats', async () => {
      const stats = await service.getPersonalStats(testUserId, 'all_time');

      expect(stats.userId).toBe(testUserId);
      expect(stats.period).toBe('all_time');
      expect(stats.totalEvents).toBe(4);
      expect(stats.totalPoints).toBeGreaterThan(0);
      expect(stats.sessionsCompleted).toBe(1);
      expect(stats.questionsAnswered).toBe(0); // No individual question events in this test
      expect(stats.timeSpent).toBe(10); // 10 minutes
      expect(stats.focusTime).toBe(25);
      expect(stats.focusSessions).toBe(1);
      expect(stats.currentStreak).toBe(5);
    });

    it('should calculate level progress correctly', async () => {
      const stats = await service.getPersonalStats(testUserId, 'all_time');
      
      expect(stats.levelProgress.currentLevel).toBeGreaterThan(0);
      expect(stats.levelProgress.currentXP).toBeGreaterThan(0);
      expect(stats.levelProgress.progress).toBeGreaterThanOrEqual(0);
      expect(stats.levelProgress.progress).toBeLessThanOrEqual(100);
    });

    it('should categorize points correctly', async () => {
      const stats = await service.getPersonalStats(testUserId, 'all_time');
      
      expect(stats.topCategories).toBeDefined();
      expect(stats.topCategories.length).toBeGreaterThan(0);
      
      const totalPercentage = stats.topCategories.reduce((sum, cat) => sum + cat.percentage, 0);
      expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1); // Should sum to ~100%
    });

    it('should filter stats by time period', async () => {
      const dailyStats = await service.getPersonalStats(testUserId, 'day');
      const weeklyStats = await service.getPersonalStats(testUserId, 'week');
      
      expect(dailyStats.period).toBe('day');
      expect(weeklyStats.period).toBe('week');
      
      // Weekly stats should include daily stats
      expect(weeklyStats.totalEvents).toBeGreaterThanOrEqual(dailyStats.totalEvents);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const metrics = await service.getUserMetrics('invalid-user');
      
      expect(metrics.userId).toBe('invalid-user');
      expect(metrics.totalPoints).toBe(0);
    });

    it('should handle empty event queries', async () => {
      const events = await service.getEvents({
        userId: 'non-existent-user'
      });
      
      expect(events).toHaveLength(0);
    });

    it('should handle invalid leaderboard requests', async () => {
      const leaderboard = await service.getLeaderboard('learning', 'daily');
      
      // Should return null or empty leaderboard for non-existent data
      if (leaderboard) {
        expect(leaderboard.entries).toBeDefined();
      }
    });

    it('should handle custom points correctly', async () => {
      const customPoints = 999;
      const event = await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'quiz_completed',
        customPoints
      });

      expect(event.points).toBe(customPoints);
    });

    it('should handle events without metadata', async () => {
      const event = await service.createSuccessEvent({
        userId: testUserId,
        eventType: 'session_started'
      });

      expect(event.metadata).toBeDefined();
      expect(event.points).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of events efficiently', async () => {
      const startTime = Date.now();
      
      // Create 100 events
      const events = Array.from({ length: 100 }, (_, i) => ({
        userId: testUserId,
        eventType: 'question_answered_correct' as SuccessEventType
      }));

      await service.createBatchEvents({ events });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
      
      // Verify all events were created
      const userEvents = await service.getEvents({ userId: testUserId });
      expect(userEvents.length).toBe(100);
    });

    it('should handle concurrent event creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        service.createSuccessEvent({
          userId: testUserId,
          eventType: 'quiz_completed',
          sessionId: `session-${i}`
        })
      );

      const events = await Promise.all(promises);
      
      expect(events).toHaveLength(10);
      expect(new Set(events.map(e => e.id)).size).toBe(10); // All unique IDs
    });
  });
});