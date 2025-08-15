// Leaderboard Tabs Component
// Navigation between different leaderboard categories and timeframes

import React, { useState } from 'react';
import type { SuccessCategory } from '../../types/successEvents';

interface LeaderboardTab {
  id: string;
  name: string;
  icon: string;
  category: SuccessCategory;
  description: string;
}

interface TimeframeOption {
  id: string;
  name: string;
  description: string;
}

interface LeaderboardTabsProps {
  activeCategory: SuccessCategory;
  activeTimeframe: string;
  onCategoryChange: (category: SuccessCategory) => void;
  onTimeframeChange: (timeframe: string) => void;
  loading?: boolean;
}

const LEADERBOARD_TABS: LeaderboardTab[] = [
  {
    id: 'learning',
    name: 'Learning',
    icon: '📚',
    category: 'learning',
    description: 'Quiz scores, study sessions, and learning achievements'
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: '🎯',
    category: 'focus',
    description: 'Focus time, productivity, and concentration achievements'
  },
  {
    id: 'streak',
    name: 'Streaks',
    icon: '🔥',
    category: 'streak',
    description: 'Daily streaks, consistency, and habit building'
  },
  {
    id: 'achievement',
    name: 'Achievements',
    icon: '🏆',
    category: 'achievement',
    description: 'Badges earned, milestones reached, and special accomplishments'
  },
  {
    id: 'social',
    name: 'Social',
    icon: '👥',
    category: 'social',
    description: 'Community contributions and helping others'
  }
];

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  {
    id: 'daily',
    name: 'Today',
    description: 'Points earned today'
  },
  {
    id: 'weekly',
    name: 'This Week',
    description: 'Points earned this week'
  },
  {
    id: 'monthly',
    name: 'This Month',
    description: 'Points earned this month'
  },
  {
    id: 'all_time',
    name: 'All Time',
    description: 'Total points earned'
  }
];

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  activeCategory,
  activeTimeframe,
  onCategoryChange,
  onTimeframeChange,
  loading = false
}) => {
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  const activeTab = LEADERBOARD_TABS.find(tab => tab.category === activeCategory);
  const activeTimeframeOption = TIMEFRAME_OPTIONS.find(option => option.id === activeTimeframe);

  return (
    <div className="leaderboard-tabs">
      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Leaderboard categories">
          {LEADERBOARD_TABS.map((tab) => {
            const isActive = tab.category === activeCategory;
            return (
              <button
                key={tab.id}
                onClick={() => !loading && onCategoryChange(tab.category)}
                disabled={loading}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  flex items-center space-x-2 min-w-0
                `}
                title={tab.description}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Timeframe Selector & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-2 sm:space-y-0">
        {/* Active Tab Description */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>{activeTab?.icon}</span>
            <span>{activeTab?.name} Leaderboard</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab?.description}
          </p>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => !loading && setShowTimeframeDropdown(!showTimeframeDropdown)}
            disabled={loading}
            className={`
              flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
              ${loading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }
              transition-colors duration-200
            `}
          >
            <span className="font-medium text-gray-700">
              {activeTimeframeOption?.name || 'Select Period'}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showTimeframeDropdown ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showTimeframeDropdown && !loading && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {TIMEFRAME_OPTIONS.map((option) => {
                  const isActive = option.id === activeTimeframe;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        onTimeframeChange(option.id);
                        setShowTimeframeDropdown(false);
                      }}
                      className={`
                        w-full text-left px-4 py-2 text-sm transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading leaderboard...</span>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showTimeframeDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowTimeframeDropdown(false)}
        />
      )}
    </div>
  );
};

export default LeaderboardTabs;