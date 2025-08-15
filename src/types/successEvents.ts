// Success Events & Metrics Types
// Data models for tracking user achievements and progress

export interface SuccessEvent {
  id: string;
  userId: string;
  eventType: SuccessEventType;
  category: SuccessCategory;
  points: number;
  timestamp: string;
  metadata: SuccessEventMetadata;
  sessionId?: string;
  streakDay?: number;
  multiplier?: number;
}

export type SuccessEventType = 
  // Learning Events
  | 'quiz_completed'
  | 'study_session_completed'
  | 'exam_completed'
  | 'perfect_score'
  | 'improvement_milestone'
  | 'question_answered_correct'
  | 'question_answered_incorrect'
  | 'session_started'
  | 'session_finished'
  
  // Focus Events
  | 'focus_session_started'
  | 'focus_session_completed'
  | 'focus_milestone_reached'
  | 'deep_focus_achieved'
  | 'focus_streak_maintained'
  
  // Streak Events
  | 'daily_streak_started'
  | 'daily_streak_continued'
  | 'weekly_streak_achieved'
  | 'monthly_streak_achieved'
  | 'streak_milestone'
  
  // Achievement Events
  | 'level_up'
  | 'badge_earned'
  | 'milestone_reached'
  | 'personal_best'
  | 'challenge_completed'
  
  // Social Events
  | 'leaderboard_position'
  | 'helped_others'
  | 'community_contribution';

export type SuccessCategory = 
  | 'learning'
  | 'focus'
  | 'streak'
  | 'achievement'
  | 'social'
  | 'milestone';

export interface SuccessEventMetadata {
  // Learning specific
  track?: string;
  framework?: string;
  level?: string;
  mode?: string;
  questionsTotal?: number;
  questionsCorrect?: number;
  scorePct?: number;
  timeSpent?: number; // milliseconds
  
  // Focus specific
  focusDuration?: number; // minutes
  focusType?: 'pomodoro' | 'deep_work' | 'study_session';
  distractions?: number;
  productivity?: number; // 1-10 scale
  
  // Streak specific
  streakLength?: number;
  streakType?: 'daily' | 'weekly' | 'monthly';
  previousBest?: number;
  
  // Achievement specific
  achievementId?: string;
  achievementName?: string;
  difficulty?: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Context
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Additional data
  [key: string]: any;
}

export interface UserMetrics {
  userId: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  
  // Learning metrics
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  timeSpent: number; // total minutes
  
  // Focus metrics
  totalFocusTime: number; // minutes
  focusSessions: number;
  averageFocusSession: number; // minutes
  longestFocusSession: number; // minutes
  
  // Streak metrics
  currentStreak: number;
  longestStreak: number;
  streakType: 'daily' | 'weekly' | 'monthly';
  lastActivityDate: string;
  
  // Achievement metrics
  badgesEarned: number;
  milestonesReached: number;
  challengesCompleted: number;
  
  // Rankings
  globalRank?: number;
  categoryRanks?: Record<SuccessCategory, number>;
  
  // Recent activity
  recentEvents: SuccessEvent[];
  
  // Calculated metrics
  consistency: number; // 0-100 score
  improvement: number; // percentage change
  engagement: number; // 0-100 score
  
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SuccessCategory;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: string;
  progress?: number; // 0-100
}

export interface AchievementRequirement {
  type: 'event_count' | 'streak_length' | 'score_threshold' | 'time_spent' | 'custom';
  eventType?: SuccessEventType;
  category?: SuccessCategory;
  threshold: number;
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
  metadata?: Record<string, any>;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  category: SuccessCategory;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  points: number;
  rank: number;
  change?: number; // position change from previous period
  metrics?: Record<string, number>;
  isCurrentUser?: boolean;
}

export interface SuccessMetricsConfig {
  // Point values for different events
  pointValues: Record<SuccessEventType, number>;
  
  // Multipliers
  streakMultipliers: Record<number, number>; // streak length -> multiplier
  difficultyMultipliers: Record<string, number>;
  timeOfDayMultipliers: Record<string, number>;
  
  // Level progression
  levelThresholds: number[]; // XP required for each level
  
  // Achievement definitions
  achievements: Achievement[];
  
  // Leaderboard settings
  leaderboardSettings: {
    maxEntries: number;
    updateFrequency: number; // minutes
    categories: SuccessCategory[];
  };
  
  // Streak settings
  streakSettings: {
    dailyRequirement: number; // minutes of activity
    weeklyRequirement: number;
    monthlyRequirement: number;
    graceHours: number; // hours of grace period
  };
}

export interface SuccessEventFilter {
  userId?: string;
  eventTypes?: SuccessEventType[];
  categories?: SuccessCategory[];
  startDate?: string;
  endDate?: string;
  minPoints?: number;
  maxPoints?: number;
  sessionId?: string;
  limit?: number;
  offset?: number;
}

export interface MetricsAggregation {
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  data: MetricsDataPoint[];
}

export interface MetricsDataPoint {
  timestamp: string;
  totalEvents: number;
  totalPoints: number;
  uniqueUsers: number;
  averageScore?: number;
  categories: Record<SuccessCategory, number>;
  eventTypes: Record<SuccessEventType, number>;
}

export interface PersonalStats {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all_time';
  
  // Summary
  totalPoints: number;
  totalEvents: number;
  averageDaily: number;
  
  // Learning stats
  sessionsCompleted: number;
  questionsAnswered: number;
  averageScore: number;
  timeSpent: number;
  
  // Focus stats
  focusTime: number;
  focusSessions: number;
  averageFocusLength: number;
  
  // Streak stats
  currentStreak: number;
  streakDays: number;
  
  // Progress
  levelProgress: {
    currentLevel: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number; // 0-100
  };
  
  // Trends
  trends: {
    pointsChange: number; // percentage
    scoreChange: number;
    streakChange: number;
    focusChange: number;
  };
  
  // Top categories
  topCategories: Array<{
    category: SuccessCategory;
    points: number;
    percentage: number;
  }>;
  
  // Recent achievements
  recentAchievements: Achievement[];
}

// Event creation helpers
export interface CreateSuccessEventParams {
  userId: string;
  eventType: SuccessEventType;
  metadata?: Partial<SuccessEventMetadata>;
  sessionId?: string;
  customPoints?: number;
}

export interface BatchSuccessEventParams {
  events: CreateSuccessEventParams[];
  validateEvents?: boolean;
  skipDuplicates?: boolean;
}