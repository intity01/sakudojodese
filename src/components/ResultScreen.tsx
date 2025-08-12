import { } from 'react';
import type { ProgressEntry } from '../types/core';

interface ResultScreenProps {
  progress: ProgressEntry;
  onRestart: () => void;
  onShowProgress: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  progress, 
  onRestart, 
  onShowProgress 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '🎉';
    if (score >= 70) return '👍';
    if (score >= 60) return '👌';
    if (score >= 50) return '💪';
    return '📚';
  };

  const getEncouragement = (score: number) => {
    if (score >= 90) return "Outstanding! You're mastering this level! 🌟";
    if (score >= 80) return "Excellent work! You're ready for the next challenge! 🎉";
    if (score >= 70) return "Great job! Keep up the good work! 👍";
    if (score >= 60) return "Good effort! A little more practice will help! 👌";
    if (score >= 50) return "You're getting there! Keep practicing! 💪";
    return "Don't give up! Every expert was once a beginner! 📚";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 bounce">
          {getScoreEmoji(progress.scorePct)}
        </div>
        <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
        <p className="text-gray-600">Here are your results</p>
      </div>

      {/* Main Result Card */}
      <div className="card mb-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header text-center">
          <h2 className="text-2xl font-bold mb-2">📊 Your Score</h2>
          <div className={`text-5xl font-bold ${getScoreColor(progress.scorePct)}`}>
            {progress.scorePct}%
          </div>
          <p className="text-lg text-gray-600 mt-2">
            {progress.correct} out of {progress.total} correct
          </p>
        </div>

        <div className="card-body">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="progress" style={{ height: '12px' }}>
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${progress.scorePct}%`,
                  backgroundColor: progress.scorePct >= 80 ? '#10B981' : 
                                 progress.scorePct >= 60 ? '#F59E0B' : '#EF4444'
                }}
              ></div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="alert alert-info mb-6">
            <p className="text-center font-medium">
              {getEncouragement(progress.scorePct)}
            </p>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Language</div>
              <div className="text-lg">
                {progress.track === 'EN' ? '🇺🇸 English' : '🇯🇵 Japanese'}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Framework</div>
              <div className="text-lg">{progress.framework}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Level</div>
              <div className="text-lg">{progress.level}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Mode</div>
              <div className="text-lg">{progress.mode}</div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Completed on {formatDate(progress.date)}
          </div>
        </div>

        <div className="card-footer">
          <div className="flex flex-col gap-3">
            <button 
              className="btn btn-primary btn-lg"
              onClick={onRestart}
            >
              🚀 Start New Session
            </button>
            <button 
              className="btn btn-secondary"
              onClick={onShowProgress}
            >
              📊 View All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-lg font-semibold text-center">
            💡 Tips for Improvement
          </h3>
        </div>
        <div className="card-body">
          <div className="text-sm space-y-2">
            {progress.scorePct < 60 && (
              <>
                <p>• 📖 Review the basics of this level before trying again</p>
                <p>• 🔄 Practice similar questions to build confidence</p>
                <p>• ⏰ Take your time to read each question carefully</p>
              </>
            )}
            {progress.scorePct >= 60 && progress.scorePct < 80 && (
              <>
                <p>• 🎯 Focus on the question types you missed</p>
                <p>• 📚 Try studying mode for more detailed explanations</p>
                <p>• 🔄 Regular practice will help improve your score</p>
              </>
            )}
            {progress.scorePct >= 80 && (
              <>
                <p>• 🚀 You're ready to try the next difficulty level!</p>
                <p>• 🎯 Challenge yourself with exam mode</p>
                <p>• 📈 Keep practicing to maintain your skills</p>
              </>
            )}
            <p>• 📱 This app works offline - practice anytime, anywhere!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;