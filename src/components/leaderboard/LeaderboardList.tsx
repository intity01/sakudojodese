// Leaderboard List Component
// Complete leaderboard display with filtering and pagination

import React, { useState, useEffect } from 'react';
import { LeaderboardCard } from './LeaderboardCard';
import type { 
  Leaderboard, 
  LeaderboardEntry, 
  SuccessCategory 
} from '../../types/successEvents';

interface LeaderboardListProps {
  leaderboard: Leaderboard | null;
  currentUserId?: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onUserClick?: (entry: LeaderboardEntry) => void;
  showMetrics?: boolean;
  maxEntries?: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  leaderboard,
  currentUserId,
  loading = false,
  error,
  onRefresh,
  onUserClick,
  showMetrics = false,
  maxEntries = 50
}) => {
  const [displayCount, setDisplayCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>([]);

  // Filter entries based on search term
  useEffect(() => {
    if (!leaderboard?.entries) {
      setFilteredEntries([]);
      return;
    }

    let filtered = leaderboard.entries;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.username.toLowerCase().includes(term) ||
        entry.displayName?.toLowerCase().includes(term)
      );
    }

    // Limit to maxEntries
    filtered = filtered.slice(0, maxEntries);

    setFilteredEntries(filtered);
  }, [leaderboard?.entries, searchTerm, maxEntries]);

  const displayedEntries = filteredEntries.slice(0, displayCount);
  const hasMore = filteredEntries.length > displayCount;
  const currentUserEntry = leaderboard?.entries.find(entry => entry.userId === currentUserId);
  const currentUserInTop = currentUserEntry && currentUserEntry.rank <= displayCount;

  const getCategoryIcon = (category: SuccessCategory): string => {
    switch (category) {
      case 'learning': return '📚';
      case 'focus': return '🎯';
      case 'streak': return '🔥';
      case 'achievement': return '🏆';
      case 'social': return '👥';
      default: return '📊';
    }
  };

  const formatTimeframe = (timeframe: string): string => {
    return timeframe.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="leaderboard-list">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 bg-gray-100 rounded-lg">
              <div className="w-12 h-6 bg-gray-300 rounded"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-full ml-3"></div>
              <div className="flex-grow ml-3">
                <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-24 h-3 bg-gray-300 rounded"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-list">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Leaderboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!leaderboard || !leaderboard.entries.length) {
    return (
      <div className="leaderboard-list">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Rankings Yet
          </h3>
          <p className="text-gray-500">
            Be the first to earn points and claim the top spot!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-list space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(leaderboard.category)}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {leaderboard.name}
            </h2>
            <p className="text-sm text-gray-500">
              {formatTimeframe(leaderboard.timeframe)} • Updated {new Date(leaderboard.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh leaderboard"
          >
            🔄
          </button>
        )}
      </div>

      {/* Search */}
      {leaderboard.entries.length > 5 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      )}

      {/* Current User Highlight (if not in top displayed) */}
      {currentUserEntry && !currentUserInTop && (
        <div className="border-t border-b border-gray-200 py-2">
          <div className="text-sm text-gray-500 mb-2 text-center">
            Your Position
          </div>
          <LeaderboardCard
            entry={{ ...currentUserEntry, isCurrentUser: true }}
            showRankChange={true}
            showMetrics={showMetrics}
            isCurrentUser={true}
            onClick={onUserClick}
          />
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-2">
        {displayedEntries.map((entry, index) => (
          <LeaderboardCard
            key={entry.userId}
            entry={entry}
            showRankChange={true}
            showMetrics={showMetrics}
            isCurrentUser={entry.userId === currentUserId}
            onClick={onUserClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="px-6 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            Show More ({filteredEntries.length - displayCount} remaining)
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.entries.length}
            </div>
            <div className="text-sm text-gray-500">Total Players</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.entries[0]?.points.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">Top Score</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(
                leaderboard.entries.reduce((sum, entry) => sum + entry.points, 0) / 
                leaderboard.entries.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {currentUserEntry?.rank || '-'}
            </div>
            <div className="text-sm text-gray-500">Your Rank</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {leaderboard.description && (
        <div className="text-center text-sm text-gray-500 mt-4">
          {leaderboard.description}
        </div>
      )}
    </div>
  );
};

export default LeaderboardList;