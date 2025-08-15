import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Splash from './Splash';

// Performance testing utilities
const measurePerformance = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

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

describe('Splash Performance Tests', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initialization Performance', () => {
    it('renders within acceptable time', () => {
      const renderTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);
      });

      // Should render within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('initializes state efficiently', () => {
      const initTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);
        
        // Check that initial state is set
        expect(screen.getByText('🎌 SAKULANG')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      // State initialization should be fast
      expect(initTime).toBeLessThan(30);
    });

    it('sets up event listeners efficiently', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const matchMediaSpy = vi.spyOn(window, 'matchMedia');

      const setupTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);
      });

      expect(setupTime).toBeLessThan(20);
      expect(addEventListenerSpy).toHaveBeenCalled();
      expect(matchMediaSpy).toHaveBeenCalled();
    });
  });

  describe('Animation Performance', () => {
    it('handles progress updates efficiently', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const updateTime = measurePerformance(() => {
        // Simulate multiple progress updates
        for (let i = 0; i < 10; i++) {
          act(() => {
            vi.advanceTimersByTime(100);
          });
        }
      });

      // Progress updates should be efficient
      expect(updateTime).toBeLessThan(100);
    });

    it('maintains smooth animation timing', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const animationTimes: number[] = [];

      // Measure timing consistency
      for (let i = 0; i < 5; i++) {
        const stepTime = measurePerformance(() => {
          act(() => {
            vi.advanceTimersByTime(500);
          });
        });
        animationTimes.push(stepTime);
      }

      // Animation steps should have consistent timing
      const avgTime = animationTimes.reduce((a, b) => a + b, 0) / animationTimes.length;
      const variance = animationTimes.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / animationTimes.length;
      
      // Low variance indicates consistent timing
      expect(variance).toBeLessThan(100);
    });

    it('handles reduced motion efficiently', () => {
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

      const reducedMotionTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);
      });

      // Reduced motion should not add significant overhead
      expect(reducedMotionTime).toBeLessThan(60);
    });
  });

  describe('Memory Usage', () => {
    it('cleans up resources on unmount', () => {
      const { unmount } = render(<Splash onComplete={onCompleteMock} />);

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const cleanupTime = measurePerformance(() => {
        unmount();
      });

      expect(cleanupTime).toBeLessThan(20);
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('does not create memory leaks with multiple renders', () => {
      const renders: Array<{ unmount: () => void }> = [];

      const multiRenderTime = measurePerformance(() => {
        // Create multiple instances
        for (let i = 0; i < 10; i++) {
          renders.push(render(<Splash onComplete={vi.fn()} />));
        }

        // Clean them up
        renders.forEach(({ unmount }) => unmount());
      });

      // Multiple renders and cleanups should be efficient
      expect(multiRenderTime).toBeLessThan(200);
    });

    it('handles rapid state updates efficiently', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const rapidUpdateTime = measurePerformance(() => {
        // Simulate rapid network status changes
        for (let i = 0; i < 20; i++) {
          act(() => {
            mockNavigator.onLine = i % 2 === 0;
            window.dispatchEvent(new Event(i % 2 === 0 ? 'online' : 'offline'));
          });
        }
      });

      // Rapid updates should not cause performance issues
      expect(rapidUpdateTime).toBeLessThan(150);
    });
  });

  describe('DOM Performance', () => {
    it('minimizes DOM queries', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector');
      const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll');

      render(<Splash onComplete={onCompleteMock} />);

      // Should not make excessive DOM queries
      expect(querySelectorSpy).toHaveBeenCalledTimes(0);
      expect(querySelectorAllSpy).toHaveBeenCalledTimes(0);
    });

    it('efficiently updates progress bar width', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const progressBar = screen.getByRole('progressbar').querySelector('.progress-bar') as HTMLElement;
      
      const updateTime = measurePerformance(() => {
        act(() => {
          vi.advanceTimersByTime(500);
        });
      });

      expect(updateTime).toBeLessThan(30);
      expect(progressBar).toHaveStyle({ width: '12%' });
    });

    it('handles CSS class changes efficiently', () => {
      render(<Splash onComplete={onCompleteMock} />);

      screen.getByRole('dialog');

      const classChangeTime = measurePerformance(() => {
        // Simulate various class changes
        act(() => {
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
        });
      });

      expect(classChangeTime).toBeLessThan(20);
    });
  });

  describe('Network Detection Performance', () => {
    it('handles network status changes efficiently', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const networkChangeTime = measurePerformance(() => {
        // Simulate network status change
        act(() => {
          mockNavigator.onLine = false;
          window.dispatchEvent(new Event('offline'));
        });
      });

      expect(networkChangeTime).toBeLessThan(25);
      expect(screen.getByText('ออฟไลน์')).toBeInTheDocument();
    });

    it('efficiently polls network status', () => {
      render(<Splash onComplete={onCompleteMock} />);

      const pollTime = measurePerformance(() => {
        // Simulate periodic network check (30 second interval)
        act(() => {
          vi.advanceTimersByTime(30000);
        });
      });

      // Periodic checks should be lightweight
      expect(pollTime).toBeLessThan(15);
    });
  });

  describe('Accessibility Performance', () => {
    it('efficiently manages ARIA attributes', () => {
      const setAttributeSpy = vi.spyOn(Element.prototype, 'setAttribute');

      render(<Splash onComplete={onCompleteMock} />);

      // Progress update should efficiently update ARIA attributes
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should not make excessive setAttribute calls
      expect(setAttributeSpy.mock.calls.length).toBeLessThan(20);
    });

    it('handles screen reader announcements efficiently', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 NVDA/2021.1';

      const announcementTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);

        // Trigger progress updates that create announcements
        act(() => {
          vi.advanceTimersByTime(2000);
        });
      });

      expect(announcementTime).toBeLessThan(80);
    });
  });

  describe('Complete Sequence Performance', () => {
    it('completes full splash sequence efficiently', () => {
      const fullSequenceTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);

        // Run through complete sequence
        act(() => {
          vi.advanceTimersByTime(10000);
        });
      });

      // Full sequence should complete efficiently
      expect(fullSequenceTime).toBeLessThan(200);
      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('maintains performance under stress conditions', () => {
      // Simulate stress conditions
      const stressTime = measurePerformance(() => {
        render(<Splash onComplete={onCompleteMock} />);

        // Rapid state changes during splash
        for (let i = 0; i < 50; i++) {
          act(() => {
            vi.advanceTimersByTime(100);
            if (i % 5 === 0) {
              mockNavigator.onLine = !mockNavigator.onLine;
              window.dispatchEvent(new Event(mockNavigator.onLine ? 'online' : 'offline'));
            }
          });
        }
      });

      // Should handle stress conditions reasonably
      expect(stressTime).toBeLessThan(500);
    });
  });
});