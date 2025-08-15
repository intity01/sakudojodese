// Leaderboard Test Page
// Test page for trying out leaderboard components

import React, { useState } from 'react';
import { 
  LeaderboardScreen,
  LeaderboardWidget,
  LeaderboardCard,
  ScoringExplanationModal,
  UserProfileModal,
  type LeaderboardEntry,
  type SuccessCategory
} from '../components/leaderboard';

// Mock data for testing
const mockLeaderboardEntries: LeaderboardEntry[] = [
  {
    userId: 'user1',
    username: 'sakura_learner',
    displayName: 'Sakura 🌸',
    avatar: null,
    points: 15420,
    rank: 1,
    change: 2,
    metrics: {
      quizzes: 45,
      focus_minutes: 320,
      streak_days: 28
    }
  },
  {
    userId: 'user2',
    username: 'ninja_student',
    displayName: 'Ninja Student 🥷',
    avatar: null,
    points: 12850,
    rank: 2,
    change: -1,
    metrics: {
      quizzes: 38,
      focus_minutes: 280,
      streak_days: 15
    }
  },
  {
    userId: 'user3',
    username: 'kanji_master',
    displayName: 'Kanji Master 漢字',
    avatar: null,
    points: 11200,
    rank: 3,
    change: 1,
    metrics: {
      quizzes: 52,
      focus_minutes: 195,
      streak_days: 42
    }
  },
  {
    userId: 'current-user',
    username: 'you',
    displayName: 'You (Test User)',
    avatar: null,
    points: 8750,
    rank: 7,
    change: 3,
    metrics: {
      quizzes: 25,
      focus_minutes: 150,
      streak_days: 12
    },
    isCurrentUser: true
  },
  {
    userId: 'user5',
    username: 'grammar_guru',
    displayName: 'Grammar Guru 文法',
    avatar: null,
    points: 7200,
    rank: 8,
    change: 0,
    metrics: {
      quizzes: 30,
      focus_minutes: 120,
      streak_days: 8
    }
  }
];

export const LeaderboardTestPage: React.FC = () => {
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SuccessCategory>('learning');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

  const handleUserClick = (entry: LeaderboardEntry) => {
    setSelectedUser(entry);
    setShowUserModal(true);
    console.log('User clicked:', entry);
  };

  const [showUserModal, setShowUserModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard Components Test
          </h1>
          <p className="text-gray-600">
            Testing all leaderboard components with mock data
          </p>
        </div>

        {/* Component Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LeaderboardWidget Test */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              📱 LeaderboardWidget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LeaderboardWidget
                category="learning"
                timeframe="weekly"
                maxEntries={3}
                currentUserId="current-user"
                showHeader={true}
                onViewAll={() => alert('View All clicked!')}
                className="shadow-lg"
              />
              <LeaderboardWidget
                category="focus"
                timeframe="daily"
                maxEntries={5}
                currentUserId="current-user"
                showHeader={true}
                className="shadow-lg"
              />
            </div>
          </div>

          {/* LeaderboardCard Tests */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              🏅 LeaderboardCard
            </h2>
            <div className="space-y-3">
              {mockLeaderboardEntries.slice(0, 3).map((entry) => (
                <LeaderboardCard
                  key={entry.userId}
                  entry={entry}
                  showRankChange={true}
                  showMetrics={true}
                  isCurrentUser={entry.isCurrentUser}
                  onClick={handleUserClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🎛️ Control Panel
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowScoringModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Show Scoring Modal
            </button>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SuccessCategory)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="learning">Learning</option>
              <option value="focus">Focus</option>
              <option value="streak">Streak</option>
              <option value="achievement">Achievement</option>
              <option value="social">Social</option>
            </select>

            <button
              onClick={() => console.log('Mock data:', mockLeaderboardEntries)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Log Mock Data
            </button>
            
            <button
              onClick={() => alert('Click handlers working! Check console for logs.')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Test Click Handler
            </button>
          </div>
        </div>

        {/* Full LeaderboardScreen Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🏆 Full LeaderboardScreen
          </h2>
          <p className="text-gray-600 mb-4">
            Note: This will try to load real data from the service. 
            If the service isn't running, you'll see loading/error states.
          </p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <LeaderboardScreen
              currentUserId="current-user"
              initialCategory="learning"
              initialTimeframe="weekly"
            />
          </div>
        </div>

        {/* Mock Data Display */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📊 Mock Data
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(mockLeaderboardEntries, null, 2)}
          </pre>
        </div>

        {/* Scoring Modal Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🧮 Scoring System Test
          </h2>
          <p className="text-gray-600 mb-4">
            Test the scoring explanation modal with different categories:
          </p>
          <div className="flex flex-wrap gap-3">
            {['learning', 'focus', 'streak', 'achievement', 'social'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat as any);
                  setShowScoringModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors capitalize"
              >
                {cat} Scoring
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            📋 Testing Instructions
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>• Click on leaderboard cards to test onClick handlers</li>
            <li>• Try the "Show Scoring Modal" button to see the explanation</li>
            <li>• Change the category dropdown to test different scoring info</li>
            <li>• Check browser console for click events and data logs</li>
            <li>• Test responsive design by resizing the window</li>
            <li>• Try keyboard navigation (Tab, Enter, Space)</li>
            <li>• The full LeaderboardScreen will show loading/error if service isn't running</li>
            <li>• Test user profile modal by clicking on user cards</li>
            <li>• Test different scoring categories using the buttons above</li>
          </ul>
        </div>
      </div>

      {/* Scoring Modal */}
      <ScoringExplanationModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        category={selectedCategory}
      />

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          currentUserId="current-user"
        />
      )}
    </div>
  );
};

export default LeaderboardTestPage;