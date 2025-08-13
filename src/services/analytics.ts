// SAKULANG Analytics Service
// Privacy-focused analytics with user consent

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  sessionsToday: number;
  questionsAnswered: number;
  averageAccuracy: number;
  popularLanguages: Record<string, number>;
  popularFrameworks: Record<string, number>;
  userLocations: Record<string, number>;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadSettings();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSettings(): void {
    const consent = localStorage.getItem('sakulang-analytics-consent');
    this.isEnabled = consent === 'true';
    
    const savedUserId = localStorage.getItem('sakulang-user-id');
    if (savedUserId) {
      this.userId = savedUserId;
    } else {
      this.userId = this.generateUserId();
      localStorage.setItem('sakulang-user-id', this.userId);
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable/Disable Analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('sakulang-analytics-consent', enabled.toString());
    
    if (!enabled) {
      this.clearData();
    }
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  // Track Events
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        url: window.location.href
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    if (this.userId) {
      analyticsEvent.userId = this.userId;
    }

    this.events.push(analyticsEvent);
    this.saveToStorage();
    
    // Send to analytics endpoint (if available)
    this.sendToEndpoint(analyticsEvent);
  }

  // Common Events
  trackPageView(page: string): void {
    this.track('page_view', { page });
  }

  trackSessionStart(config: any): void {
    this.track('session_start', {
      track: config.track,
      framework: config.framework,
      level: config.level,
      mode: config.mode,
      questionCount: config.questionCount
    });
  }

  trackQuestionAnswered(questionId: string, isCorrect: boolean, timeSpent: number): void {
    this.track('question_answered', {
      questionId,
      isCorrect,
      timeSpent
    });
  }

  trackSessionComplete(results: any): void {
    this.track('session_complete', {
      score: results.scorePct,
      correct: results.correct,
      total: results.total,
      track: results.track,
      framework: results.framework,
      level: results.level,
      mode: results.mode
    });
  }

  trackThemeChange(theme: string): void {
    this.track('theme_change', { theme });
  }

  trackLanguageChange(language: string): void {
    this.track('language_change', { language });
  }

  trackFeatureUsed(feature: string, details?: any): void {
    this.track('feature_used', { feature, ...details });
  }

  // Get User Location (with consent)
  async getUserLocation(): Promise<{ country?: string; city?: string }> {
    if (!this.isEnabled) return {};

    try {
      // Use IP geolocation service (privacy-friendly)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name,
        city: data.city
      };
    } catch (error) {
      console.warn('Could not get user location:', error);
      return {};
    }
  }

  // Get Public Statistics
  async getPublicStats(): Promise<UserStats> {
    // This would typically come from your backend
    // For now, we'll simulate with local data
    const events = this.getAllEvents();
    
    const sessionsToday = events.filter(e => 
      e.event === 'session_start' && 
      new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length;

    const questionEvents = events.filter(e => e.event === 'question_answered');
    const correctAnswers = questionEvents.filter(e => e.properties?.isCorrect).length;
    
    const languageCount: Record<string, number> = {};
    const frameworkCount: Record<string, number> = {};
    
    events.filter(e => e.event === 'session_start').forEach(e => {
      const track = e.properties?.track;
      const framework = e.properties?.framework;
      
      if (track) languageCount[track] = (languageCount[track] || 0) + 1;
      if (framework) frameworkCount[framework] = (frameworkCount[framework] || 0) + 1;
    });

    return {
      totalUsers: new Set(events.map(e => e.userId)).size,
      activeUsers: new Set(
        events
          .filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000) // Last 24h
          .map(e => e.userId)
      ).size,
      sessionsToday,
      questionsAnswered: questionEvents.length,
      averageAccuracy: questionEvents.length > 0 ? (correctAnswers / questionEvents.length) * 100 : 0,
      popularLanguages: languageCount,
      popularFrameworks: frameworkCount,
      userLocations: {} // Would be populated from backend
    };
  }

  // Privacy Methods
  exportUserData(): AnalyticsEvent[] {
    return this.events.filter(e => e.userId === this.userId);
  }

  deleteUserData(): void {
    this.events = this.events.filter(e => e.userId !== this.userId);
    this.clearData();
    this.userId = this.generateUserId();
    localStorage.setItem('sakulang-user-id', this.userId);
  }

  private clearData(): void {
    this.events = [];
    localStorage.removeItem('sakulang-analytics-events');
  }

  private saveToStorage(): void {
    // Keep only last 1000 events to prevent storage bloat
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    localStorage.setItem('sakulang-analytics-events', JSON.stringify(this.events));
  }

  private getAllEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('sakulang-analytics-events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async sendToEndpoint(event: AnalyticsEvent): Promise<void> {
    // In a real app, you'd send to your analytics endpoint
    // For now, we'll just log it
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // Example endpoint call:
    /*
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
    */
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React Hook
import { useState, useEffect } from 'react';

export const useAnalytics = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const publicStats = await analytics.getPublicStats();
        setStats(publicStats);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    track: analytics.track.bind(analytics),
    isEnabled: analytics.isAnalyticsEnabled(),
    setEnabled: analytics.setEnabled.bind(analytics)
  };
};