// SAKULANG Notification Service
// Smart learning reminders and achievements

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  studyTime: string; // HH:MM format
  achievements: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: number;
  type: 'daily' | 'achievement' | 'streak' | 'weekly';
  data?: any;
}

class NotificationService {
  private settings: NotificationSettings = {
    enabled: false,
    dailyReminder: true,
    studyTime: '19:00', // 7 PM default
    achievements: true,
    streakReminder: true,
    weeklyReport: true
  };

  private scheduledNotifications: ScheduledNotification[] = [];

  constructor() {
    this.loadSettings();
    this.setupServiceWorkerMessaging();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('sakulang-notification-settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('sakulang-notification-settings', JSON.stringify(this.settings));
  }

  // Request Permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.settings.enabled = true;
      this.saveSettings();
      this.scheduleNotifications();
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    this.settings.enabled = granted;
    this.saveSettings();
    
    if (granted) {
      this.scheduleNotifications();
    }
    
    return granted;
  }

  // Update Settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.settings.enabled) {
      this.scheduleNotifications();
    } else {
      this.clearAllNotifications();
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Show Immediate Notification
  async showNotification(title: string, body: string, options?: NotificationOptions): Promise<void> {
    if (!this.settings.enabled || Notification.permission !== 'granted') {
      return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Use service worker for better reliability
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, options }
      });
    } else {
      // Fallback to direct notification
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  }

  // Achievement Notifications
  async showAchievement(achievement: string, description: string): Promise<void> {
    if (!this.settings.achievements) return;

    await this.showNotification(
      `🏆 Achievement Unlocked!`,
      `${achievement}: ${description}`,
      {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'achievement',
        requireInteraction: true,
        data: { actions: ['view', 'dismiss'] }
      }
    );
  }

  // Streak Notifications
  async showStreakReminder(days: number): Promise<void> {
    if (!this.settings.streakReminder) return;

    const messages = [
      `🔥 ${days} day streak! Keep it going!`,
      `💪 Amazing ${days} day streak! You're on fire!`,
      `⭐ ${days} days in a row! You're unstoppable!`
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    await this.showNotification('SAKULANG Streak', message || 'Keep your streak going!', {
      icon: '/icon-192.png',
      tag: 'streak'
    });
  }

  // Schedule Notifications
  private scheduleNotifications(): void {
    this.clearAllNotifications();

    if (this.settings.dailyReminder) {
      this.scheduleDailyReminder();
    }

    if (this.settings.weeklyReport) {
      this.scheduleWeeklyReport();
    }
  }

  private scheduleDailyReminder(): void {
    const timeParts = this.settings.studyTime.split(':');
    const hours = parseInt(timeParts[0] || '19', 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const notification: ScheduledNotification = {
      id: 'daily-reminder',
      title: '📚 Time to Learn!',
      body: 'Ready for your daily language practice? Let\'s keep your streak going!',
      scheduledTime: scheduledTime.getTime(),
      type: 'daily'
    };

    this.scheduleNotification(notification);
  }

  private scheduleWeeklyReport(): void {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(10, 0, 0, 0); // 10 AM on Sunday

    const notification: ScheduledNotification = {
      id: 'weekly-report',
      title: '📊 Weekly Progress Report',
      body: 'Check out your learning progress from this week!',
      scheduledTime: nextSunday.getTime(),
      type: 'weekly'
    };

    this.scheduleNotification(notification);
  }

  private scheduleNotification(notification: ScheduledNotification): void {
    const delay = notification.scheduledTime - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(notification.title, notification.body);
        
        // Reschedule recurring notifications
        if (notification.type === 'daily') {
          this.scheduleDailyReminder();
        } else if (notification.type === 'weekly') {
          this.scheduleWeeklyReport();
        }
      }, delay);

      this.scheduledNotifications.push(notification);
    }
  }

  private clearAllNotifications(): void {
    // Clear scheduled notifications (this is simplified - in a real app you'd track timeouts)
    this.scheduledNotifications = [];
  }

  // Service Worker Integration
  private setupServiceWorkerMessaging(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICKED') {
          this.handleNotificationClick(event.data.payload);
        }
      });
    }
  }

  private handleNotificationClick(data: any): void {
    // Handle notification clicks
    switch (data.action) {
      case 'view':
        window.focus();
        // Navigate to progress page
        break;
      case 'start-learning':
        window.focus();
        // Navigate to learning page
        break;
      default:
        window.focus();
    }
  }

  // Test Notification
  async testNotification(): Promise<void> {
    await this.showNotification(
      '🧪 Test Notification',
      'SAKULANG notifications are working perfectly!',
      {
        icon: '/icon-192.png',
        tag: 'test'
      }
    );
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// React Hook
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    const updatePermission = () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    // Check permission periodically
    const interval = setInterval(updatePermission, 1000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    return granted;
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    notificationService.updateSettings(newSettings);
    setSettings(notificationService.getSettings());
  };

  return {
    settings,
    permission,
    requestPermission,
    updateSettings,
    showAchievement: notificationService.showAchievement.bind(notificationService),
    showStreakReminder: notificationService.showStreakReminder.bind(notificationService),
    testNotification: notificationService.testNotification.bind(notificationService)
  };
};