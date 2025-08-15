// Public Leaderboard Page
// Standalone public page for viewing leaderboards

import React, { useState } from 'react';
import { LeaderboardScreen } from '../components/leaderboard/LeaderboardScreen';
import type { SuccessCategory } from '../types/successEvents';

interface LeaderboardPageProps {
  // Optional props for embedding in larger app
  currentUserId?: string;
  onUserSelect?: (userId: string) => void;
  showNavigation?: boolean;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  currentUserId,
  onUserSelect,
  showNavigation = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SuccessCategory>('learning');
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');

  return (
    <div className="leaderboard-page min-h-screen bg-gray-50">
      {/* Optional Navigation */}
      {showNavigation && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xl font-bold text-gray-900">Saku Dojo</span>
                </div>
                <div className="hidden md:block">
                  <span className="text-gray-500">•</span>
                  <span className="ml-2 text-gray-600">Public Leaderboards</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  ← Back to App
                </a>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <LeaderboardScreen
        currentUserId={currentUserId}
        initialCategory={selectedCategory}
        initialTimeframe={selectedTimeframe}
        onUserSelect={onUserSelect}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-gray-900">Saku Dojo Leaderboards</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
              <a href="/about" className="hover:text-gray-900">About</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                Rankings update every 15 minutes. Only active learners are displayed.
              </p>
              <p>
                Built with ❤️ for the learning community • 
                <a href="https://github.com/your-repo" className="ml-1 text-blue-600 hover:text-blue-700">
                  Open Source
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LeaderboardPage;