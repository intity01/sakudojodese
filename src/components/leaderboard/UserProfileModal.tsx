// User Profile Modal Component
// Detailed user profile view from leaderboard

import React, { useState, useEffect } from 'react';
import type { LeaderboardEntry, PersonalStats } from '../../types/successEvents';
// Use mock service for development
import { mockSuccessEventsService as successEventsService } from '../../services/mockSuccessEventsService';

interface UserProfileModalProps {
  user: LeaderboardEntry;
  onClose: () => void;
  currentUserId?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  currentUserId
}) => {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  const isCurrentUser = user.userId === currentUserId;

  useEffect(() => {
    const loadUserStats = async () => {
      setLoading(true);
      try {
        const userStats = await successEventsService.getPersonalStats(user.userId, 'all_time');
        setStats(userStats);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, [user.userId]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getRankBadge = (rank: number): { color: string; icon: string } => {
    if (rank === 1) return { color: 'bg-yellow-100 text-yellow-800', icon: '🥇' };
    if (rank === 2) return { color: 'bg-gray-100 text-gray-800', icon: '🥈' };
    if (rank === 3) return { color: 'bg-orange-100 text-orange-800', icon: '🥉' };
    if (rank <= 10) return { color: 'bg-blue-100 text-blue-800', icon: '🏆' };
    if (rank <= 50) return { color: 'bg-green-100 text-green-800', icon: '⭐' };
    return { color: 'bg-gray-100 text-gray-600', icon: '👤' };
  };

  const rankBadge = getRankBadge(user.rank);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName || user.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold border-4 border-white">
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Rank Badge */}
                <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${rankBadge.color}`}>
                  {rankBadge.icon} #{user.rank}
                </div>
              </div>
              
              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>{user.displayName || user.username}</span>
                  {isCurrentUser && (
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      You
                    </span>
                  )}
                </h2>
                <p className="text-blue-100">
                  {formatNumber(user.points)} points • Rank #{user.rank}
                </p>
                {user.change && (
                  <p className="text-sm text-blue-200">
                    {user.change > 0 ? '📈' : user.change < 0 ? '📉' : '➖'} 
                    {Math.abs(user.change)} from last period
                  </p>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Profile tabs">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'achievements', name: 'Achievements', icon: '🏅' },
                { id: 'activity', name: 'Activity', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    flex items-center space-x-2
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading profile...</span>
              </div>
            ) : (
              <div>
                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(stats.totalPoints)}
                        </div>
                        <div className="text-sm text-blue-500">Total Points</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.sessionsCompleted}
                        </div>
                        <div className="text-sm text-green-500">Sessions</div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.currentStreak}
                        </div>
                        <div className="text-sm text-purple-500">Day Streak</div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(stats.averageScore)}%
                        </div>
                        <div className="text-sm text-orange-500">Avg Score</div>
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Level Progress</span>
                        <span className="text-sm text-gray-500">
                          Level {stats.levelProgress.currentLevel}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, stats.levelProgress.progress))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatNumber(stats.levelProgress.currentXP)} XP</span>
                        <span>{formatNumber(stats.levelProgress.nextLevelXP)} XP</span>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Points by Category</h3>
                      <div className="space-y-2">
                        {stats.topCategories.map((category, index) => (
                          <div key={category.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm capitalize">{category.category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${category.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 w-12 text-right">
                                {formatNumber(category.points)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div className="space-y-4">
                    {stats?.recentAchievements && stats.recentAchievements.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.recentAchievements.map((achievement) => (
                          <div 
                            key={achievement.id}
                            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                          >
                            <div className="text-3xl">{achievement.icon}</div>
                            <div>
                              <div className="font-semibold text-gray-900">{achievement.name}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                              <div className="text-xs text-orange-600 font-medium">
                                +{achievement.points} points
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-6xl mb-4">🏅</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Achievements Yet
                        </h3>
                        <p className="text-gray-500">
                          Keep learning to unlock achievements!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📈</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Activity Timeline Coming Soon
                    </h3>
                    <p className="text-gray-500">
                      Recent activity and progress charts will be displayed here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;