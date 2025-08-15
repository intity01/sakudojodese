// Leaderboard Components Tests
// Unit tests for leaderboard interface components

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardCard } from './LeaderboardCard';
import { LeaderboardWidget } from './LeaderboardWidget';
import { LeaderboardTabs } from './LeaderboardTabs';
import { ScoringExplanationModal } from './ScoringExplanationModal';
import type { LeaderboardEntry } from '../../types/successEvents';

// Mock the success events service
vi.mock('../../services/successEventsService', () => ({
  successEventsService: {
    getLeaderboard: vi.fn(),
    getPersonalStats: vi.fn(),
    getUserRank: vi.fn()
  }
}));

describe('LeaderboardCard', () => {
  const mockEntry: LeaderboardEntry = {
    userId: 'user1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: null,
    points: 1250,
    rank: 5,
    change: 2,
    metrics: {
      quizzes: 15,
      focus_minutes: 120
    }
  };

  it('renders user information correctly', () => {
    render(<LeaderboardCard entry={mockEntry} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('1.3K')).toBeInTheDocument();
    expect(screen.getByText('points')).toBeInTheDocument();
  });

  it('shows rank change indicator', () => {
    render(<LeaderboardCard entry={mockEntry} showRankChange={true} />);
    
    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(<LeaderboardCard entry={mockEntry} isCurrentUser={true} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('bg-blue-50');
  });

  it('shows metrics when enabled', () => {
    render(<LeaderboardCard entry={mockEntry} showMetrics={true} />);
    
    expect(screen.getByText(/quizzes: 15/)).toBeInTheDocument();
    expect(screen.getByText(/focus_minutes: 120/)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClickMock = vi.fn();
    render(<LeaderboardCard entry={mockEntry} onClick={onClickMock} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledWith(mockEntry);
  });

  it('handles keyboard navigation', () => {
    const onClickMock = vi.fn();
    render(<LeaderboardCard entry={mockEntry} onClick={onClickMock} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClickMock).toHaveBeenCalledWith(mockEntry);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClickMock).toHaveBeenCalledTimes(2);
  });

  it('displays top 3 special effects', () => {
    const topEntry = { ...mockEntry, rank: 1 };
    render(<LeaderboardCard entry={topEntry} />);
    
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('formats large point values correctly', () => {
    const highPointsEntry = { ...mockEntry, points: 1500000 };
    render(<LeaderboardCard entry={highPointsEntry} />);
    
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });
});

describe('LeaderboardTabs', () => {
  const defaultProps = {
    activeCategory: 'learning' as const,
    activeTimeframe: 'weekly',
    onCategoryChange: vi.fn(),
    onTimeframeChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all category tabs', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('Streaks')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('highlights active category', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    const learningTab = screen.getByText('Learning').closest('button');
    expect(learningTab).toHaveClass('border-blue-500', 'text-blue-600');
  });

  it('handles category changes', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Focus'));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('focus');
  });

  it('shows timeframe dropdown', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    expect(screen.getByText('This Week')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('This Week'));
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('handles timeframe changes', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    fireEvent.click(screen.getByText('This Week'));
    fireEvent.click(screen.getByText('Today'));
    
    expect(defaultProps.onTimeframeChange).toHaveBeenCalledWith('daily');
  });

  it('disables interactions when loading', () => {
    render(<LeaderboardTabs {...defaultProps} loading={true} />);
    
    const learningTab = screen.getByText('Learning').closest('button');
    expect(learningTab).toBeDisabled();
    
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('shows category descriptions', () => {
    render(<LeaderboardTabs {...defaultProps} />);
    
    expect(screen.getByText(/Quiz scores, study sessions/)).toBeInTheDocument();
  });
});

describe('LeaderboardWidget', () => {
  const mockLeaderboard = {
    id: 'test-board',
    name: 'Test Leaderboard',
    category: 'learning' as const,
    timeframe: 'weekly',
    description: 'Test description',
    lastUpdated: new Date().toISOString(),
    entries: [
      {
        userId: 'user1',
        username: 'user1',
        displayName: 'User One',
        avatar: null,
        points: 1000,
        rank: 1,
        change: 0
      },
      {
        userId: 'user2',
        username: 'user2',
        displayName: 'User Two',
        avatar: null,
        points: 800,
        rank: 2,
        change: 1
      }
    ]
  };

  beforeEach(() => {
    const { successEventsService } = require('../../services/successEventsService');
    successEventsService.getLeaderboard.mockResolvedValue(mockLeaderboard);
  });

  it('renders loading state', () => {
    render(<LeaderboardWidget />);
    
    expect(screen.getAllByText(/animate-pulse/)).toBeTruthy();
  });

  it('renders leaderboard entries', async () => {
    render(<LeaderboardWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  it('shows category header', async () => {
    render(<LeaderboardWidget showHeader={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Leaders')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
    });
  });

  it('handles view all button', async () => {
    const onViewAllMock = vi.fn();
    render(<LeaderboardWidget onViewAll={onViewAllMock} />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('View All'));
      expect(onViewAllMock).toHaveBeenCalled();
    });
  });

  it('highlights current user', async () => {
    render(<LeaderboardWidget currentUserId="user1" />);
    
    await waitFor(() => {
      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  it('shows current user position when not in top', async () => {
    const extendedLeaderboard = {
      ...mockLeaderboard,
      entries: [
        ...mockLeaderboard.entries,
        {
          userId: 'current-user',
          username: 'currentuser',
          displayName: 'Current User',
          avatar: null,
          points: 500,
          rank: 10,
          change: -1
        }
      ]
    };

    const { successEventsService } = require('../../services/successEventsService');
    successEventsService.getLeaderboard.mockResolvedValue(extendedLeaderboard);

    render(<LeaderboardWidget currentUserId="current-user" maxEntries={2} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Position')).toBeInTheDocument();
      expect(screen.getByText('#10')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    const { successEventsService } = require('../../services/successEventsService');
    successEventsService.getLeaderboard.mockRejectedValue(new Error('Network error'));

    render(<LeaderboardWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });
});

describe('ScoringExplanationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    category: 'learning' as const
  };

  it('renders when open', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('อธิบายวิธีคิดคะแนน')).toBeInTheDocument();
    expect(screen.getByText('Learning Points')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ScoringExplanationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('อธิบายวิธีคิดคะแนน')).not.toBeInTheDocument();
  });

  it('shows category-specific information', () => {
    render(<ScoringExplanationModal {...defaultProps} category="focus" />);
    
    expect(screen.getByText('Focus Points')).toBeInTheDocument();
    expect(screen.getByText(/focus sessions and productivity/)).toBeInTheDocument();
  });

  it('displays base points table', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('Base Points')).toBeInTheDocument();
    expect(screen.getByText('Complete Quiz')).toBeInTheDocument();
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('shows multipliers section', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('Multipliers')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
  });

  it('includes example calculation', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('Example Calculation')).toBeInTheDocument();
    expect(screen.getByText('487 points')).toBeInTheDocument();
  });

  it('handles close button', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows tips section', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('Tips to Maximize Points')).toBeInTheDocument();
    expect(screen.getByText(/Maintain daily streaks/)).toBeInTheDocument();
  });

  it('displays fair play policy', () => {
    render(<ScoringExplanationModal {...defaultProps} />);
    
    expect(screen.getByText('Fair Play Policy')).toBeInTheDocument();
    expect(screen.getByText(/monitor for unusual patterns/)).toBeInTheDocument();
  });
});

describe('Leaderboard Integration', () => {
  it('formats points correctly across components', () => {
    const testCases = [
      { points: 500, expected: '500' },
      { points: 1500, expected: '1.5K' },
      { points: 1500000, expected: '1.5M' }
    ];

    testCases.forEach(({ points, expected }) => {
      const entry: LeaderboardEntry = {
        userId: 'test',
        username: 'test',
        displayName: 'Test',
        avatar: null,
        points,
        rank: 1,
        change: 0
      };

      render(<LeaderboardCard entry={entry} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it('handles rank icons consistently', () => {
    const ranks = [1, 2, 3, 10];
    const expectedIcons = ['🥇', '🥈', '🥉', '#10'];

    ranks.forEach((rank, index) => {
      const entry: LeaderboardEntry = {
        userId: `user${rank}`,
        username: `user${rank}`,
        displayName: `User ${rank}`,
        avatar: null,
        points: 1000 - (rank * 100),
        rank,
        change: 0
      };

      const { unmount } = render(<LeaderboardCard entry={entry} />);
      expect(screen.getByText(expectedIcons[index])).toBeInTheDocument();
      unmount();
    });
  });
});