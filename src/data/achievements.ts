// Achievement Definitions
// Comprehensive achievement system for Saku Dojo

import type { Achievement, AchievementRequirement } from '../types/successEvents';

// Learning Achievements
export const learningAchievements: Achievement[] = [
  // First Steps
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first learning session',
    icon: '🎯',
    category: 'learning',
    difficulty: 'bronze',
    points: 50,
    requirements: [
      {
        type: 'event_count',
        eventType: 'session_finished',
        threshold: 1
      }
    ]
  },
  
  // Quiz Master Series
  {
    id: 'quiz_novice',
    name: 'Quiz Novice',
    description: 'Complete 10 quizzes',
    icon: '📝',
    category: 'learning',
    difficulty: 'bronze',
    points: 100,
    requirements: [
      {
        type: 'event_count',
        eventType: 'quiz_completed',
        threshold: 10
      }
    ]
  },
  {
    id: 'quiz_expert',
    name: 'Quiz Expert',
    description: 'Complete 50 quizzes',
    icon: '🏆',
    category: 'learning',
    difficulty: 'silver',
    points: 300,
    requirements: [
      {
        type: 'event_count',
        eventType: 'quiz_completed',
        threshold: 50
      }
    ]
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: '👑',
    category: 'learning',
    difficulty: 'gold',
    points: 500,
    requirements: [
      {
        type: 'event_count',
        eventType: 'quiz_completed',
        threshold: 100
      }
    ]
  },
  
  // Perfect Score Series
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve a perfect score',
    icon: '💯',
    category: 'learning',
    difficulty: 'silver',
    points: 200,
    requirements: [
      {
        type: 'event_count',
        eventType: 'perfect_score',
        threshold: 1
      }
    ]
  },
  {
    id: 'flawless_streak',
    name: 'Flawless Streak',
    description: 'Achieve 5 perfect scores',
    icon: '⭐',
    category: 'learning',
    difficulty: 'gold',
    points: 500,
    requirements: [
      {
        type: 'event_count',
        eventType: 'perfect_score',
        threshold: 5
      }
    ]
  },
  
  // Study Dedication
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Complete 25 study sessions',
    icon: '📚',
    category: 'learning',
    difficulty: 'silver',
    points: 250,
    requirements: [
      {
        type: 'event_count',
        eventType: 'study_session_completed',
        threshold: 25
      }
    ]
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 100 study sessions',
    icon: '🎓',
    category: 'learning',
    difficulty: 'gold',
    points: 600,
    requirements: [
      {
        type: 'event_count',
        eventType: 'study_session_completed',
        threshold: 100
      }
    ]
  },
  
  // Question Answering
  {
    id: 'hundred_questions',
    name: 'Hundred Questions',
    description: 'Answer 100 questions correctly',
    icon: '💡',
    category: 'learning',
    difficulty: 'bronze',
    points: 150,
    requirements: [
      {
        type: 'event_count',
        eventType: 'question_answered_correct',
        threshold: 100
      }
    ]
  },
  {
    id: 'thousand_questions',
    name: 'Thousand Questions',
    description: 'Answer 1000 questions correctly',
    icon: '🧠',
    category: 'learning',
    difficulty: 'gold',
    points: 800,
    requirements: [
      {
        type: 'event_count',
        eventType: 'question_answered_correct',
        threshold: 1000
      }
    ]
  },
  
  // High Performance
  {
    id: 'high_achiever',
    name: 'High Achiever',
    description: 'Maintain 90% average score',
    icon: '🌟',
    category: 'learning',
    difficulty: 'gold',
    points: 400,
    requirements: [
      {
        type: 'score_threshold',
        threshold: 90
      }
    ]
  },
  {
    id: 'excellence',
    name: 'Excellence',
    description: 'Maintain 95% average score',
    icon: '💎',
    category: 'learning',
    difficulty: 'platinum',
    points: 750,
    requirements: [
      {
        type: 'score_threshold',
        threshold: 95
      }
    ]
  }
];

