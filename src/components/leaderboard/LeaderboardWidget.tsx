// Leaderboard Widget Component
// Compact leaderboard display for dashboard or sidebar

import React, { useState, useEffect } from 'react';
import type { Leaderboard, SuccessCategory } from '../../types/successEvents';
// Use mock service for development
import { mockSuccessEventsService as successEventsService } from '../../services/mockSuccessEventsService';

interface LeaderboardWidgetProps {
  category?: SuccessCategory;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  maxEntries?: number;
  currentUserId?: string;
  showHeader?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  category = 'learning',
  timeframe = 'weekly',
  maxEntries = 5,
  currentUserId,
  showHeader = true,
  onViewAll,
  className = ''
}) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await successEventsService.getLeaderboard(category, timeframe);
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard widget:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [category, timeframe]);

  const getCategoryIcon = (cat: SuccessCategory): string => {
    switch (cat) {
      case 'learning': return '📚';
      case 'focus': return '🎯';
      case 'streak': return '🔥';
      case 'achievement': return '🏆';
      case 'social': return '👥';
      default: return '📊';
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatPoints = (points: number): string => {
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  const formatTimeframe = (tf: string): string => {
    return tf.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const displayEntries = leaderboard?.entries.slice(0, maxEntries) || [];
  const currentUserEntry = leaderboard?.entries.find(entry => entry.userId === currentUserId);
  const currentUserInTop = currentUserEntry && currentUserEntry.rank <= maxEntries;

  if (loading) {
    return (
      <div className={`leaderboard-widget bg-white rounded-lg shadow-sm p-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: maxEntries }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-6 h-4 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !leaderboard) {
    return (
      <div className={`leaderboard-widget bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="text-center py-6">
          <div className="text-gray-400 text-2xl mb-2">⚠️</div>
          <p className="text-sm text-gray-500">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`leaderboard-widget bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {category.charAt(0).toUpperCase() + category.slice(1)} Leaders
              </h3>
              <p className="text-xs text-gray-500">
                {formatTimeframe(timeframe)}
              </p>
            </div>
          </div>
          
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="p-4">
        {displayEntries.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-gray-400 text-2xl mb-2">🏆</div>
            <p className="text-sm text-gray-500">No rankings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEntries.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-sm font-bold w-6 text-center ${
                    entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.displayName || entry.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {(entry.displayName || entry.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {entry.displayName || entry.username}
                    </div>
                    {isCurrentUser && (
                      <div className="text-xs text-blue-500">You</div>
                    )}
                  </div>

                  {/* Points */}
                  <div className={`text-sm font-bold ${
                    isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {formatPoints(entry.points)}
                  </div>

                  {/* Rank Change */}
                  {entry.change && (
                    <div className="text-xs text-gray-500 ml-1">
                      {entry.change > 0 ? '📈' : entry.change < 0 ? '📉' : '➖'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Current User Position (if not in top) */}
        {currentUserEntry && !currentUserInTop && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="text-xs text-gray-500 mb-2 text-center">Your Position</div>
            <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-bold text-blue-600 w-6 text-center">
                #{currentUserEntry.rank}
              </div>
              <div className="flex-shrink-0">
                {currentUserEntry.avatar ? (
                  <img
                    src={currentUserEntry.avatar}
                    alt={currentUserEntry.displayName || currentUserEntry.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {(currentUserEntry.displayName || currentUserEntry.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-blue-700 truncate">
                  {currentUserEntry.displayName || currentUserEntry.username}
                </div>
                <div className="text-xs text-blue-500">You</div>
              </div>
              <div className="text-sm font-bold text-blue-700">
                {formatPoints(currentUserEntry.points)}
              </div>
            </div>
          </div>
        )}

        {/* View All Link */}
        {onViewAll && displayEntries.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3 text-center">
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Full Leaderboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardWidget;