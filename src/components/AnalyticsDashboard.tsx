import { useState } from 'react';
import { useAnalytics } from '../services/analytics';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation } from '../services/location';

const AnalyticsDashboard = () => {
  const { stats, loading } = useAnalytics();
  const { t } = useTranslation();
  const { location } = useLocation();
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="analytics-dashboard error">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard animate-fade-in">
      <div className="dashboard-header">
        <h2 className="text-2xl font-bold mb-2">{t('analytics')}</h2>
        <p className="text-gray-600 mb-6">
          Real-time learning statistics from SAKULANG community
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">{t('totalUsers')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.sessionsToday.toLocaleString()}</div>
          <div className="stat-label">{t('sessionsToday')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-value">{stats.questionsAnswered.toLocaleString()}</div>
          <div className="stat-label">{t('questionsAnswered')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{Math.round(stats.averageAccuracy)}%</div>
          <div className="stat-label">{t('averageAccuracy')}</div>
        </div>
      </div>

      {/* Popular Languages */}
      <div className="popular-section mb-8">
        <h3 className="text-lg font-semibold mb-4">🌍 Popular Languages</h3>
        <div className="language-bars">
          {Object.entries(stats.popularLanguages).map(([lang, count]) => {
            const percentage = (count / Math.max(...Object.values(stats.popularLanguages))) * 100;
            return (
              <div key={lang} className="language-bar">
                <div className="language-info">
                  <span className="language-name">
                    {lang === 'EN' ? '🇺🇸 English' : '🇯🇵 Japanese'}
                  </span>
                  <span className="language-count">{count}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Frameworks */}
      <div className="popular-section mb-8">
        <h3 className="text-lg font-semibold mb-4">📚 Popular Frameworks</h3>
        <div className="framework-grid grid grid-cols-3 gap-4">
          {Object.entries(stats.popularFrameworks).map(([framework, count]) => (
            <div key={framework} className="framework-card">
              <div className="framework-icon">
                {framework === 'Classic' && '🎓'}
                {framework === 'CEFR' && '🇪🇺'}
                {framework === 'JLPT' && '🎌'}
              </div>
              <div className="framework-name">{framework}</div>
              <div className="framework-count">{count} sessions</div>
            </div>
          ))}
        </div>
      </div>

      {/* User Location (if available) */}
      {location && (
        <div className="location-section mb-8">
          <h3 className="text-lg font-semibold mb-4">📍 Your Location</h3>
          <div className="location-info">
            {location.country && (
              <span className="location-item">
                🌍 {location.country}
              </span>
            )}
            {location.city && (
              <span className="location-item">
                🏙️ {location.city}
              </span>
            )}
            {location.timezone && (
              <span className="location-item">
                🕐 {location.timezone}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toggle Details */}
      <div className="details-toggle">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn btn-secondary"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Detailed Stats */}
      {showDetails && (
        <div className="detailed-stats animate-fade-in mt-6">
          <div className="card">
            <div className="card-header">
              <h4 className="font-semibold">📊 Detailed Statistics</h4>
            </div>
            <div className="card-body">
              <div className="stats-table">
                <div className="stat-row">
                  <span>Active Users (24h)</span>
                  <span>{stats.activeUsers}</span>
                </div>
                <div className="stat-row">
                  <span>Total Questions</span>
                  <span>{stats.questionsAnswered.toLocaleString()}</span>
                </div>
                <div className="stat-row">
                  <span>Average Accuracy</span>
                  <span>{Math.round(stats.averageAccuracy * 100) / 100}%</span>
                </div>
                <div className="stat-row">
                  <span>Most Popular Language</span>
                  <span>
                    {Object.entries(stats.popularLanguages).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🔒 Privacy Notice</h4>
        <p className="text-sm text-gray-600">
          All statistics are anonymized and aggregated. No personal information is shared. 
          You can disable analytics anytime in settings.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;