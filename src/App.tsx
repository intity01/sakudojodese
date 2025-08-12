import { useState, useEffect } from 'react';
import { DojoEngine } from './engine/DojoEngine';
import type { Track, Framework, Mode, ProgressEntry } from './types/core';
import { sampleQuestionBank } from '../demo';
import './App.css';

// Components
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import ProgressScreen from './components/ProgressScreen';

type AppState = 'start' | 'quiz' | 'result' | 'progress';

interface SessionConfig {
  track: Track;
  framework: Framework;
  level: string;
  mode: Mode;
  questionCount?: number;
}

function App() {
  const [appState, setAppState] = useState<AppState>('start');
  const [engine] = useState(() => new DojoEngine(sampleQuestionBank));
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ProgressEntry | null>(null);

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            🎌 Saku Dojo v2
          </h1>
          <p className="app-subtitle">Language Learning Platform</p>
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
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 Saku Dojo v2 - Open Source Language Learning</p>
        </div>
      </footer>
    </div>
  );
}

export default App;