// Simple analytics service for tracking user interactions
// Privacy-focused - no external services, data stays local

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000; // Limit stored events

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: properties || {},
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('sakulang-analytics', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics:', event, properties);
    }
  }

  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  trackSessionStart(config: any) {
    this.track('session_start', config);
  }

  trackSessionComplete(result: any) {
    this.track('session_complete', result);
  }

  trackError(error: string, context?: string) {
    this.track('error', { error, context });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
    localStorage.removeItem('sakulang-analytics');
  }

  // Load events from localStorage on initialization
  init() {
    try {
      const saved = localStorage.getItem('sakulang-analytics');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }
}

export const analytics = new Analytics();

// Initialize on import
analytics.init();