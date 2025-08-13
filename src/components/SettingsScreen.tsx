import { useState } from 'react';
import { useAuth } from '../services/auth';
import { useNotifications } from '../services/notifications';
import { useLocation } from '../services/location';
import { useAnalytics } from '../services/analytics';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from './ThemeSelector';
import AnalyticsDashboard from './AnalyticsDashboard';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { user, updatePreferences, exportUserData, deleteAccount } = useAuth();
  const { settings: notifSettings, updateSettings: updateNotifSettings, requestPermission, testNotification } = useNotifications();
  const { settings: locationSettings, updateSettings: updateLocationSettings, requestPermission: requestLocationPermission } = useLocation();
  const { isEnabled: analyticsEnabled, setEnabled: setAnalyticsEnabled } = useAnalytics();
  const { t, language } = useTranslation();
  const { setLanguage } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'privacy' | 'analytics' | 'about'>('appearance');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLanguageChange = (newLanguage: 'en' | 'th' | 'ja') => {
    setLanguage(newLanguage);
    if (user) {
      updatePreferences({ language: newLanguage });
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sakulang-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      await deleteAccount();
      onBack();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 10000); // Auto-cancel after 10s
    }
  };

  const tabs = [
    { id: 'appearance', name: t('appearance'), icon: '🎨' },
    { id: 'notifications', name: t('notifications'), icon: '🔔' },
    { id: 'privacy', name: t('privacy'), icon: '🔒' },
    { id: 'analytics', name: t('analytics'), icon: '📊' },
    { id: 'about', name: t('about'), icon: 'ℹ️' }
  ] as const;

  return (
    <div className="settings-screen animate-fade-in">
      <div className="settings-header">
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          ← {t('back')}
        </button>
        <h1 className="text-2xl font-bold mt-4 mb-2">{t('settings')}</h1>
        <p className="text-gray-600 mb-6">Customize your SAKULANG experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="tab-content animate-slide-in">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">🎨 {t('appearance')}</h3>
              </div>
              <div className="card-body">
                <ThemeSelector />
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">🌍 {t('language')}</h4>
                  <div className="language-selector">
                    {[
                      { code: 'en', name: '🇺🇸 English', native: 'English' },
                      { code: 'th', name: '🇹🇭 ไทย', native: 'ภาษาไทย' },
                      { code: 'ja', name: '🇯🇵 日本語', native: '日本語' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code as any)}
                        className={`language-option ${language === lang.code ? 'active' : ''}`}
                      >
                        <span className="language-flag">{lang.name.split(' ')[0]}</span>
                        <div className="language-names">
                          <div className="language-english">{lang.name.split(' ')[1]}</div>
                          <div className="language-native">{lang.native}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-content animate-slide-in">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">🔔 {t('notifications')}</h3>
              </div>
              <div className="card-body">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Enable Notifications</div>
                    <div className="setting-description">
                      Get reminders and achievement notifications
                    </div>
                  </div>
                  <div className="setting-control">
                    <button
                      onClick={requestPermission}
                      className={`toggle-button ${notifSettings.enabled ? 'active' : ''}`}
                      disabled={notifSettings.enabled}
                    >
                      {notifSettings.enabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>

                {notifSettings.enabled && (
                  <>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-title">{t('dailyReminder')}</div>
                        <div className="setting-description">
                          Daily learning reminder at your preferred time
                        </div>
                      </div>
                      <div className="setting-control">
                        <input
                          type="checkbox"
                          checked={notifSettings.dailyReminder}
                          onChange={(e) => updateNotifSettings({ dailyReminder: e.target.checked })}
                          className="checkbox"
                        />
                      </div>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-title">{t('studyTime')}</div>
                        <div className="setting-description">
                          When would you like to be reminded?
                        </div>
                      </div>
                      <div className="setting-control">
                        <input
                          type="time"
                          value={notifSettings.studyTime}
                          onChange={(e) => updateNotifSettings({ studyTime: e.target.value })}
                          className="time-input"
                        />
                      </div>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-title">{t('achievements')}</div>
                        <div className="setting-description">
                          Get notified when you unlock achievements
                        </div>
                      </div>
                      <div className="setting-control">
                        <input
                          type="checkbox"
                          checked={notifSettings.achievements}
                          onChange={(e) => updateNotifSettings({ achievements: e.target.checked })}
                          className="checkbox"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={testNotification}
                        className="btn btn-secondary btn-sm"
                      >
                        🧪 Test Notification
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="tab-content animate-slide-in">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">🔒 {t('privacy')}</h3>
              </div>
              <div className="card-body">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Analytics & Usage Data</div>
                    <div className="setting-description">
                      Help improve SAKULANG by sharing anonymous usage data
                    </div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="checkbox"
                    />
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Location Services</div>
                    <div className="setting-description">
                      Share your location for regional statistics (optional)
                    </div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      checked={locationSettings.enabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          requestLocationPermission();
                        } else {
                          updateLocationSettings({ enabled: false });
                        }
                      }}
                      className="checkbox"
                    />
                  </div>
                </div>

                {locationSettings.enabled && (
                  <>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-title">Share Country</div>
                        <div className="setting-description">
                          Include your country in statistics
                        </div>
                      </div>
                      <div className="setting-control">
                        <input
                          type="checkbox"
                          checked={locationSettings.shareCountry}
                          onChange={(e) => updateLocationSettings({ shareCountry: e.target.checked })}
                          className="checkbox"
                        />
                      </div>
                    </div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-title">Share City</div>
                        <div className="setting-description">
                          Include your city in statistics
                        </div>
                      </div>
                      <div className="setting-control">
                        <input
                          type="checkbox"
                          checked={locationSettings.shareCity}
                          onChange={(e) => updateLocationSettings({ shareCity: e.target.checked })}
                          className="checkbox"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="privacy-actions mt-6">
                  <button
                    onClick={handleExportData}
                    className="btn btn-secondary mr-3"
                  >
                    📥 Export My Data
                  </button>
                  
                  <button
                    onClick={handleDeleteAccount}
                    className={`btn ${showDeleteConfirm ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    {showDeleteConfirm ? '⚠️ Confirm Delete' : '🗑️ Delete Account'}
                  </button>
                  
                  {showDeleteConfirm && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ This will permanently delete all your data. Click again to confirm.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content animate-slide-in">
            <AnalyticsDashboard />
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="tab-content animate-slide-in">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">ℹ️ {t('about')}</h3>
              </div>
              <div className="card-body">
                <div className="about-content">
                  <div className="app-info">
                    <div className="app-logo">🎌</div>
                    <h2 className="app-name">SAKULANG</h2>
                    <p className="app-version">Version 1.0.0</p>
                    <p className="app-description">
                      Free language learning platform with beautiful UI, 
                      analytics, and smart notifications.
                    </p>
                  </div>

                  <div className="features-list">
                    <h4 className="font-semibold mb-3">✨ Features</h4>
                    <ul className="feature-items">
                      <li>🌍 Multi-language support (EN, TH, JP)</li>
                      <li>📚 Multiple frameworks (Classic, CEFR, JLPT)</li>
                      <li>🎯 3 question types (MCQ, Typing, Open)</li>
                      <li>📱 Mobile-friendly PWA</li>
                      <li>💾 Offline support</li>
                      <li>📊 Progress tracking & analytics</li>
                      <li>🔔 Smart notifications</li>
                      <li>🎨 Beautiful themes</li>
                      <li>🔒 Privacy-focused</li>
                    </ul>
                  </div>

                  <div className="links-section">
                    <h4 className="font-semibold mb-3">🔗 Links</h4>
                    <div className="link-buttons">
                      <a 
                        href="https://github.com/intity01/saku-dojo-v2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        📂 Source Code
                      </a>
                      <a 
                        href="https://intity01.github.io/saku-dojo-v2/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        🌐 Website
                      </a>
                    </div>
                  </div>

                  <div className="credits">
                    <p className="text-sm text-gray-600 mt-6">
                      Made with ❤️ for language learners worldwide
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      © 2024 SAKULANG - Open Source Language Learning Platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;