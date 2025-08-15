import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock all the services and hooks
vi.mock('./services/analytics', () => ({
  analytics: {
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
  }
}));

vi.mock('./services/auth', () => ({
  useAuth: () => ({
    user: null,
    loginAsGuest: vi.fn().mockResolvedValue(true),
  })
}));

vi.mock('./hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  })
}));

// Mock navigator and matchMedia
const mockNavigator = {
  onLine: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('App Boot Sequence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Reset navigator mock
    mockNavigator.onLine = true;
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Boot Stage', () => {
    it('starts in boot stage', () => {
      render(<App />);
      
      // Should show splash screen initially
      expect(screen.getByRole('dialog', { name: /กำลังโหลดแอปพลิเคชัน/ })).toBeInTheDocument();
      expect(screen.getByText('🎌 SAKULANG')).toBeInTheDocument();
    });

    it('transitions from boot to start', async () => {
      render(<App />);
      
      // Initially in boot stage
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Fast forward through splash sequence
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Should transition to start screen
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText('🎌 SAKULANG')).toBeInTheDocument(); // App header
      }, { timeout: 3000 });
    });

    it('initializes services during boot', async () => {
      const { analytics } = await import('./services/analytics');
      await import('./services/auth');
      
      render(<App />);
      
      // Fast forward through boot
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(analytics.trackPageView).toHaveBeenCalledWith('app_start');
      });
    });

    it('handles boot stage errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock an error in splash component
      vi.doMock('./components/Splash', () => ({
        default: () => {
          throw new Error('Splash component error');
        }
      }));
      
      render(<App />);
      
      // Should fallback to start screen
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('handles boot timeout fallback', async () => {
      render(<App />);
      
      // Fast forward past timeout (15 seconds)
      act(() => {
        vi.advanceTimersByTime(16000);
      });
      
      // Should force transition to start
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Service Integration', () => {
    it('tracks analytics events during boot', async () => {
      const { analytics } = await import('./services/analytics');
      
      render(<App />);
      
      // Complete boot sequence
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(analytics.track).toHaveBeenCalledWith('splash_completed', {
          duration: expect.any(Number)
        });
      });
    });

    it('initializes authentication during boot', async () => {
      const { useAuth } = await import('./services/auth');
      const mockLoginAsGuest = vi.fn().mockResolvedValue(true);
      
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loginAsGuest: mockLoginAsGuest,
        logout: vi.fn(),
        updateUser: vi.fn(),
        updatePreferences: vi.fn(),
        updateStats: vi.fn(),
        exportUserData: vi.fn(),
        deleteAccount: vi.fn()
      });
      
      render(<App />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockLoginAsGuest).toHaveBeenCalled();
      });
    });

    it('loads progress history from localStorage', () => {
      const mockProgress = JSON.stringify([
        { id: '1', score: 80, timestamp: Date.now() }
      ]);
      
      mockLocalStorage.getItem.mockReturnValue(mockProgress);
      
      render(<App />);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('saku-dojo-progress');
    });
  });

  describe('Error Recovery', () => {
    it('recovers from localStorage errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<App />);
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('handles service initialization failures', async () => {
      const { useAuth } = await import('./services/auth');
      
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loginAsGuest: vi.fn().mockRejectedValue(new Error('Auth error')),
        logout: vi.fn(),
        updateUser: vi.fn(),
        updatePreferences: vi.fn(),
        updateStats: vi.fn(),
        exportUserData: vi.fn(),
        deleteAccount: vi.fn()
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      // Should still complete boot despite auth error
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('provides proper focus management during transition', async () => {
      render(<App />);
      
      // Complete boot sequence
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        // Main content should be accessible
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(document.getElementById('main-content')).toBeInTheDocument();
      });
    });

    it('maintains accessibility during boot stage', () => {
      render(<App />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Performance', () => {
    it('completes boot sequence within reasonable time', async () => {
      const startTime = Date.now();
      
      render(<App />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // Should complete within expected timeframe
      expect(Date.now() - startTime).toBeLessThan(1000); // Test execution time
    });

    it('does not block main thread during initialization', async () => {
      render(<App />);
      
      // Should be able to interact with splash immediately
      const skipLink = screen.getByText('ข้ามไปยังเนื้อหาหลัก (กด Enter)');
      expect(skipLink).toBeInTheDocument();
      
      // Skip link should be functional
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Theme Integration', () => {
    it('renders within ThemeProvider context', () => {
      render(<App />);
      
      // Should render without theme-related errors
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});