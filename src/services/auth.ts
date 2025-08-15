// Simple authentication service for guest users
// No external authentication required

interface User {
  id: string;
  username: string;
  type: 'guest' | 'registered';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

class AuthService {
  private state: AuthState = {
    user: null,
    isLoading: false
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    try {
      const saved = localStorage.getItem('sakulang-user');
      if (saved) {
        const user = JSON.parse(saved);
        this.state.user = user;
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
  }

  private saveUser(user: User) {
    try {
      localStorage.setItem('sakulang-user', JSON.stringify(user));
      this.state.user = user;
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save user data:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  loginAsGuest(): User {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      username: `ผู้เรียน${Math.floor(Math.random() * 1000)}`,
      type: 'guest',
      createdAt: new Date().toISOString()
    };

    this.saveUser(guestUser);
    return guestUser;
  }

  logout() {
    localStorage.removeItem('sakulang-user');
    this.state.user = null;
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.user !== null;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): AuthState {
    return { ...this.state };
  }
}

export const authService = new AuthService();

// React hook for using auth service
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [state, setState] = useState(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: authService.isAuthenticated(),
    loginAsGuest: () => authService.loginAsGuest(),
    logout: () => authService.logout()
  };
};