import React, { useState } from 'react';
import type { Track, Framework, Mode } from '../types/core';

interface SessionConfig {
  track: Track;
  framework: Framework;
  level: string;
  mode: Mode;
  questionCount?: number;
}

interface StartScreenProps {
  onStartSession: (config: SessionConfig) => void;
  onShowProgress: () => void;
  progressCount: number;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStartSession,
  onShowProgress,
  progressCount
}) => {
  const [selectedTrack, setSelectedTrack] = useState<Track>('EN');
  const [selectedFramework, setSelectedFramework] = useState<Framework>('Classic');
  const [selectedLevel, setSelectedLevel] = useState<string>('Beginner');
  const [selectedMode, setSelectedMode] = useState<Mode>('Quiz');

  // Framework options based on track
  const getFrameworkOptions = (track: Track): Framework[] => {
    if (track === 'EN') return ['Classic', 'CEFR'];
    if (track === 'JP') return ['Classic', 'JLPT'];
    return ['Classic'];
  };

  // Level options based on framework
  const getLevelOptions = (framework: Framework): string[] => {
    switch (framework) {
      case 'CEFR':
        return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      case 'JLPT':
        return ['N5', 'N4', 'N3', 'N2', 'N1'];
      case 'Classic':
      default:
        return ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    }
  };

  // Update framework when track changes
  const handleTrackChange = (track: Track) => {
    setSelectedTrack(track);
    const frameworks = getFrameworkOptions(track);
    if (frameworks.length > 0) {
      setSelectedFramework(frameworks[0]);
      const levels = getLevelOptions(frameworks[0]);
      if (levels.length > 0) {
        setSelectedLevel(levels[0]);
      }
    }
  };

  // Update level when framework changes
  const handleFrameworkChange = (framework: Framework) => {
    setSelectedFramework(framework);
    const levels = getLevelOptions(framework);
    if (levels.length > 0) {
      setSelectedLevel(levels[0]);
    }
  };

  const handleStartSession = () => {
    onStartSession({
      track: selectedTrack,
      framework: selectedFramework,
      level: selectedLevel,
      mode: selectedMode
    });
  };

  return (
    <div className="start-screen">
      <div className="welcome-section">
        <h2>เริ่มเรียนรู้ภาษา</h2>
        <p>เลือกแทร็ก หลักสูตร และระดับที่เหมาะกับคุณ</p>
      </div>

      <div className="selection-grid">
        {/* Track Selection */}
        <div className="selection-group">
          <label className="selection-label">ภาษา (Track)</label>
          <div className="button-group">
            <button
              type="button"
              className={`btn ${selectedTrack === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleTrackChange('EN')}
            >
              🇺🇸 English
            </button>
            <button
              type="button"
              className={`btn ${selectedTrack === 'JP' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleTrackChange('JP')}
            >
              🇯🇵 Japanese
            </button>
          </div>
        </div>

        {/* Framework Selection */}
        <div className="selection-group">
          <label className="selection-label">หลักสูตร (Framework)</label>
          <div className="button-group">
            {getFrameworkOptions(selectedTrack).map(framework => (
              <button
                key={framework}
                type="button"
                className={`btn ${selectedFramework === framework ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleFrameworkChange(framework)}
              >
                {framework}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <div className="selection-group">
          <label className="selection-label">ระดับ (Level)</label>
          <div className="button-group">
            {getLevelOptions(selectedFramework).map(level => (
              <button
                key={level}
                type="button"
                className={`btn ${selectedLevel === level ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="selection-group">
          <label className="selection-label">โหมดการเรียน (Mode)</label>
          <div className="button-group">
            {(['Quiz', 'Study', 'Exam', 'Read', 'Write'] as Mode[]).map(mode => (
              <button
                key={mode}
                type="button"
                className={`btn ${selectedMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <button
          type="button"
          className="btn btn-primary btn-lg start-btn"
          onClick={handleStartSession}
        >
          🚀 เริ่มเรียน
        </button>

        <div className="secondary-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onShowProgress}
          >
            📊 ดูความคืบหน้า ({progressCount})
          </button>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="daily-challenge">
        <h3>🎯 Daily Challenge</h3>
        <p>ทำแบบทดสอบ 10 ข้อ ประจำวัน</p>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => onStartSession({
            track: selectedTrack,
            framework: selectedFramework,
            level: selectedLevel,
            mode: 'Quiz',
            questionCount: 10
          })}
        >
          เริ่ม Daily Challenge
        </button>
      </div>
    </div>
  );
};

export default StartScreen;