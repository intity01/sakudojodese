// Scoring Explanation Modal
// "อธิบายวิธีคิดคะแนน" modal with detailed scoring breakdown

import React from 'react';
import type { SuccessCategory } from '../../types/successEvents';

interface ScoringExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: SuccessCategory;
}

export const ScoringExplanationModal: React.FC<ScoringExplanationModalProps> = ({
  isOpen,
  onClose,
  category = 'learning'
}) => {
  if (!isOpen) return null;

  const getCategoryInfo = (cat: SuccessCategory) => {
    switch (cat) {
      case 'learning':
        return {
          icon: '📚',
          name: 'Learning Points',
          description: 'Points earned from quizzes, study sessions, and knowledge acquisition',
          basePoints: [
            { action: 'Complete Quiz', points: 50, description: 'Base points for finishing any quiz' },
            { action: 'Perfect Score (100%)', points: 200, description: 'Bonus for getting all questions right' },
            { action: 'High Score (80-99%)', points: 100, description: 'Bonus for excellent performance' },
            { action: 'Good Score (60-79%)', points: 50, description: 'Bonus for solid performance' },
            { action: 'Study Session', points: 25, description: 'Points for reviewing materials' },
            { action: 'Level Up', points: 300, description: 'Major milestone achievement' }
          ],
          multipliers: [
            { factor: 'Difficulty Level', multiplier: '1.0x - 2.5x', description: 'Higher levels give more points' },
            { factor: 'Streak Bonus', multiplier: '1.0x - 2.0x', description: 'Consecutive days boost your score' },
            { factor: 'Speed Bonus', multiplier: '1.0x - 1.5x', description: 'Quick completion adds extra points' }
          ]
        };
      case 'focus':
        return {
          icon: '🎯',
          name: 'Focus Points',
          description: 'Points earned from focus sessions and productivity achievements',
          basePoints: [
            { action: 'Focus Session (25 min)', points: 25, description: 'Standard Pomodoro session' },
            { action: 'Long Focus (50+ min)', points: 75, description: 'Extended concentration period' },
            { action: 'Deep Work (2+ hours)', points: 200, description: 'Sustained deep focus achievement' },
            { action: 'Daily Focus Goal', points: 100, description: 'Meeting your daily focus target' },
            { action: 'Focus Streak', points: 50, description: 'Consecutive days of focused work' }
          ],
          multipliers: [
            { factor: 'Session Quality', multiplier: '1.0x - 1.8x', description: 'Fewer distractions = higher multiplier' },
            { factor: 'Consistency Bonus', multiplier: '1.0x - 2.0x', description: 'Regular focus sessions boost points' },
            { factor: 'Goal Achievement', multiplier: '1.2x - 1.5x', description: 'Meeting personal targets' }
          ]
        };
      case 'streak':
        return {
          icon: '🔥',
          name: 'Streak Points',
          description: 'Points earned from maintaining daily learning and focus habits',
          basePoints: [
            { action: 'Daily Login', points: 10, description: 'Just showing up counts!' },
            { action: '7-Day Streak', points: 100, description: 'One week of consistency' },
            { action: '30-Day Streak', points: 500, description: 'One month milestone' },
            { action: '100-Day Streak', points: 2000, description: 'Legendary consistency' },
            { action: 'Streak Recovery', points: 25, description: 'Getting back on track after a break' }
          ],
          multipliers: [
            { factor: 'Streak Length', multiplier: '1.0x - 5.0x', description: 'Longer streaks exponentially more valuable' },
            { factor: 'Activity Diversity', multiplier: '1.0x - 1.5x', description: 'Mixing different activities' },
            { factor: 'Weekend Bonus', multiplier: '1.2x', description: 'Extra points for weekend dedication' }
          ]
        };
      case 'achievement':
        return {
          icon: '🏆',
          name: 'Achievement Points',
          description: 'Points earned from badges, milestones, and special accomplishments',
          basePoints: [
            { action: 'First Quiz', points: 100, description: 'Welcome to the community!' },
            { action: 'Bronze Badge', points: 200, description: 'Basic achievement unlocked' },
            { action: 'Silver Badge', points: 500, description: 'Intermediate milestone reached' },
            { action: 'Gold Badge', points: 1000, description: 'Advanced achievement earned' },
            { action: 'Platinum Badge', points: 2500, description: 'Elite status unlocked' },
            { action: 'Special Event', points: 300, description: 'Participating in community events' }
          ],
          multipliers: [
            { factor: 'Rarity', multiplier: '1.0x - 10.0x', description: 'Rare achievements worth much more' },
            { factor: 'Difficulty', multiplier: '1.0x - 5.0x', description: 'Harder achievements = more points' },
            { factor: 'Community Impact', multiplier: '1.0x - 3.0x', description: 'Helping others multiplies your score' }
          ]
        };
      case 'social':
        return {
          icon: '👥',
          name: 'Social Points',
          description: 'Points earned from community contributions and helping others',
          basePoints: [
            { action: 'Help Another User', points: 75, description: 'Answering questions in chat' },
            { action: 'Share Knowledge', points: 50, description: 'Contributing tips and insights' },
            { action: 'Positive Feedback', points: 25, description: 'Receiving thanks from community' },
            { action: 'Mentor Session', points: 150, description: 'One-on-one help with another learner' },
            { action: 'Community Event', points: 100, description: 'Participating in group activities' }
          ],
          multipliers: [
            { factor: 'Impact Rating', multiplier: '1.0x - 3.0x', description: 'How much your help was valued' },
            { factor: 'Consistency', multiplier: '1.0x - 2.0x', description: 'Regular community participation' },
            { factor: 'Leadership', multiplier: '1.2x - 2.5x', description: 'Taking initiative in helping others' }
          ]
        };
      default:
        return {
          icon: '📊',
          name: 'Overall Points',
          description: 'Combined points from all categories',
          basePoints: [],
          multipliers: []
        };
    }
  };

  const categoryInfo = getCategoryInfo(category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{categoryInfo.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">อธิบายวิธีคิดคะแนน</h2>
                <p className="text-blue-100 mt-1">{categoryInfo.name}</p>
              </div>
            </div>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              {categoryInfo.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Base Points */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Base Points</span>
              </h3>
              <div className="space-y-3">
                {categoryInfo.basePoints.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{item.action}</span>
                      <span className="text-lg font-bold text-blue-600">+{item.points}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Multipliers */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>⚡</span>
                <span>Multipliers</span>
              </h3>
              <div className="space-y-3">
                {categoryInfo.multipliers.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{item.factor}</span>
                      <span className="text-lg font-bold text-orange-600">{item.multiplier}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center space-x-2">
              <span>🧮</span>
              <span>Example Calculation</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Complete Quiz (Base)</span>
                <span className="font-mono text-blue-700">50 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Perfect Score Bonus</span>
                <span className="font-mono text-blue-700">+200 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Level 3 Difficulty</span>
                <span className="font-mono text-blue-700">×1.5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">7-Day Streak</span>
                <span className="font-mono text-blue-700">×1.3</span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between items-center font-bold">
                <span className="text-blue-900">Total Points</span>
                <span className="font-mono text-blue-900 text-lg">487 points</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Calculation: (50 + 200) × 1.5 × 1.3 = 487 points
            </p>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center space-x-2">
              <span>💡</span>
              <span>Tips to Maximize Points</span>
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Maintain daily streaks for exponential point growth</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Challenge yourself with higher difficulty levels</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Aim for perfect scores to unlock bonus points</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Help others in the community for social points</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Participate in special events and challenges</span>
              </li>
            </ul>
          </div>

          {/* Fair Play Notice */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center space-x-2">
              <span>⚖️</span>
              <span>Fair Play Policy</span>
            </h3>
            <p className="text-sm text-yellow-800">
              We monitor for unusual patterns and may adjust scores to ensure fair competition. 
              Focus on genuine learning and improvement rather than gaming the system. 
              Authentic progress is always more valuable than artificial points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringExplanationModal;