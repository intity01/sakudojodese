import React, { useState, useEffect } from 'react';

const FocusScreen: React.FC = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      setSessionCount(count => count + 1);
      // Play gentle sound (respect reduced-motion)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Gentle completion sound
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(25 * 60);
  };

  return (
    <div className="focus-screen">
      {/* Timer */}
      <div className="focus-timer">
        <div className="timer-display">
          {formatTime(time)}
        </div>
        
        <div className="timer-controls">
          {!isRunning ? (
            <button 
              className="btn btn-primary btn-lg timer-btn"
              onClick={handleStart}
            >
              Start
            </button>
          ) : (
            <button 
              className="btn btn-secondary btn-lg timer-btn"
              onClick={handlePause}
            >
              Pause
            </button>
          )}
          
          <button 
            className="btn btn-secondary timer-btn"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className="session-info">
          <span>รอบที่ {sessionCount + 1} วันนี้</span>
        </div>
      </div>

      {/* Notes */}
      <div className="focus-notes">
        <label htmlFor="focus-notes-input">บันทึกระหว่างโฟกัส</label>
        <input
          id="focus-notes-input"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="จดสิ่งที่คิดได้ระหว่างโฟกัส..."
          className="notes-input"
        />
      </div>

      {/* Stats Mini */}
      <div className="focus-stats">
        <div className="stat-item">
          <span className="stat-value">{sessionCount * 25}</span>
          <span className="stat-label">นาทีโฟกัส</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">0</span>
          <span className="stat-label">การรบกวน</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{sessionCount}</span>
          <span className="stat-label">รอบสำเร็จ</span>
        </div>
      </div>
    </div>
  );
};

export default FocusScreen;