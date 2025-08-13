import { useState, useEffect } from 'react';
import { DojoEngine } from './engine/DojoEngine';
import type { Track, Framework, Mode, ProgressEntry } from './types/core';
import { sampleQuestionBank } from '../demo';
import { ThemeProvider } from './contexts/ThemeContext';
import { analytics } from './services/analytics';
import { useAuth } from './services/auth';
import { useTranslation } from './hooks/useTranslation';
import './styles/themes.css';
import './App.css';

// Components
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import ProgressScreen from './components/ProgressScreen';
import SettingsScreen from './components/SettingsScreen';

type AppState = 'start' | 'quiz' | 'result' | 'progress' | 'settings';

interface SessionConfig {
  track: Track;
  framework: Framework;
  level: string;
  mode: Mode;
  questionCount?: number;
}

const AppContent = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [engine] = useState(() => new DojoEngine(sampleQuestionBank));
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ProgressEntry | null>(null);
  const { user, loginAsGuest } = useAuth();
  const { t } = useTranslation();

  // Initialize analytics and auto-login
  useEffect(() => {
    analytics.trackPageView('app_start');
    
    // Auto-login as guest if no user
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saku-dojo-progress');
    if (saved) {
      try {
        setProgressHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (entry: ProgressEntry) => {
    const updated = [...progressHistory, entry];
    setProgressHistory(updated);
    localStorage.setItem('saku-dojo-progress', JSON.stringify(updated));
  };

  const startSession = (config: SessionConfig) => {
    const success = engine.startSession(config);
    if (success) {
      setAppState('quiz');
    } else {
      alert('ไม่พบคำถามสำหรับการตั้งค่านี้ กรุณาเลือกใหม่');
    }
  };

  const finishSession = () => {
    const result = engine.finishSession();
    if (result) {
      setCurrentProgress(result);
      saveProgress(result);
      setAppState('result');
    }
  };

  const resetToStart = () => {
    engine.resetSession();
    setCurrentProgress(null);
    setAppState('start');
  };

  const showProgress = () => {
    setAppState('progress');
  };

  const showSettings = () => {
    setAppState('settings');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1 className="app-title">
                🎌 SAKULANG
              </h1>
              <p className="app-subtitle">{t('tagline')}</p>
            </div>
            <div className="header-actions">
              {user && (
                <div className="user-info">
                  <span className="user-name">👋 {user.username}</span>
                </div>
              )}
              <button 
                onClick={showSettings}
                className="btn btn-secondary btn-sm settings-btn"
                title={t('settings')}
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {appState === 'start' && (
            <StartScreen 
              onStartSession={startSession}
              onShowProgress={showProgress}
              progressCount={progressHistory.length}
            />
          )}
          
          {appState === 'quiz' && (
            <QuestionScreen 
              engine={engine}
              onFinish={finishSession}
              onExit={resetToStart}
            />
          )}
          
          {appState === 'result' && currentProgress && (
            <ResultScreen 
              progress={currentProgress}
              onRestart={resetToStart}
              onShowProgress={showProgress}
            />
          )}
          
          {appState === 'progress' && (
            <ProgressScreen 
              progressHistory={progressHistory}
              onBack={resetToStart}
              onClearHistory={() => {
                setProgressHistory([]);
                localStorage.removeItem('saku-dojo-progress');
              }}
            />
          )}
          
          {appState === 'settings' && (
            <SettingsScreen 
              onBack={resetToStart}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 SAKULANG - Free Language Learning Platform</p>
        </div>
      </footer>
    </div>
  );
};

// Main App with Providers
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;