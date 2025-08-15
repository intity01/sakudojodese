import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Splash from './Splash';

// Mock for visual testing
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

const mockNavigator = {
  onLine: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

describe('Splash Visual Tests', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.clearAllMocks();
  });

  describe('Responsive Layout', () => {
    it('renders correctly on mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('splash-overlay');
      
      const content = overlay.querySelector('.splash-content');
      expect(content).toBeInTheDocument();
      
      // Check mobile-specific elements
      const logo = screen.getByText('🎌 SAKULANG');
      expect(logo).toHaveClass('splash-logo');
    });

    it('renders correctly on tablet screens', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      
      // Should maintain proper proportions
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders correctly on desktop screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      
      // Desktop should center content properly
      const content = overlay.querySelector('.splash-content');
      expect(content).toBeInTheDocument();
    });

    it('handles landscape orientation on mobile', () => {
      // Mock mobile landscape
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      
      // Should adapt to landscape layout
      const logo = screen.getByText('🎌 SAKULANG');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Theme Compatibility', () => {
    it('renders correctly in light mode', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
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
      expect(overlay).toHaveClass('splash-overlay');
    });

    it('renders correctly in dark mode', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
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
      expect(overlay).toBeInTheDocument();
    });

    it('renders correctly in high contrast mode', () => {
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

  describe('Animation States', () => {
    it('renders spinner with animation by default', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const spinner = screen.getByRole('img', { name: 'กำลังโหลด' });
      expect(spinner).toHaveClass('splash-spinner');
      expect(spinner).not.toHaveClass('reduced-motion');
    });

    it('renders spinner without animation when reduced motion is preferred', () => {
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

    it('renders progress bar with proper styling', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const progressContainer = screen.getByRole('progressbar');
      expect(progressContainer).toHaveClass('splash-progress');
      
      const progressBar = progressContainer.querySelector('.progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '0%' });
    });
  });

  describe('Offline Badge Positioning', () => {
    it('positions offline badge correctly when offline', () => {
      mockNavigator.onLine = false;
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const offlineBadge = screen.getByRole('status', { name: /สถานะการเชื่อมต่อ/ });
      expect(offlineBadge).toHaveClass('splash-offline');
      expect(offlineBadge).toBeInTheDocument();
    });

    it('does not render offline badge when online', () => {
      mockNavigator.onLine = true;
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const offlineBadge = screen.queryByRole('status', { name: /สถานะการเชื่อมต่อ/ });
      expect(offlineBadge).not.toBeInTheDocument();
    });
  });

  describe('Content Hierarchy', () => {
    it('maintains proper visual hierarchy', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      // Logo should be prominent
      const logo = screen.getByText('🎌 SAKULANG');
      expect(logo).toHaveClass('splash-logo');
      
      // Spinner should be visible
      const spinner = screen.getByRole('img', { name: 'กำลังโหลด' });
      expect(spinner).toBeInTheDocument();
      
      // Progress bar should be present
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      
      // Status message should be readable
      const status = screen.getByRole('status');
      expect(status).toHaveClass('splash-status');
    });

    it('maintains proper spacing and alignment', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const content = screen.getByRole('dialog').querySelector('.splash-content');
      expect(content).toBeInTheDocument();
      
      // All main elements should be present and properly structured
      expect(screen.getByText('🎌 SAKULANG')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'กำลังโหลด' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('เริ่มต้น...')).toBeInTheDocument();
    });
  });

  describe('Z-Index and Layering', () => {
    it('renders with proper z-index for overlay', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveClass('splash-overlay');
      
      // Should be a modal overlay that covers everything
      expect(overlay).toHaveAttribute('aria-modal', 'true');
    });

    it('positions skip link above overlay', () => {
      render(<Splash onComplete={onCompleteMock} />);
      
      const skipLink = screen.getByText('ข้ามไปยังเนื้อหาหลัก (กด Enter)');
      expect(skipLink).toHaveClass('skip-link');
    });

    it('positions offline badge correctly relative to overlay', () => {
      mockNavigator.onLine = false;
      
      render(<Splash onComplete={onCompleteMock} />);
      
      const offlineBadge = screen.getByRole('status', { name: /สถานะการเชื่อมต่อ/ });
      expect(offlineBadge).toHaveClass('splash-offline');
      
      const overlay = screen.getByRole('dialog');
      expect(overlay).toContainElement(offlineBadge);
    });
  });
});