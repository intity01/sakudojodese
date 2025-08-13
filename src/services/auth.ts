// SAKULANG Authentication Service
// Secure user authentication with privacy focus

interface User {
  id: string;
  email?: string;
  username: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
    analytics: boolean;
  };
  stats: {
    totalSessions: number;
    totalQuestions: number;
    averageScore: number;
    streakDays: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.loadUser();
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private async loadUser(): Promise<void> {
    try {
      const savedUser = localStorage.getItem('sakulang-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.state = {
          user,
          isAuthenticated: true,
          isLoading: false
        };
      } else {
        this.state.isLoading = false;
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      this.state.isLoading = false;
    }
    this.notify();
  }

  // Guest/Anonymous Login
  async loginAsGuest(username?: string): Promise<User> {
    const user: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username || `Guest_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'default',
        language: 'en',
        notifications: true,
        analytics: false
      },
      stats: {
        totalSessions: 0,
        totalQuestions: 0,
        averageScore: 0,
        streakDays: 0
      }
    };

    this.state = {
      user,
      isAuthenticated: true,
      isLoading: false
    };

    localStorage.setItem('sakulang-user', JSON.stringify(user));
    this.notify();
    return user;
  }

  // Email/Password Registration (Future)
  async register(_email: string, _password: string, _username: string): Promise<User> {
    // This would integrate with your backend
    throw new Error('Email registration not implemented yet');
  }

  // Email/Password Login (Future)
  async login(_email: string, _password: string): Promise<User> {
    // This would integrate with your backend
    throw new Error('Email login not implemented yet');
  }

  // Social Login (Future)
  async loginWithGoogle(): Promise<User> {
    throw new Error('Google login not implemented yet');
  }

  async loginWithApple(): Promise<User> {
    throw new Error('Apple login not implemented yet');
  }

  // Logout
  async logout(): Promise<void> {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };

    localStorage.removeItem('sakulang-user');
    this.notify();
  }

  // Update User
  async updateUser(updates: Partial<User>): Promise<User> {
    if (!this.state.user) {
      throw new Error('No user logged in');
    }

    const updatedUser = {
      ...this.state.user,
      ...updates,
      lastLogin: new Date().toISOString()
    };

    this.state.user = updatedUser;
    localStorage.setItem('sakulang-user', JSON.stringify(updatedUser));
    this.notify();
    return updatedUser;
  }

  // Update Preferences
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<void> {
    if (!this.state.user) return;

    await this.updateUser({
      preferences: {
        ...this.state.user.preferences,
        ...preferences
      }
    });
  }

  // Update Stats
  async updateStats(stats: Partial<User['stats']>): Promise<void> {
    if (!this.state.user) return;

    await this.updateUser({
      stats: {
        ...this.state.user.stats,
        ...stats
      }
    });
  }

  // Get Current State
  getState(): AuthState {
    return this.state;
  }

  // Privacy Methods
  async exportUserData(): Promise<any> {
    return {
      user: this.state.user,
      analytics: localStorage.getItem('sakulang-analytics-events'),
      progress: localStorage.getItem('saku-dojo-progress')
    };
  }

  async deleteAccount(): Promise<void> {
    // Clear all user data
    localStorage.removeItem('sakulang-user');
    localStorage.removeItem('sakulang-analytics-events');
    localStorage.removeItem('sakulang-analytics-consent');
    localStorage.removeItem('saku-dojo-progress');
    localStorage.removeItem('sakulang-theme');
    localStorage.removeItem('sakulang-language');

    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };

    this.notify();
  }
}

// Singleton instance
export const authService = new AuthService();

// React Hook
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    loginAsGuest: authService.loginAsGuest.bind(authService),
    logout: authService.logout.bind(authService),
    updateUser: authService.updateUser.bind(authService),
    updatePreferences: authService.updatePreferences.bind(authService),
    updateStats: authService.updateStats.bind(authService),
    exportUserData: authService.exportUserData.bind(authService),
    deleteAccount: authService.deleteAccount.bind(authService)
  };
};