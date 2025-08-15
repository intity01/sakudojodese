// Leaderboard Card Component
// Individual leaderboard entry display with user info and stats

import React from 'react';
import type { LeaderboardEntry } from '../../types/successEvents';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  showRankChange?: boolean;
  showMetrics?: boolean;
  isCurrentUser?: boolean;
  onClick?: (entry: LeaderboardEntry) => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  showRankChange = true,
  showMetrics = false,
  isCurrentUser = false,
  onClick
}) => {
  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankChangeIcon = (change?: number): string => {
    if (!change) return '';
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➖';
  };

  const formatPoints = (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const cardClasses = [
    'leaderboard-card',
    'flex items-center p-4 rounded-lg border transition-all duration-200',
    isCurrentUser ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:border-gray-300',
    onClick ? 'cursor-pointer hover:shadow-md' : '',
    entry.rank <= 3 ? 'shadow-md' : 'shadow-sm'
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={() => onClick?.(entry)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(entry);
        }
      }}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-12 text-center">
        <div className={`text-lg font-bold ${
          entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'
        }`}>
          {getRankIcon(entry.rank)}
        </div>
        {showRankChange && entry.change && (
          <div className="text-xs text-gray-500 mt-1">
            {getRankChangeIcon(entry.change)}
            {Math.abs(entry.change)}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 ml-3">
        {entry.avatar ? (
          <img
            src={entry.avatar}
            alt={entry.displayName || entry.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {(entry.displayName || entry.username).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-grow ml-3 min-w-0">
        <div className="flex items-center">
          <h3 className={`font-semibold truncate ${
            isCurrentUser ? 'text-blue-700' : 'text-gray-900'
          }`}>
            {entry.displayName || entry.username}
          </h3>
          {isCurrentUser && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              You
            </span>
          )}
        </div>
        
        {showMetrics && entry.metrics && (
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.entries(entry.metrics).map(([key, value]) => (
              <span key={key} className="text-xs text-gray-500">
                {key}: {typeof value === 'number' ? formatPoints(value) : value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Points */}
      <div className="flex-shrink-0 text-right">
        <div className={`text-lg font-bold ${
          isCurrentUser ? 'text-blue-700' : 'text-gray-900'
        }`}>
          {formatPoints(entry.points)}
        </div>
        <div className="text-xs text-gray-500">
          points
        </div>
      </div>

      {/* Top 3 Special Effects */}
      {entry.rank <= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 left-0 w-full h-1 rounded-t-lg ${
            entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
            entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
            'bg-gradient-to-r from-orange-400 to-orange-600'
          }`} />
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;