// Focus Achievements
export const focusAchievements: Achievement[] = [
  // First Focus
  {
    id: 'first_focus',
    name: 'First Focus',
    description: 'Complete your first focus session',
    icon: '🎯',
    category: 'focus',
    difficulty: 'bronze',
    points: 50,
    requirements: [
      {
        type: 'event_count',
        eventType: 'focus_session_completed',
        threshold: 1
      }
    ]
  },
  
  // Focus Duration
  {
    id: 'focused_hour',
    name: 'Focused Hour',
    description: 'Complete 1 hour of focused work',
    icon: '⏰',
    category: 'focus',
    difficulty: 'bronze',
    points: 100,
    requirements: [
      {
        type: 'time_spent',
        threshold: 60 // 60 minutes
      }
    ]
  },
  {
    id: 'focus_marathon',
    name: 'Focus Marathon',
    description: 'Complete 10 hours of focused work',
    icon: '🏃',
    category: 'focus',
    difficulty: 'silver',
    points: 400,
    requirements: [
      {
        type: 'time_spent',
        threshold: 600 // 600 minutes
      }
    ]
  },
  {
    id: 'focus_master',
    name: 'Focus Master',
    description: 'Complete 50 hours of focused work',
    icon: '🧘',
    category: 'focus',
    difficulty: 'gold',
    points: 1000,
    requirements: [
      {
        type: 'time_spent',
        threshold: 3000 // 3000 minutes
      }
    ]
  },
  
  // Deep Focus
  {
    id: 'deep_focus',
    name: 'Deep Focus',
    description: 'Achieve deep focus state',
    icon: '🔥',
    category: 'focus',
    difficulty: 'silver',
    points: 200,
    requirements: [
      {
        type: 'event_count',
        eventType: 'deep_focus_achieved',
        threshold: 1
      }
    ]
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Achieve deep focus 10 times',
    icon: '☯️',
    category: 'focus',
    difficulty: 'gold',
    points: 600,
    requirements: [
      {
        type: 'event_count',
        eventType: 'deep_focus_achieved',
        threshold: 10
      }
    ]
  },
  
  // Focus Consistency
  {
    id: 'consistent_focus',
    name: 'Consistent Focus',
    description: 'Complete 20 focus sessions',
    icon: '📈',
    category: 'focus',
    difficulty: 'silver',
    points: 300,
    requirements: [
      {
        type: 'event_count',
        eventType: 'focus_session_completed',
        threshold: 20
      }
    ]
  }
];

// Streak Achievements
export const streakAchievements: Achievement[] = [
  // Daily Streaks
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    difficulty: 'bronze',
    points: 100,
    requirements: [
      {
        type: 'streak_length',
        threshold: 3
      }
    ]
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak',
    difficulty: 'silver',
    points: 250,
    requirements: [
      {
        type: 'streak_length',
        threshold: 7
      }
    ]
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streak',
    difficulty: 'gold',
    points: 750,
    requirements: [
      {
        type: 'streak_length',
        threshold: 30
      }
    ]
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '🚀',
    category: 'streak',
    difficulty: 'platinum',
    points: 1500,
    requirements: [
      {
        type: 'streak_length',
        threshold: 100
      }
    ]
  },
  
  // Streak Milestones
  {
    id: 'streak_milestone_10',
    name: 'Streak Milestone',
    description: 'Reach 10 streak milestones',
    icon: '🎯',
    category: 'streak',
    difficulty: 'gold',
    points: 500,
    requirements: [
      {
        type: 'event_count',
        eventType: 'streak_milestone',
        threshold: 10
      }
    ]
  }
];

// Social Achievements
export const socialAchievements: Achievement[] = [
  // Leaderboard
  {
    id: 'top_ten',
    name: 'Top Ten',
    description: 'Reach top 10 on any leaderboard',
    icon: '🏅',
    category: 'social',
    difficulty: 'silver',
    points: 300,
    requirements: [
      {
        type: 'event_count',
        eventType: 'leaderboard_position',
        threshold: 1
      }
    ]
  },
  {
    id: 'leaderboard_king',
    name: 'Leaderboard King',
    description: 'Reach #1 on any leaderboard',
    icon: '👑',
    category: 'social',
    difficulty: 'platinum',
    points: 1000,
    requirements: [
      {
        type: 'custom',
        threshold: 1,
        metadata: { leaderboardPosition: 1 }
      }
    ]
  },
  
  // Community
  {
    id: 'helpful_member',
    name: 'Helpful Member',
    description: 'Help other community members',
    icon: '🤝',
    category: 'social',
    difficulty: 'bronze',
    points: 150,
    requirements: [
      {
        type: 'event_count',
        eventType: 'helped_others',
        threshold: 5
      }
    ]
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Make significant community contributions',
    icon: '🌟',
    category: 'social',
    difficulty: 'gold',
    points: 600,
    requirements: [
      {
        type: 'event_count',
        eventType: 'community_contribution',
        threshold: 10
      }
    ]
  }
];

