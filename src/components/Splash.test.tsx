import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Splash from './Splash';

// Mock navigator.onLine
const mockNavigator = {
  onLine: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock window.matchMedia
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

describe('Splash Component', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.clearAllMocks();
    vi.useFakeTimers();
    
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

  describe('Basic Rendering', () => {
    it('renders logo and initial progress', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      expect(screen.getByText('🎌 SAKULANG')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('เริ่มต้น...')).toBeInTheDocument();
    });

    it('renders with proper ARIA attributes', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'กำลังโหลดแอปพลิเคชัน SAKULANG');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders skip link for accessibility', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const skipLink = screen.getByText('ข้ามไปยังเนื้อหาหลัก (กด Enter)');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('skip-link');
    });
  });

  describe('Progress Updates', () => {
    it('updates progress through stages', async () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      // Initial state
      expect(screen.getByText('เริ่มต้น...')).toBeInTheDocument();
      
      // First stage (12%)
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('กำลังเตรียมระบบ…')).toBeInTheDocument();
      });
      
      // Second stage (28%)
      act(() => {
        vi.advanceTimersByTime(800);
      });
      
      await waitFor(() => {
        expect(screen.getByText('เชื่อมต่อบริการพื้นฐาน')).toBeInTheDocument();
      });
    });

    it('calls onComplete when progress reaches 100%', async () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      // Fast forward through all stages
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(onCompleteMock).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('updates progress bar width correctly', async () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      // Advance to first stage
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '12');
      });
    });
  });

  describe('Network Status Detection', () => {
    it('shows offline badge when offline', () => {
      mockNavigator.onLine = false;
      
      render(<Splash onComplete={onCompleteMock} />);
      
      expect(screen.getByText('ออฟไลน์')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /สถานะการเชื่อมต่อ/ })).toBeInTheDocument();
    });

    it('hides offline badge when online', () => {
      mockNavigator.onLine = true;
      
      render(<Splash onComplete={onCompleteMock} />);
      
      expect(screen.queryByText('ออฟไลน์')).not.toBeInTheDocument();
    });

    it('handles network status changes', async () => {
      const { rerender } = render(<Splash onComplete={onCompleteMock} />);
      
      // Initially online
      expect(screen.queryByText('ออฟไลน์')).not.toBeInTheDocument();
      
      // Simulate going offline
      mockNavigator.onLine = false;
      
      // Trigger online/offline event
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });
      
      rerender(<Splash onComplete={onCompleteMock} />);
      
      await waitFor(() => {
        expect(screen.getByText('ออฟไลน์')).toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion Support', () => {
    it('respects reduced motion preferences', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const spinner = screen.getByRole('img', { name: 'กำลังโหลด' });
      expect(spinner).toHaveClass('reduced-motion');
    });

    it('uses normal animations when reduced motion is not preferred', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const spinner = screen.getByRole('img', { name: 'กำลังโหลด' });
      expect(spinner).not.toHaveClass('reduced-motion');
    });
  });

  describe('High Contrast Support', () => {
    it('applies high contrast styles when preferred', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('high-contrast');
    });
  });

  describe('Error Handling', () => {
    it('handles maximum initialization time', async () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      // Fast forward past maximum time (10 seconds)
      act(() => {
        vi.advanceTimersByTime(11000);
      });
      
      await waitFor(() => {
        expect(onCompleteMock).toHaveBeenCalled();
      });
    });

    it('handles missing navigator API gracefully', () => {
      // Temporarily remove navigator
      const originalNavigator = window.navigator;
      delete (window as any).navigator;
      
      expect(() => {
        render(<Splash onComplete={onCompleteMock} />);
      }).not.toThrow();
      
      // Restore navigator
      (window as any).navigator = originalNavigator;
    });
  });

  describe('Screen Reader Support', () => {
    it('provides live region updates', async () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      
      // Check for screen reader announcements
      const liveRegion = screen.getByLabelText(/ความคืบหน้า/);
      expect(liveRegion).toBeInTheDocument();
    });

    it('detects screen reader software', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 NVDA/2021.1';
      
      render(<Splash onComplete={onCompleteMock} />);
      
      // Component should detect screen reader and adjust behavior
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('cleans up timers on unmount', () => {
      const { unmount } = render(<Splash onComplete={onCompleteMock} />);
      
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<Splash onComplete={onCompleteMock} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});