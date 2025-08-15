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
import AppBar from './components/AppBar';
import TabBar from './components/TabBar';
import HomeScreen from './components/HomeScreen';
import PlanScreen from './components/PlanScreen';
import FocusScreen from './components/FocusScreen';
import LearnScreen from './components/LearnScreen';
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import ProgressScreen from './components/ProgressScreen';
import SettingsScreen from './components/SettingsScreen';
import LeaderboardTestPage from './pages/LeaderboardTestPage';

type AppState = 'boot' | 'home' | 'plan' | 'focus' | 'learn' | 'quiz' | 'result' | 'settings' | 'leaderboard-test';

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
      success = engine.startStudySession(config.track, config.framework, config.level);
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
      if (result.progressEntry) {
        setCurrentProgress(result.progressEntry);
        saveProgress(result.progressEntry);
      }
      setAppState('result');
    }
  };

  const resetToHome = () => {
    if (!engine) return;
    engine.resetSession();
    setCurrentProgress(null);
    setAppState('home');
  };

  // Navigation functions for new 4-tab structure
  const navigateToHome = () => setAppState('home');
  const navigateToPlan = () => setAppState('plan');
  const navigateToFocus = () => setAppState('focus');
  const navigateToLearn = () => setAppState('learn');

  const showProgress = () => {
    setAppState('progress');
  };

  const showSettings = () => {
    setAppState('settings');
  };

  const showLeaderboardTest = () => {
    setAppState('leaderboard-test');
  };

  // Quick Add functionality (placeholder)
  const handleQuickAdd = () => {
    console.log('Quick Add clicked - to be implemented');
  };

  // Search functionality (placeholder)
  const handleSearch = () => {
    console.log('Search clicked - to be implemented');
  };

  const handleSplashComplete = () => {
    // Transition from boot to home (new default)
    setAppState('home');
    analytics.track('splash_completed', {
      duration: Date.now() - (window as any).__appStartTime || 0
    });
  };

  const handleBootError = () => {
    // Fallback: skip to home if boot fails
    console.warn('Boot sequence failed, falling back to home screen');
    setAppState('home');
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

      {/* AppBar - always visible except in boot/quiz/result */}
      {!['boot', 'quiz', 'result'].includes(appState) && (
        <AppBar 
          onQuickAdd={handleQuickAdd}
          onSearch={handleSearch}
          onSettings={showSettings}
        />
      )}

      <main className="app-main">
        <div className="container">
          {/* Main 4-tab navigation screens */}
          {appState === 'home' && (
            <HomeScreen 
              onStartQuickSession={() => setAppState('learn')}
              onViewProgress={showProgress}
              onShowLeaderboardTest={showLeaderboardTest}
            />
          )}
          
          {appState === 'plan' && (
            <PlanScreen />
          )}
          
          {appState === 'focus' && (
            <FocusScreen />
          )}
          
          {appState === 'learn' && (
            <LearnScreen 
              onStartStudySession={(itemId, mode) => {
                console.log(`Starting study session: ${itemId} in ${mode} mode`);
                // TODO: Integrate with DojoEngine for study sessions
                analytics.track('study_session_started', {
                  itemId,
                  mode,
                  timestamp: Date.now()
                });
              }}
            />
          )}

          {/* Legacy screens - keep for backward compatibility */}
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
              onExit={resetToHome}
            />
          )}
          
          {appState === 'result' && currentProgress && (
            <ResultScreen 
              progress={currentProgress}
              onRestart={resetToHome}
              onShowProgress={showProgress}
            />
          )}
          
          {appState === 'progress' && (
            <ProgressScreen 
              progressHistory={progressHistory}
              onBack={resetToHome}
              onClearHistory={() => {
                setProgressHistory([]);
                localStorage.removeItem('saku-dojo-progress');
              }}
            />
          )}
          
          {appState === 'settings' && (
            <SettingsScreen 
              onBack={resetToHome}
            />
          )}

          {appState === 'leaderboard-test' && (
            <LeaderboardTestPage />
          )}
        </div>
      </main>

      {/* TabBar - show for main 4 tabs */}
      {['home', 'plan', 'focus', 'learn'].includes(appState) && (
        <TabBar 
          activeTab={appState as 'home' | 'plan' | 'focus' | 'learn'}
          onTabChange={(tab) => setAppState(tab)}
        />
      )}

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