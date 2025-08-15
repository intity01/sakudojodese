// Leaderboard Screen Component
// Main leaderboard interface with tabs, filtering, and user interactions

import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardTabs } from './LeaderboardTabs';
import { LeaderboardList } from './LeaderboardList';
import { UserProfileModal } from './UserProfileModal';
import { ScoringExplanationModal } from './ScoringExplanationModal';
import type { 
  Leaderboard, 
  LeaderboardEntry, 
  SuccessCategory 
} from '../../types/successEvents';
// Use mock service for development
import { mockSuccessEventsService as successEventsService } from '../../services/mockSuccessEventsService';

interface LeaderboardScreenProps {
  currentUserId?: string;
  initialCategory?: SuccessCategory;
  initialTimeframe?: string;
  onUserSelect?: (userId: string) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  currentUserId,
  initialCategory = 'learning',
  initialTimeframe = 'weekly',
  onUserSelect
}) => {
  const [activeCategory, setActiveCategory] = useState<SuccessCategory>(initialCategory);
  const [activeTimeframe, setActiveTimeframe] = useState(initialTimeframe);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load leaderboard data
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await successEventsService.getLeaderboard(
        activeCategory, 
        activeTimeframe as any
      );
      
      if (data) {
        // Mark current user in entries
        const entriesWithCurrentUser = data.entries.map(entry => ({
          ...entry,
          isCurrentUser: entry.userId === currentUserId
        }));
        
        setLeaderboard({
          ...data,
          entries: entriesWithCurrentUser
        });
      } else {
        setLeaderboard(null);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeTimeframe, currentUserId, refreshKey]);

  // Load data when category/timeframe changes
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        setRefreshKey(prev => prev + 1);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading]);

  const handleCategoryChange = (category: SuccessCategory) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
      setLeaderboard(null); // Clear current data
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    if (timeframe !== activeTimeframe) {
      setActiveTimeframe(timeframe);
      setLeaderboard(null); // Clear current data
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
    setSelectedUser(entry);
    setShowUserModal(true);
    onUserSelect?.(entry.userId);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Get current user's rank for quick access
  const currentUserRank = leaderboard?.entries.find(
    entry => entry.userId === currentUserId
  )?.rank;

  return (
    <div className="leaderboard-screen min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span className="text-4xl">🏆</span>
                  <span>Leaderboards</span>
                </h1>
                <p className="mt-2 text-gray-600">
                  Compete with other learners and track your progress
                </p>
              </div>
              
              {/* Quick Stats */}
              {currentUserId && currentUserRank && (
                <div className="hidden md:flex items-center space-x-6 bg-blue-50 px-4 py-3 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">#{currentUserRank}</div>
                    <div className="text-xs text-blue-500">Your Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {leaderboard?.entries.find(e => e.userId === currentUserId)?.points.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-blue-500">Your Points</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* Tabs */}
            <LeaderboardTabs
              activeCategory={activeCategory}
              activeTimeframe={activeTimeframe}
              onCategoryChange={handleCategoryChange}
              onTimeframeChange={handleTimeframeChange}
              loading={loading}
            />

            {/* Leaderboard Content */}
            <div className="mt-6">
              <LeaderboardList
                leaderboard={leaderboard}
                currentUserId={currentUserId}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
                onUserClick={handleUserClick}
                showMetrics={true}
                maxEntries={100}
              />
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* How Points Work */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>💡</span>
              <span>How Points Work</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Quiz Completed</span>
                <span className="font-medium">50 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Perfect Score</span>
                <span className="font-medium">200 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Focus Session</span>
                <span className="font-medium">25 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Streak</span>
                <span className="font-medium">15 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Level Up</span>
                <span className="font-medium">300 pts</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Points are multiplied by difficulty level and streak bonuses!
              </p>
            </div>
          </div>

          {/* Leaderboard Rules */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>Leaderboard Rules</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Rankings update every 15 minutes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Only active learners are shown</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Ties are broken by recent activity</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Fair play is enforced</span>
              </li>
            </ul>
          </div>

          {/* Achievements Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>🏅</span>
              <span>Top Achievements</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span>🥇</span>
                <span className="text-gray-600">Leaderboard King</span>
                <span className="text-xs text-gray-500">(1000 pts)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span>🔥</span>
                <span className="text-gray-600">100-Day Streak</span>
                <span className="text-xs text-gray-500">(1500 pts)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span>🧠</span>
                <span className="text-gray-600">1000 Questions</span>
                <span className="text-xs text-gray-500">(800 pts)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span>🎯</span>
                <span className="text-gray-600">Focus Master</span>
                <span className="text-xs text-gray-500">(1000 pts)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Earn achievements to boost your ranking!
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Explanation Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowScoringModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🧮 How Scoring Works
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={handleCloseUserModal}
          currentUserId={currentUserId}
        />
      )}

      {/* Scoring Explanation Modal */}
      <ScoringExplanationModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        category={activeCategory}
      />
    </div>
  );
};

export default LeaderboardScreen;