import { useState, useEffect } from 'react';
import { DojoEngine } from './engine/DojoEngine';
import type { ProgressEntry, SessionConfig } from './types/core';
// Use minimal question bank for fast loading
import { minimalQuestionBank } from './data/minimalQuestionBank';
import { ThemeProvider } from './contexts/ThemeContext';
import { analytics } from './services/analytics';
import { useAuth } from './services/auth';
import { useTranslation } from './hooks/useTranslation';
// Load CSS after initial render to not block
setTimeout(() => {
  const link1 = document.createElement('link');
  link1.rel = 'stylesheet';
  link1.href = '/src/styles/themes.css';
  document.head.appendChild(link1);
  
  const link2 = document.createElement('link');
  link2.rel = 'stylesheet';
  link2.href = '/src/App.css';
  document.head.appendChild(link2);
}, 50);

// Components
import Splash from './components/Splash';
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import ProgressScreen from './components/ProgressScreen';
import SettingsScreen from './components/SettingsScreen';

type AppState = 'boot' | 'start' | 'quiz' | 'result' | 'progress' | 'settings';

const AppContent = () => {
  const [appState, setAppState] = useState<AppState>('boot');
  const [engine, setEngine] = useState<DojoEngine | null>(null);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ProgressEntry | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, loginAsGuest } = useAuth();
  const { t } = useTranslation();

  // Boot sequence initialization
  useEffect(() => {
    if (appState === 'boot' && !isInitialized) {
      // Initialize services during boot
      const initializeApp = async () => {
        try {
          // Use minimal question bank for instant loading
          setEngine(new DojoEngine(minimalQuestionBank));
          
          // Track app start (delayed)
          setTimeout(() => analytics.trackPageView('app_start'), 100);
          
          // Auto-login as guest (delayed to not block UI)
          setTimeout(() => {
            if (!user) {
              loginAsGuest();
            }
          }, 200);
          
          // Mark as initialized
          setIsInitialized(true);
        } catch (error) {
          console.error('App initialization error:', error);
          // Continue anyway to prevent blocking
          setIsInitialized(true);
        }
      };

      initializeApp();
    }
  }, [appState, isInitialized, user, loginAsGuest]);

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
    if (!engine) return;
    
    let success = false;
    
    // Use specific mode methods for better functionality
    if (config.mode === 'Quiz') {
      success = engine.startQuizSession(config.track, config.framework, config.level, config.questionCount);
    } else if (config.mode === 'Study') {
      success = engine.startStudySession(config.track, config.framework, config.level, config.questionCount);
    } else {
      // Fallback to generic method for other modes
      success = engine.startSession(config);
    }
    
    if (success) {
      setAppState('quiz');
    } else {
      alert('ไม่พบคำถามสำหรับการตั้งค่านี้ กรุณาเลือกใหม่');
    }
  };

  const finishSession = () => {
    if (!engine) return;
    const result = engine.finishSession();
    if (result) {
      setCurrentProgress(result);
      saveProgress(result);
      setAppState('result');
    }
  };

  const resetToStart = () => {
    if (!engine) return;
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

  const handleSplashComplete = () => {
    // Transition from boot to start
    setAppState('start');
    analytics.track('splash_completed', {
      duration: Date.now() - (window as any).__appStartTime || 0
    });
  };

  const handleBootError = () => {
    // Fallback: skip to start if boot fails
    console.warn('Boot sequence failed, falling back to start screen');
    setAppState('start');
    analytics.track('boot_error', {
      timestamp: Date.now()
    });
  };

  // Track app start time for analytics and set fallback timeout
  useEffect(() => {
    if (appState === 'boot') {
      (window as any).__appStartTime = Date.now();
      
      // Fallback timeout: force transition to start after 15 seconds
      const fallbackTimeout = setTimeout(() => {
        if (appState === 'boot') {
          console.warn('Boot stage timeout, forcing transition to start');
          handleBootError();
        }
      }, 15000);

      return () => clearTimeout(fallbackTimeout);
    }
  }, [appState]);

  // Show splash during boot stage
  if (appState === 'boot' || !engine) {
    try {
      return <Splash onComplete={handleSplashComplete} />;
    } catch (error) {
      console.error('Splash component error:', error);
      handleBootError();
      return null;
    }
  }

  return (
    <div className="app" id="main-content">
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