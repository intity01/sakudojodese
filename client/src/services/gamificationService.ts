export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'lessons' | 'quizzes' | 'streak' | 'score' | 'flashcards';
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface DailyGoal {
  type: 'lessons' | 'quizzes' | 'flashcards' | 'minutes';
  target: number;
  current: number;
  completed: boolean;
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎓',
    requirement: 1,
    type: 'lessons',
    points: 10,
  },
  {
    id: 'five_lessons',
    title: 'Getting Started',
    description: 'Complete 5 lessons',
    icon: '📚',
    requirement: 5,
    type: 'lessons',
    points: 50,
  },
  {
    id: 'ten_lessons',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: '🌟',
    requirement: 10,
    type: 'lessons',
    points: 100,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '💯',
    requirement: 100,
    type: 'score',
    points: 25,
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🏆',
    requirement: 10,
    type: 'quizzes',
    points: 75,
  },
  {
    id: 'streak_3',
    title: '3 Day Streak',
    description: 'Study for 3 days in a row',
    icon: '🔥',
    requirement: 3,
    type: 'streak',
    points: 30,
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: 'Study for 7 days in a row',
    icon: '⚡',
    requirement: 7,
    type: 'streak',
    points: 70,
  },
  {
    id: 'streak_30',
    title: '30 Day Streak',
    description: 'Study for 30 days in a row',
    icon: '👑',
    requirement: 30,
    type: 'streak',
    points: 300,
  },
  {
    id: 'flashcard_50',
    title: 'Vocabulary Builder',
    description: 'Review 50 flashcards',
    icon: '📇',
    requirement: 50,
    type: 'flashcards',
    points: 50,
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Average 80% or higher on quizzes',
    icon: '🎯',
    requirement: 80,
    type: 'score',
    points: 100,
  },
];

class GamificationService {
  private readonly STORAGE_KEY = 'sakulang_gamification';
  private readonly DAILY_GOALS_KEY = 'sakulang_daily_goals';
  private readonly BADGES_KEY = 'sakulang_badges';

  private loadData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
        totalPoints: 0,
      };
    }
    return JSON.parse(data);
  }

  private saveData(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  getAchievements(): Achievement[] {
    const data = this.loadData();
    return data.achievements;
  }

  checkAndUnlockAchievements(stats: {
    completedLessons: number;
    totalQuizzes: number;
    averageScore: number;
    streak: number;
    flashcardsReviewed: number;
    lastQuizScore?: number;
  }): Achievement[] {
    const data = this.loadData();
    const newlyUnlocked: Achievement[] = [];

    data.achievements.forEach((achievement: Achievement) => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'lessons':
          shouldUnlock = stats.completedLessons >= achievement.requirement;
          break;
        case 'quizzes':
          shouldUnlock = stats.totalQuizzes >= achievement.requirement;
          break;
        case 'score':
          if (achievement.id === 'perfect_score') {
            shouldUnlock = stats.lastQuizScore === 100;
          } else if (achievement.id === 'high_scorer') {
            shouldUnlock = stats.averageScore >= achievement.requirement;
          }
          break;
        case 'streak':
          shouldUnlock = stats.streak >= achievement.requirement;
          break;
        case 'flashcards':
          shouldUnlock = stats.flashcardsReviewed >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        data.totalPoints += achievement.points;
        newlyUnlocked.push(achievement);
      }
    });

    this.saveData(data);
    return newlyUnlocked;
  }

  getTotalPoints(): number {
    const data = this.loadData();
    return data.totalPoints;
  }

  getUnlockedCount(): number {
    const achievements = this.getAchievements();
    return achievements.filter(a => a.unlocked).length;
  }

  // Daily Goals
  getDailyGoals(): DailyGoal[] {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(this.DAILY_GOALS_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.goals;
      }
    }

    // Create new daily goals
    const goals: DailyGoal[] = [
      { type: 'lessons', target: 2, current: 0, completed: false },
      { type: 'quizzes', target: 3, current: 0, completed: false },
      { type: 'flashcards', target: 20, current: 0, completed: false },
    ];

    localStorage.setItem(
      this.DAILY_GOALS_KEY,
      JSON.stringify({ date: today, goals })
    );

    return goals;
  }

  updateDailyGoal(type: DailyGoal['type'], increment: number = 1) {
    const goals = this.getDailyGoals();
    const goal = goals.find(g => g.type === type);
    
    if (goal) {
      goal.current += increment;
      if (goal.current >= goal.target) {
        goal.completed = true;
      }

      const today = new Date().toDateString();
      localStorage.setItem(
        this.DAILY_GOALS_KEY,
        JSON.stringify({ date: today, goals })
      );
    }
  }

  getDailyGoalsProgress(): number {
    const goals = this.getDailyGoals();
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  }

  // Badges
  getBadges(): Badge[] {
    const stored = localStorage.getItem(this.BADGES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  awardBadge(name: string, icon: string, color: string) {
    const badges = this.getBadges();
    const newBadge: Badge = {
      id: `badge_${Date.now()}`,
      name,
      icon,
      color,
      earnedAt: new Date().toISOString(),
    };
    badges.push(newBadge);
    localStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    return newBadge;
  }

  // Level calculation
  calculateLevel(totalPoints: number): number {
    return Math.floor(totalPoints / 100) + 1;
  }

  getPointsToNextLevel(totalPoints: number): number {
    const currentLevel = this.calculateLevel(totalPoints);
    const pointsForNextLevel = currentLevel * 100;
    return pointsForNextLevel - totalPoints;
  }
}

export const gamificationService = new GamificationService();

