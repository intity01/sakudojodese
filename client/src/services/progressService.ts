export interface UserProgress {
  completedLessons: string[];
  quizScores: { [lessonId: string]: QuizScore };
  totalPoints: number;
  streak: number;
  lastStudyDate: string;
  level: number;
  achievements: string[];
  studyHistory: StudyHistoryItem[];
}

export interface QuizScore {
  lessonId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  attempts: number;
}

export interface StudyHistoryItem {
  id: string;
  type: 'lesson' | 'quiz' | 'flashcard';
  lessonId?: string;
  title: string;
  date: string;
  score?: number;
  duration?: number;
}

const STORAGE_KEY = 'sakulang-progress';

class ProgressService {
  private progress: UserProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): UserProgress {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }

    return {
      completedLessons: [],
      quizScores: {},
      totalPoints: 0,
      streak: 0,
      lastStudyDate: '',
      level: 1,
      achievements: [],
      studyHistory: [],
    };
  }

  private saveProgress(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
  }

  getProgress(): UserProgress {
    return { ...this.progress };
  }

  // Mark lesson as completed
  completeLesson(lessonId: string, lessonTitle: string): void {
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
      this.progress.totalPoints += 10;
      this.addToHistory({
        id: `lesson-${Date.now()}`,
        type: 'lesson',
        lessonId,
        title: lessonTitle,
        date: new Date().toISOString(),
      });
      this.updateStreak();
      this.checkLevelUp();
      this.saveProgress();
    }
  }

  // Save quiz score
  saveQuizScore(lessonId: string, lessonTitle: string, score: number, totalQuestions: number): void {
    const percentage = Math.round((score / totalQuestions) * 100);
    const points = score * 5;

    const existingScore = this.progress.quizScores[lessonId];
    const attempts = existingScore ? existingScore.attempts + 1 : 1;

    this.progress.quizScores[lessonId] = {
      lessonId,
      score: percentage,
      totalQuestions,
      completedAt: new Date().toISOString(),
      attempts,
    };

    // Award points only if it's a better score
    if (!existingScore || percentage > existingScore.score) {
      this.progress.totalPoints += points;
    }

    this.addToHistory({
      id: `quiz-${Date.now()}`,
      type: 'quiz',
      lessonId,
      title: lessonTitle,
      date: new Date().toISOString(),
      score: percentage,
    });

    this.updateStreak();
    this.checkLevelUp();
    this.checkAchievements(percentage);
    this.saveProgress();
  }

  // Add flashcard practice to history
  addFlashcardPractice(title: string, duration: number): void {
    this.progress.totalPoints += 3;
    this.addToHistory({
      id: `flashcard-${Date.now()}`,
      type: 'flashcard',
      title,
      date: new Date().toISOString(),
      duration,
    });
    this.updateStreak();
    this.saveProgress();
  }

  private addToHistory(item: StudyHistoryItem): void {
    this.progress.studyHistory.unshift(item);
    // Keep only last 50 items
    if (this.progress.studyHistory.length > 50) {
      this.progress.studyHistory = this.progress.studyHistory.slice(0, 50);
    }
  }

  private updateStreak(): void {
    const today = new Date().toDateString();
    const lastStudy = this.progress.lastStudyDate
      ? new Date(this.progress.lastStudyDate).toDateString()
      : '';

    if (lastStudy === today) {
      // Already studied today, don't change streak
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastStudy === yesterdayStr) {
      // Studied yesterday, increment streak
      this.progress.streak += 1;
    } else if (lastStudy === '') {
      // First time studying
      this.progress.streak = 1;
    } else {
      // Streak broken, reset to 1
      this.progress.streak = 1;
    }

    this.progress.lastStudyDate = new Date().toISOString();
  }

  private checkLevelUp(): void {
    const pointsForNextLevel = this.progress.level * 100;
    if (this.progress.totalPoints >= pointsForNextLevel) {
      this.progress.level += 1;
      this.unlockAchievement(`level_${this.progress.level}`);
    }
  }

  private checkAchievements(quizScore: number): void {
    // Perfect score achievement
    if (quizScore === 100) {
      this.unlockAchievement('perfect_score');
    }

    // Streak achievements
    if (this.progress.streak === 7) {
      this.unlockAchievement('week_streak');
    } else if (this.progress.streak === 30) {
      this.unlockAchievement('month_streak');
    }

    // Lesson completion achievements
    const completedCount = this.progress.completedLessons.length;
    if (completedCount === 5) {
      this.unlockAchievement('5_lessons');
    } else if (completedCount === 10) {
      this.unlockAchievement('10_lessons');
    } else if (completedCount === 20) {
      this.unlockAchievement('20_lessons');
    }
  }

  private unlockAchievement(achievementId: string): void {
    if (!this.progress.achievements.includes(achievementId)) {
      this.progress.achievements.push(achievementId);
      this.progress.totalPoints += 50;
    }
  }

  // Get statistics
  getStats() {
    const quizScores = Object.values(this.progress.quizScores);
    const averageScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((sum, q) => sum + q.score, 0) / quizScores.length)
        : 0;

    return {
      completedLessons: this.progress.completedLessons.length,
      totalQuizzes: quizScores.length,
      averageScore,
      totalPoints: this.progress.totalPoints,
      streak: this.progress.streak,
      level: this.progress.level,
      achievements: this.progress.achievements.length,
    };
  }

  // Check if lesson is completed
  isLessonCompleted(lessonId: string): boolean {
    return this.progress.completedLessons.includes(lessonId);
  }

  // Get quiz score for a lesson
  getQuizScore(lessonId: string): QuizScore | null {
    return this.progress.quizScores[lessonId] || null;
  }

  // Get recent history
  getRecentHistory(limit: number = 10): StudyHistoryItem[] {
    return this.progress.studyHistory.slice(0, limit);
  }

  // Reset progress (for testing)
  resetProgress(): void {
    this.progress = {
      completedLessons: [],
      quizScores: {},
      totalPoints: 0,
      streak: 0,
      lastStudyDate: '',
      level: 1,
      achievements: [],
      studyHistory: [],
    };
    this.saveProgress();
  }
}

export const progressService = new ProgressService();

