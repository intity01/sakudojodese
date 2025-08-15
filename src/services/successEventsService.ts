// Success Events Service
// Core service for tracking and managing user success events and metrics

import type {
  SuccessEvent,
  SuccessEventType,
  SuccessCategory,
  SuccessEventMetadata,
  UserMetrics,
  Achievement,
  Leaderboard,
  LeaderboardEntry,
  SuccessMetricsConfig,
  SuccessEventFilter,
  CreateSuccessEventParams,
  BatchSuccessEventParams,
  PersonalStats
} from '../types/successEvents';

// Default configuration
export const DEFAULT_SUCCESS_CONFIG: SuccessMetricsConfig = {
  pointValues: {
    // Learning events
    'quiz_completed': 50,
    'study_session_completed': 30,
    'exam_completed': 100,
    'perfect_score': 200,
    'improvement_milestone': 150,
    'question_answered_correct': 5,
    'question_answered_incorrect': 1,
    'session_started': 5,
    'session_finished': 10,
    
    // Focus events
    'focus_session_started': 10,
    'focus_session_completed': 25,
    'focus_milestone_reached': 75,
    'deep_focus_achieved': 100,
    'focus_streak_maintained': 50,
    
    // Streak events
    'daily_streak_started': 20,
    'daily_streak_continued': 15,
    'weekly_streak_achieved': 100,
    'monthly_streak_achieved': 500,
    'streak_milestone': 200,
    
    // Achievement events
    'level_up': 300,
    'badge_earned': 100,
    'milestone_reached': 250,
    'personal_best': 150,
    'challenge_completed': 200,
    
    // Social events
    'leaderboard_position': 100,
    'helped_others': 50,
    'community_contribution': 75
  },
  
  streakMultipliers: {
    1: 1.0,
    3: 1.1,
    7: 1.2,
    14: 1.3,
    30: 1.5,
    60: 1.7,
    100: 2.0
  },
  
  difficultyMultipliers: {
    'Beginner': 1.0,
    'Intermediate': 1.2,
    'Advanced': 1.5,
    'Expert': 2.0,
    'A1': 1.0,
    'A2': 1.1,
    'B1': 1.3,
    'B2': 1.5,
    'C1': 1.8,
    'C2': 2.0,
    'N5': 1.0,
    'N4': 1.2,
    'N3': 1.5,
    'N2': 1.8,
    'N1': 2.0
  },
  
  timeOfDayMultipliers: {
    'morning': 1.1,
    'afternoon': 1.0,
    'evening': 1.0,
    'night': 0.9
  },
  
  levelThresholds: [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000,
    17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 107000
  ],
  
  achievements: [], // Will be populated later
  
  leaderboardSettings: {
    maxEntries: 100,
    updateFrequency: 15, // 15 minutes
    categories: ['learning', 'focus', 'streak', 'achievement']
  },
  
  streakSettings: {
    dailyRequirement: 15, // 15 minutes
    weeklyRequirement: 120, // 2 hours
    monthlyRequirement: 600, // 10 hours
    graceHours: 6 // 6 hour grace period
  }
};

export class SuccessEventsService {
  private config: SuccessMetricsConfig;
  private events: Map<string, SuccessEvent[]> = new Map(); // userId -> events
  private userMetrics: Map<string, UserMetrics> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();

  constructor(config: SuccessMetricsConfig = DEFAULT_SUCCESS_CONFIG) {
    this.config = config;
    this.initializeService();
  }

  private initializeService(): void {
    console.log('[SuccessEvents] Initializing success events service');
    
    // Set up periodic leaderboard updates
    setInterval(() => {
      this.updateLeaderboards();
    }, this.config.leaderboardSettings.updateFrequency * 60 * 1000);
    
    // Set up daily streak checks
    setInterval(() => {
      this.checkDailyStreaks();
    }, 60 * 60 * 1000); // Check every hour
  }