// Milestone Achievements
export const milestoneAchievements: Achievement[] = [
  // Level Milestones
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'milestone',
    difficulty: 'bronze',
    points: 200,
    requirements: [
      {
        type: 'custom',
        threshold: 5,
        metadata: { levelReached: 5 }
      }
    ]
  },
  {
    id: 'level_10',
    name: 'Experienced',
    description: 'Reach level 10',
    icon: '🎖️',
    category: 'milestone',
    difficulty: 'silver',
    points: 400,
    requirements: [
      {
        type: 'custom',
        threshold: 10,
        metadata: { levelReached: 10 }
      }
    ]
  },
  {
    id: 'level_20',
    name: 'Expert',
    description: 'Reach level 20',
    icon: '🏆',
    category: 'milestone',
    difficulty: 'gold',
    points: 800,
    requirements: [
      {
        type: 'custom',
        threshold: 20,
        metadata: { levelReached: 20 }
      }
    ]
  },
  
  // Point Milestones
  {
    id: 'points_1k',
    name: 'First Thousand',
    description: 'Earn 1,000 points',
    icon: '💰',
    category: 'milestone',
    difficulty: 'bronze',
    points: 100,
    requirements: [
      {
        type: 'custom',
        threshold: 1000,
        metadata: { totalPoints: 1000 }
      }
    ]
  },
  {
    id: 'points_10k',
    name: 'Ten Thousand',
    description: 'Earn 10,000 points',
    icon: '💎',
    category: 'milestone',
    difficulty: 'gold',
    points: 500,
    requirements: [
      {
        type: 'custom',
        threshold: 10000,
        metadata: { totalPoints: 10000 }
      }
    ]
  }
];

// Special Achievements
export const specialAchievements: Achievement[] = [
  // Time-based
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete sessions in the morning',
    icon: '🌅',
    category: 'achievement',
    difficulty: 'bronze',
    points: 150,
    requirements: [
      {
        type: 'custom',
        threshold: 10,
        metadata: { timeOfDay: 'morning' }
      }
    ]
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete sessions late at night',
    icon: '🦉',
    category: 'achievement',
    difficulty: 'bronze',
    points: 150,
    requirements: [
      {
        type: 'custom',
        threshold: 10,
        metadata: { timeOfDay: 'night' }
      }
    ]
  },
  
  // Speed
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete quizzes quickly with high accuracy',
    icon: '💨',
    category: 'achievement',
    difficulty: 'gold',
    points: 400,
    requirements: [
      {
        type: 'custom',
        threshold: 5,
        metadata: { fastCompletion: true, highAccuracy: true }
      }
    ]
  },
  
  // Variety
  {
    id: 'well_rounded',
    name: 'Well Rounded',
    description: 'Complete sessions in all learning modes',
    icon: '🎭',
    category: 'achievement',
    difficulty: 'silver',
    points: 300,
    requirements: [
      {
        type: 'custom',
        threshold: 1,
        metadata: { allModes: true }
      }
    ]
  },
  
  // Improvement
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Improve score significantly over time',
    icon: '📈',
    category: 'achievement',
    difficulty: 'gold',
    points: 500,
    requirements: [
      {
        type: 'custom',
        threshold: 20,
        metadata: { improvementPercentage: 20 }
      }
    ]
  }
];

// Combine all achievements
export const allAchievements: Achievement[] = [
  ...learningAchievements,
  ...focusAchievements,
  ...streakAchievements,
  ...socialAchievements,
  ...milestoneAchievements,
  ...specialAchievements
];

// Achievement categories for easy access
export const achievementsByCategory = {
  learning: learningAchievements,
  focus: focusAchievements,
  streak: streakAchievements,
  social: socialAchievements,
  milestone: milestoneAchievements,
  achievement: specialAchievements
};

// Achievement utilities
export const getAchievementById = (id: string): Achievement | undefined => {
  return allAchievements.find(achievement => achievement.id === id);
};

export const getAchievementsByDifficulty = (difficulty: Achievement['difficulty']): Achievement[] => {
  return allAchievements.filter(achievement => achievement.difficulty === difficulty);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return allAchievements.filter(achievement => achievement.category === category);
};

// Export default achievements for service
export default allAchievements;