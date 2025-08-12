import { useState } from 'react';
import type { ProgressEntry } from '../types/core';

interface ProgressScreenProps {
  progressHistory: ProgressEntry[];
  onBack: () => void;
  onClearHistory: () => void;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ 
  progressHistory, 
  onBack, 
  onClearHistory 
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [filterTrack, setFilterTrack] = useState<'all' | 'EN' | 'JP'>('all');

  const filteredHistory = progressHistory
    .filter(entry => filterTrack === 'all' || entry.track === filterTrack)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.scorePct - a.scorePct;
      }
    });

  const stats = {
    totalSessions: progressHistory.length,
    averageScore: progressHistory.length > 0 
      ? Math.round(progressHistory.reduce((sum, entry) => sum + entry.scorePct, 0) / progressHistory.length)
      : 0,
    bestScore: progressHistory.length > 0 
      ? Math.max(...progressHistory.map(entry => entry.scorePct))
      : 0,
    totalQuestions: progressHistory.reduce((sum, entry) => sum + entry.total, 0),
    totalCorrect: progressHistory.reduce((sum, entry) => sum + entry.correct, 0)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all progress history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">📊 Learning Progress</h1>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>

        {/* Statistics Cards */}
        {progressHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Average</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.bestScore}%</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalCorrect}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {progressHistory.length > 0 && (
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <select 
                    className="form-select"
                    style={{ width: 'auto', minWidth: '120px' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                  >
                    <option value="date">📅 Date</option>
                    <option value="score">🎯 Score</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Language:</label>
                  <select 
                    className="form-select"
                    style={{ width: 'auto', minWidth: '120px' }}
                    value={filterTrack}
                    onChange={(e) => setFilterTrack(e.target.value as 'all' | 'EN' | 'JP')}
                  >
                    <option value="all">🌍 All</option>
                    <option value="EN">🇺🇸 English</option>
                    <option value="JP">🇯🇵 Japanese</option>
                  </select>
                </div>
                <div className="flex-1"></div>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleClearHistory}
                >
                  🗑️ Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress History */}
      {filteredHistory.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">No Progress Yet</h2>
            <p className="text-gray-600 mb-4">
              {progressHistory.length === 0 
                ? "Start your first learning session to see your progress here!"
                : "No sessions match your current filters."
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={onBack}
            >
              Start Learning
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {entry.track === 'EN' ? '🇺🇸' : '🇯🇵'}
                      </span>
                      <div>
                        <div className="font-semibold">
                          {entry.framework} - {entry.level}
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.mode} • {formatDate(entry.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.correct}/{entry.total} questions correct
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(entry.scorePct)}`}>
                      {entry.scorePct}%
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${entry.scorePct}%`,
                        backgroundColor: entry.scorePct >= 80 ? '#10B981' : 
                                       entry.scorePct >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Badges */}
      {progressHistory.length > 0 && (
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">🏆 Achievements</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                {stats.totalSessions >= 1 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm font-medium">First Steps</div>
                  </div>
                )}
                {stats.totalSessions >= 5 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-sm font-medium">Getting Started</div>
                  </div>
                )}
                {stats.totalSessions >= 10 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-1">💪</div>
                    <div className="text-sm font-medium">Dedicated</div>
                  </div>
                )}
                {stats.bestScore >= 80 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-sm font-medium">High Scorer</div>
                  </div>
                )}
                {stats.bestScore >= 95 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl mb-1">🌟</div>
                    <div className="text-sm font-medium">Perfect!</div>
                  </div>
                )}
                {stats.totalCorrect >= 50 && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="text-sm font-medium">Scholar</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;