  // Event creation and tracking
  async createSuccessEvent(params: CreateSuccessEventParams): Promise<SuccessEvent> {
    const event: SuccessEvent = {
      id: this.generateEventId(),
      userId: params.userId,
      eventType: params.eventType,
      category: this.getCategoryForEventType(params.eventType),
      points: params.customPoints || this.calculatePoints(params.eventType, params.metadata),
      timestamp: new Date().toISOString(),
      metadata: params.metadata || {},
      sessionId: params.sessionId
    };

    // Apply multipliers
    event.points = this.applyMultipliers(event);

    // Store event
    if (!this.events.has(params.userId)) {
      this.events.set(params.userId, []);
    }
    this.events.get(params.userId)!.push(event);

    // Update user metrics
    await this.updateUserMetrics(params.userId, event);

    // Check for achievements
    await this.checkAchievements(params.userId, event);

    console.log(`[SuccessEvents] Created event: ${event.eventType} for user ${params.userId} (+${event.points} points)`);
    
    return event;
  }

  async createBatchEvents(params: BatchSuccessEventParams): Promise<SuccessEvent[]> {
    const createdEvents: SuccessEvent[] = [];
    
    for (const eventParams of params.events) {
      try {
        // Skip duplicates if requested
        if (params.skipDuplicates && await this.isDuplicateEvent(eventParams)) {
          continue;
        }
        
        const event = await this.createSuccessEvent(eventParams);
        createdEvents.push(event);
      } catch (error) {
        console.error('[SuccessEvents] Failed to create event:', error);
        if (!params.validateEvents) {
          throw error; // Re-throw if not in validation mode
        }
      }
    }
    
    return createdEvents;
  }

  // User metrics management
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    if (!this.userMetrics.has(userId)) {
      await this.initializeUserMetrics(userId);
    }
    
    return this.userMetrics.get(userId)!;
  }

  private async initializeUserMetrics(userId: string): Promise<void> {
    const metrics: UserMetrics = {
      userId,
      totalPoints: 0,
      level: 1,
      experiencePoints: 0,
      experienceToNextLevel: this.config.levelThresholds[1],
      
      totalSessions: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      timeSpent: 0,
      
      totalFocusTime: 0,
      focusSessions: 0,
      averageFocusSession: 0,
      longestFocusSession: 0,
      
      currentStreak: 0,
      longestStreak: 0,
      streakType: 'daily',
      lastActivityDate: new Date().toISOString(),
      
      badgesEarned: 0,
      milestonesReached: 0,
      challengesCompleted: 0,
      
      recentEvents: [],
      
      consistency: 0,
      improvement: 0,
      engagement: 0,
      
      lastUpdated: new Date().toISOString()
    };
    
    this.userMetrics.set(userId, metrics);
  }

  private async updateUserMetrics(userId: string, event: SuccessEvent): Promise<void> {
    const metrics = await this.getUserMetrics(userId);
    
    // Update basic metrics
    metrics.totalPoints += event.points;
    metrics.experiencePoints += event.points;
    
    // Check for level up
    const newLevel = this.calculateLevel(metrics.experiencePoints);
    if (newLevel > metrics.level) {
      metrics.level = newLevel;
      // Create level up event
      await this.createSuccessEvent({
        userId,
        eventType: 'level_up',
        metadata: { newLevel, previousLevel: metrics.level - 1 }
      });
    }
    
    metrics.experienceToNextLevel = this.config.levelThresholds[metrics.level] - metrics.experiencePoints;
    
    // Update category-specific metrics
    await this.updateCategoryMetrics(metrics, event);
    
    // Update recent events (keep last 10)
    metrics.recentEvents.unshift(event);
    if (metrics.recentEvents.length > 10) {
      metrics.recentEvents = metrics.recentEvents.slice(0, 10);
    }
    
    // Update calculated metrics
    await this.updateCalculatedMetrics(metrics);
    
    metrics.lastUpdated = new Date().toISOString();
    this.userMetrics.set(userId, metrics);
  }
} 
 private async updateCategoryMetrics(metrics: UserMetrics, event: SuccessEvent): Promise<void> {
    switch (event.category) {
      case 'learning':
        if (event.eventType === 'session_finished') {
          metrics.totalSessions++;
          if (event.metadata.timeSpent) {
            metrics.timeSpent += Math.round(event.metadata.timeSpent / 60000); // Convert to minutes
          }
        }
        if (event.eventType === 'question_answered_correct') {
          metrics.correctAnswers++;
          metrics.totalQuestions++;
        }
        if (event.eventType === 'question_answered_incorrect') {
          metrics.totalQuestions++;
        }
        // Recalculate average score
        if (metrics.totalQuestions > 0) {
          metrics.averageScore = (metrics.correctAnswers / metrics.totalQuestions) * 100;
        }
        break;
        
      case 'focus':
        if (event.eventType === 'focus_session_completed') {
          metrics.focusSessions++;
          if (event.metadata.focusDuration) {
            metrics.totalFocusTime += event.metadata.focusDuration;
            metrics.averageFocusSession = metrics.totalFocusTime / metrics.focusSessions;
            if (event.metadata.focusDuration > metrics.longestFocusSession) {
              metrics.longestFocusSession = event.metadata.focusDuration;
            }
          }
        }
        break;
        
      case 'streak':
        if (event.metadata.streakLength) {
          metrics.currentStreak = event.metadata.streakLength;
          if (event.metadata.streakLength > metrics.longestStreak) {
            metrics.longestStreak = event.metadata.streakLength;
          }
        }
        break;
        
      case 'achievement':
        if (event.eventType === 'badge_earned') {
          metrics.badgesEarned++;
        }
        if (event.eventType === 'milestone_reached') {
          metrics.milestonesReached++;
        }
        if (event.eventType === 'challenge_completed') {
          metrics.challengesCompleted++;
        }
        break;
    }
  }

  private async updateCalculatedMetrics(metrics: UserMetrics): Promise<void> {
    const userEvents = this.events.get(metrics.userId) || [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate consistency (activity over last 30 days)
    const recentEvents = userEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo);
    const activeDays = new Set(recentEvents.map(e => new Date(e.timestamp).toDateString())).size;
    metrics.consistency = Math.min(100, (activeDays / 30) * 100);
    
    // Calculate improvement (score trend over time)
    const learningEvents = userEvents.filter(e => e.category === 'learning' && e.metadata.scorePct);
    if (learningEvents.length >= 10) {
      const recent = learningEvents.slice(-5).reduce((sum, e) => sum + (e.metadata.scorePct || 0), 0) / 5;
      const older = learningEvents.slice(-10, -5).reduce((sum, e) => sum + (e.metadata.scorePct || 0), 0) / 5;
      metrics.improvement = ((recent - older) / older) * 100;
    }
    
    // Calculate engagement (activity frequency and variety)
    const eventTypes = new Set(recentEvents.map(e => e.eventType)).size;
    const eventFrequency = recentEvents.length / 30; // events per day
    metrics.engagement = Math.min(100, (eventTypes * 10) + (eventFrequency * 5));
  }

  // Points calculation
  private calculatePoints(eventType: SuccessEventType, metadata?: SuccessEventMetadata): number {
    let basePoints = this.config.pointValues[eventType] || 0;
    
    // Apply score-based bonus for learning events
    if (metadata?.scorePct && eventType.includes('completed')) {
      const scoreBonus = Math.floor(metadata.scorePct / 10) * 5; // 5 points per 10% score
      basePoints += scoreBonus;
    }
    
    return basePoints;
  }

  private applyMultipliers(event: SuccessEvent): number {
    let points = event.points;
    
    // Streak multiplier
    if (event.metadata.streakLength) {
      const multiplier = this.getStreakMultiplier(event.metadata.streakLength);
      points *= multiplier;
      event.multiplier = multiplier;
    }
    
    // Difficulty multiplier
    if (event.metadata.level) {
      const multiplier = this.config.difficultyMultipliers[event.metadata.level] || 1.0;
      points *= multiplier;
    }
    
    // Time of day multiplier
    if (event.metadata.timeOfDay) {
      const multiplier = this.config.timeOfDayMultipliers[event.metadata.timeOfDay] || 1.0;
      points *= multiplier;
    }
    
    return Math.round(points);
  }

  private getStreakMultiplier(streakLength: number): number {
    const thresholds = Object.keys(this.config.streakMultipliers)
      .map(Number)
      .sort((a, b) => b - a); // Sort descending
    
    for (const threshold of thresholds) {
      if (streakLength >= threshold) {
        return this.config.streakMultipliers[threshold];
      }
    }
    
    return 1.0;
  }

  private calculateLevel(experiencePoints: number): number {
    for (let i = this.config.levelThresholds.length - 1; i >= 0; i--) {
      if (experiencePoints >= this.config.levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Achievement system
  private async checkAchievements(userId: string, event: SuccessEvent): Promise<void> {
    const userEvents = this.events.get(userId) || [];
    const metrics = await this.getUserMetrics(userId);
    
    for (const achievement of this.config.achievements) {
      if (await this.hasAchievement(userId, achievement.id)) {
        continue; // Already earned
      }
      
      if (await this.checkAchievementRequirements(achievement, userEvents, metrics, event)) {
        await this.awardAchievement(userId, achievement);
      }
    }
  }

  private async checkAchievementRequirements(
    achievement: Achievement,
    userEvents: SuccessEvent[],
    metrics: UserMetrics,
    currentEvent: SuccessEvent
  ): Promise<boolean> {
    for (const requirement of achievement.requirements) {
      if (!await this.checkSingleRequirement(requirement, userEvents, metrics, currentEvent)) {
        return false;
      }
    }
    return true;
  }

  private async checkSingleRequirement(
    requirement: any,
    userEvents: SuccessEvent[],
    metrics: UserMetrics,
    currentEvent: SuccessEvent
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'event_count':
        const eventCount = userEvents.filter(e => 
          (!requirement.eventType || e.eventType === requirement.eventType) &&
          (!requirement.category || e.category === requirement.category)
        ).length;
        return eventCount >= requirement.threshold;
        
      case 'streak_length':
        return metrics.currentStreak >= requirement.threshold;
        
      case 'score_threshold':
        return metrics.averageScore >= requirement.threshold;
        
      case 'time_spent':
        return metrics.timeSpent >= requirement.threshold;
        
      default:
        return false;
    }
  }

  private async awardAchievement(userId: string, achievement: Achievement): Promise<void> {
    // Create achievement event
    await this.createSuccessEvent({
      userId,
      eventType: 'badge_earned',
      metadata: {
        achievementId: achievement.id,
        achievementName: achievement.name,
        difficulty: achievement.difficulty
      },
      customPoints: achievement.points
    });
    
    console.log(`[SuccessEvents] Achievement earned: ${achievement.name} by user ${userId}`);
  }

  private async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const userEvents = this.events.get(userId) || [];
    return userEvents.some(e => 
      e.eventType === 'badge_earned' && 
      e.metadata.achievementId === achievementId
    );
  }

  // Leaderboard management
  private async updateLeaderboards(): Promise<void> {
    console.log('[SuccessEvents] Updating leaderboards...');
    
    for (const category of this.config.leaderboardSettings.categories) {
      await this.updateCategoryLeaderboard(category, 'daily');
      await this.updateCategoryLeaderboard(category, 'weekly');
      await this.updateCategoryLeaderboard(category, 'monthly');
      await this.updateCategoryLeaderboard(category, 'all_time');
    }
  }

  private async updateCategoryLeaderboard(
    category: SuccessCategory,
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'
  ): Promise<void> {
    const leaderboardId = `${category}_${timeframe}`;
    const entries: LeaderboardEntry[] = [];
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all_time':
        startDate = new Date(0);
        break;
    }
    
    // Calculate points for each user
    const userPoints = new Map<string, number>();
    
    for (const [userId, events] of this.events.entries()) {
      const relevantEvents = events.filter(e => 
        e.category === category && 
        new Date(e.timestamp) >= startDate
      );
      
      const totalPoints = relevantEvents.reduce((sum, e) => sum + e.points, 0);
      if (totalPoints > 0) {
        userPoints.set(userId, totalPoints);
      }
    }
    
    // Create leaderboard entries
    const sortedUsers = Array.from(userPoints.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.leaderboardSettings.maxEntries);
    
    sortedUsers.forEach(([userId, points], index) => {
      entries.push({
        userId,
        username: `User${userId.substring(0, 8)}`, // Mock username
        points,
        rank: index + 1
      });
    });
    
    const leaderboard: Leaderboard = {
      id: leaderboardId,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${timeframe.replace('_', ' ')}`,
      description: `Top performers in ${category} for ${timeframe.replace('_', ' ')}`,
      category,
      timeframe,
      entries,
      lastUpdated: new Date().toISOString()
    };
    
    this.leaderboards.set(leaderboardId, leaderboard);
  }

  // Query methods
  async getEvents(filter: SuccessEventFilter): Promise<SuccessEvent[]> {
    let allEvents: SuccessEvent[] = [];
    
    if (filter.userId) {
      allEvents = this.events.get(filter.userId) || [];
    } else {
      // Get all events from all users
      for (const events of this.events.values()) {
        allEvents.push(...events);
      }
    }
    
    // Apply filters
    let filteredEvents = allEvents;
    
    if (filter.eventTypes) {
      filteredEvents = filteredEvents.filter(e => filter.eventTypes!.includes(e.eventType));
    }
    
    if (filter.categories) {
      filteredEvents = filteredEvents.filter(e => filter.categories!.includes(e.category));
    }
    
    if (filter.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= filter.startDate!);
    }
    
    if (filter.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= filter.endDate!);
    }
    
    if (filter.minPoints) {
      filteredEvents = filteredEvents.filter(e => e.points >= filter.minPoints!);
    }
    
    if (filter.maxPoints) {
      filteredEvents = filteredEvents.filter(e => e.points <= filter.maxPoints!);
    }
    
    if (filter.sessionId) {
      filteredEvents = filteredEvents.filter(e => e.sessionId === filter.sessionId);
    }
    
    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    if (filter.offset) {
      filteredEvents = filteredEvents.slice(filter.offset);
    }
    
    if (filter.limit) {
      filteredEvents = filteredEvents.slice(0, filter.limit);
    }
    
    return filteredEvents;
  }

  async getLeaderboard(category: SuccessCategory, timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'): Promise<Leaderboard | null> {
    const leaderboardId = `${category}_${timeframe}`;
    return this.leaderboards.get(leaderboardId) || null;
  }

  async getUserRank(userId: string, category: SuccessCategory, timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(category, timeframe);
    if (!leaderboard) return null;
    
    const entry = leaderboard.entries.find(e => e.userId === userId);
    return entry?.rank || null;
  }

  // Utility methods
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCategoryForEventType(eventType: SuccessEventType): SuccessCategory {
    if (eventType.includes('quiz') || eventType.includes('study') || eventType.includes('exam') || eventType.includes('question') || eventType.includes('session')) {
      return 'learning';
    }
    if (eventType.includes('focus')) {
      return 'focus';
    }
    if (eventType.includes('streak')) {
      return 'streak';
    }
    if (eventType.includes('level') || eventType.includes('badge') || eventType.includes('milestone') || eventType.includes('challenge')) {
      return 'achievement';
    }
    if (eventType.includes('leaderboard') || eventType.includes('helped') || eventType.includes('community')) {
      return 'social';
    }
    return 'achievement';
  }

  private async isDuplicateEvent(params: CreateSuccessEventParams): Promise<boolean> {
    const userEvents = this.events.get(params.userId) || [];
    const recentEvents = userEvents.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 60000 // Last minute
    );
    
    return recentEvents.some(e => 
      e.eventType === params.eventType &&
      e.sessionId === params.sessionId
    );
  }

  private async checkDailyStreaks(): Promise<void> {
    console.log('[SuccessEvents] Checking daily streaks...');
    
    for (const [userId, metrics] of this.userMetrics.entries()) {
      const lastActivity = new Date(metrics.lastActivityDate);
      const now = new Date();
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      // Check if streak should be broken
      if (hoursSinceActivity > 24 + this.config.streakSettings.graceHours) {
        if (metrics.currentStreak > 0) {
          console.log(`[SuccessEvents] Streak broken for user ${userId} (${metrics.currentStreak} days)`);
          metrics.currentStreak = 0;
          this.userMetrics.set(userId, metrics);
        }
      }
    }
  }

  // Public API methods
  async getPersonalStats(userId: string, period: 'day' | 'week' | 'month' | 'year' | 'all_time'): Promise<PersonalStats> {
    const metrics = await this.getUserMetrics(userId);
    const events = await this.getEvents({ userId, limit: 1000 });
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all_time':
        startDate = new Date(0);
        break;
    }
    
    const periodEvents = events.filter(e => new Date(e.timestamp) >= startDate);
    
    // Calculate stats
    const totalPoints = periodEvents.reduce((sum, e) => sum + e.points, 0);
    const totalEvents = periodEvents.length;
    const days = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const averageDaily = totalPoints / days;
    
    // Learning stats
    const learningEvents = periodEvents.filter(e => e.category === 'learning');
    const sessionsCompleted = learningEvents.filter(e => e.eventType === 'session_finished').length;
    const questionsAnswered = learningEvents.filter(e => 
      e.eventType === 'question_answered_correct' || e.eventType === 'question_answered_incorrect'
    ).length;
    const correctAnswers = learningEvents.filter(e => e.eventType === 'question_answered_correct').length;
    const averageScore = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    const timeSpent = learningEvents.reduce((sum, e) => sum + (e.metadata.timeSpent || 0), 0) / 60000; // Convert to minutes
    
    // Focus stats
    const focusEvents = periodEvents.filter(e => e.category === 'focus');
    const focusTime = focusEvents.reduce((sum, e) => sum + (e.metadata.focusDuration || 0), 0);
    const focusSessions = focusEvents.filter(e => e.eventType === 'focus_session_completed').length;
    const averageFocusLength = focusSessions > 0 ? focusTime / focusSessions : 0;
    
    // Top categories
    const categoryPoints = new Map<SuccessCategory, number>();
    periodEvents.forEach(e => {
      categoryPoints.set(e.category, (categoryPoints.get(e.category) || 0) + e.points);
    });
    
    const topCategories = Array.from(categoryPoints.entries())
      .map(([category, points]) => ({
        category,
        points,
        percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0
      }))
      .sort((a, b) => b.points - a.points);
    
    return {
      userId,
      period,
      totalPoints,
      totalEvents,
      averageDaily,
      sessionsCompleted,
      questionsAnswered,
      averageScore,
      timeSpent,
      focusTime,
      focusSessions,
      averageFocusLength,
      currentStreak: metrics.currentStreak,
      streakDays: metrics.currentStreak,
      levelProgress: {
        currentLevel: metrics.level,
        currentXP: metrics.experiencePoints,
        nextLevelXP: this.config.levelThresholds[metrics.level] || metrics.experiencePoints,
        progress: metrics.experienceToNextLevel > 0 ? 
          ((metrics.experiencePoints - (this.config.levelThresholds[metrics.level - 1] || 0)) / 
           (this.config.levelThresholds[metrics.level] - (this.config.levelThresholds[metrics.level - 1] || 0))) * 100 : 100
      },
      trends: {
        pointsChange: 0, // Would calculate from previous period
        scoreChange: 0,
        streakChange: 0,
        focusChange: 0
      },
      topCategories,
      recentAchievements: [] // Would get from recent badge_earned events
    };
  }
}

// Export singleton service
export const successEventsService = new SuccessEventsService();