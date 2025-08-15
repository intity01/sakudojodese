// Mock Success Events Service
// Mock implementation for testing leaderboard components

import type { 
  Leaderboard, 
  LeaderboardEntry, 
  SuccessCategory, 
  PersonalStats,
  Achievement
} from '../types/successEvents';

// Mock data
const mockUsers: LeaderboardEntry[] = [
  {
    userId: 'user1',
    username: 'sakura_learner',
    displayName: 'Sakura 🌸',
    avatar: null,
    points: 15420,
    rank: 1,
    change: 2,
    metrics: {
      quizzes: 45,
      focus_minutes: 320,
      streak_days: 28
    }
  },
  {
    userId: 'user2',
    username: 'ninja_student',
    displayName: 'Ninja Student 🥷',
    avatar: null,
    points: 12850,
    rank: 2,
    change: -1,
    metrics: {
      quizzes: 38,
      focus_minutes: 280,
      streak_days: 15
    }
  },
  {
    userId: 'user3',
    username: 'kanji_master',
    displayName: 'Kanji Master 漢字',
    avatar: null,
    points: 11200,
    rank: 3,
    change: 1,
    metrics: {
      quizzes: 52,
      focus_minutes: 195,
      streak_days: 42
    }
  },
  {
    userId: 'user4',
    username: 'grammar_guru',
    displayName: 'Grammar Guru 文法',
    avatar: null,
    points: 9800,
    rank: 4,
    change: 0,
    metrics: {
      quizzes: 35,
      focus_minutes: 220,
      streak_days: 18
    }
  },
  {
    userId: 'user5',
    username: 'vocab_master',
    displayName: 'Vocab Master 語彙',
    avatar: null,
    points: 9200,
    rank: 5,
    change: 3,
    metrics: {
      quizzes: 42,
      focus_minutes: 180,
      streak_days: 25
    }
  },
  {
    userId: 'user6',
    username: 'focus_champion',
    displayName: 'Focus Champion 集中',
    avatar: null,
    points: 8900,
    rank: 6,
    change: -2,
    metrics: {
      quizzes: 28,
      focus_minutes: 450,
      streak_days: 12
    }
  },
  {
    userId: 'current-user',
    username: 'you',
    displayName: 'You (Test User)',
    avatar: null,
    points: 8750,
    rank: 7,
    change: 3,
    metrics: {
      quizzes: 25,
      focus_minutes: 150,
      streak_days: 12
    },
    isCurrentUser: true
  },
  {
    userId: 'user8',
    username: 'streak_legend',
    displayName: 'Streak Legend 連続',
    avatar: null,
    points: 8200,
    rank: 8,
    change: 1,
    metrics: {
      quizzes: 30,
      focus_minutes: 120,
      streak_days: 65
    }
  },
  {
    userId: 'user9',
    username: 'quiz_queen',
    displayName: 'Quiz Queen 👑',
    avatar: null,
    points: 7800,
    rank: 9,
    change: -1,
    metrics: {
      quizzes: 68,
      focus_minutes: 90,
      streak_days: 8
    }
  },
  {
    userId: 'user10',
    username: 'study_samurai',
    displayName: 'Study Samurai 侍',
    avatar: null,
    points: 7500,
    rank: 10,
    change: 2,
    metrics: {
      quizzes: 33,
      focus_minutes: 200,
      streak_days: 20
    }
  }
];

const mockAchievements: Achievement[] = [
  {
    id: 'first_quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    points: 100,
    unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    points: 200,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '⭐',
    points: 150,
    unlockedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

class MockSuccessEventsService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getLeaderboard(
    category: SuccessCategory, 
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'
  ): Promise<Leaderboard> {
    await this.delay(800); // Simulate network delay

    // Adjust points based on category and timeframe
    let adjustedUsers = mockUsers.map(user => {
      let points = user.points;
      
      // Category adjustments
      switch (category) {
        case 'focus':
          points = Math.floor(points * 0.7 + (user.metrics?.focus_minutes || 0) * 2);
          break;
        case 'streak':
          points = Math.floor((user.metrics?.streak_days || 0) * 50);
          break;
        case 'achievement':
          points = Math.floor(points * 0.3);
          break;
        case 'social':
          points = Math.floor(points * 0.2);
          break;
        default: // learning
          points = Math.floor(points + (user.metrics?.quizzes || 0) * 10);
      }

      // Timeframe adjustments
      switch (timeframe) {
        case 'daily':
          points = Math.floor(points * 0.1);
          break;
        case 'weekly':
          points = Math.floor(points * 0.3);
          break;
        case 'monthly':
          points = Math.floor(points * 0.7);
          break;
        // all_time uses full points
      }

      return { ...user, points };
    });

    // Re-sort and re-rank
    adjustedUsers.sort((a, b) => b.points - a.points);
    adjustedUsers = adjustedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return {
      id: `${category}-${timeframe}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Leaderboard`,
      category,
      timeframe,
      description: `Top performers in ${category} for ${timeframe.replace('_', ' ')}`,
      lastUpdated: new Date().toISOString(),
      entries: adjustedUsers
    };
  }

  async getUserRank(
    userId: string, 
    category: SuccessCategory, 
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'
  ): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(category, timeframe);
    const user = leaderboard.entries.find(entry => entry.userId === userId);
    return user?.rank || null;
  }

  async getPersonalStats(
    userId: string, 
    timeframe: 'day' | 'week' | 'month' | 'all_time'
  ): Promise<PersonalStats> {
    await this.delay(600);

    const user = mockUsers.find(u => u.userId === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId,
      totalPoints: user.points,
      sessionsCompleted: user.metrics?.quizzes || 25,
      averageScore: 78.5,
      currentStreak: user.metrics?.streak_days || 12,
      longestStreak: Math.max(user.metrics?.streak_days || 12, 45),
      levelProgress: {
        currentLevel: Math.floor(user.points / 2000) + 1,
        currentXP: user.points % 2000,
        nextLevelXP: 2000,
        progress: ((user.points % 2000) / 2000) * 100
      },
      topCategories: [
        { category: 'learning', points: Math.floor(user.points * 0.4), percentage: 40 },
        { category: 'focus', points: Math.floor(user.points * 0.3), percentage: 30 },
        { category: 'streak', points: Math.floor(user.points * 0.2), percentage: 20 },
        { category: 'achievement', points: Math.floor(user.points * 0.1), percentage: 10 }
      ],
      recentAchievements: mockAchievements,
      timeframe
    };
  }

  async trackSuccessEvent(
    userId: string,
    category: SuccessCategory,
    eventType: string,
    points: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.delay(200);
    console.log('Mock: Tracked success event', {
      userId,
      category,
      eventType,
      points,
      metadata
    });
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    await this.delay(400);
    return mockAchievements;
  }
}

export const mockSuccessEventsService = new MockSuccessEventsService();