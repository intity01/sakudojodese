import React from 'react';
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
  const scorePercent = Math.round(progress.scorePct);
  const isGoodScore = scorePercent >= 70;
  const isPerfectScore = scorePercent === 100;

  const getScoreEmoji = () => {
    if (isPerfectScore) return '🏆';
    if (scorePercent >= 90) return '🌟';
    if (scorePercent >= 80) return '🎉';
    if (scorePercent >= 70) return '👍';
    if (scorePercent >= 60) return '📚';
    return '💪';
  };

  const getScoreMessage = () => {
    if (isPerfectScore) return 'สมบูรณ์แบบ!';
    if (scorePercent >= 90) return 'ยอดเยี่ยม!';
    if (scorePercent >= 80) return 'ดีมาก!';
    if (scorePercent >= 70) return 'ดี!';
    if (scorePercent >= 60) return 'พอใช้';
    return 'ต้องฝึกฝนเพิ่มเติม';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="result-screen">
      <div className="result-header">
        <div className="score-display">
          <div className="score-emoji">{getScoreEmoji()}</div>
          <div className="score-text">
            <h1 className="score-percentage">{scorePercent}%</h1>
            <p className="score-message">{getScoreMessage()}</p>
          </div>
        </div>
      </div>

      <div className="result-details">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{progress.correct}</div>
            <div className="stat-label">ถูก</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{progress.total - progress.correct}</div>
            <div className="stat-label">ผิด</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{progress.total}</div>
            <div className="stat-label">รวม</div>
          </div>
        </div>

        <div className="session-info">
          <div className="info-row">
            <span className="info-label">ภาษา:</span>
            <span className="info-value">
              {progress.track === 'EN' ? '🇺🇸 English' : '🇯🇵 Japanese'}
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">หลักสูตร:</span>
            <span className="info-value">{progress.framework}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">ระดับ:</span>
            <span className="info-value">{progress.level}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">โหมด:</span>
            <span className="info-value">{progress.mode}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">เวลา:</span>
            <span className="info-value">{formatDate(progress.date)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="result-progress">
        <div className="progress-bar-container">
          <div 
            className={`progress-bar-fill ${isGoodScore ? 'good-score' : 'needs-improvement'}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        {isPerfectScore && (
          <div className="recommendation perfect">
            <h3>🎯 แนะนำ</h3>
            <p>คุณทำได้ดีมาก! ลองเพิ่มระดับความยากหรือเปลี่ยนโหมดการเรียนดู</p>
          </div>
        )}
        
        {isGoodScore && !isPerfectScore && (
          <div className="recommendation good">
            <h3>📈 แนะนำ</h3>
            <p>คะแนนดี! ลองทำแบบทดสอบเพิ่มเติมเพื่อเสริมความแข็งแกร่ง</p>
          </div>
        )}
        
        {!isGoodScore && (
          <div className="recommendation needs-work">
            <h3>💡 แนะนำ</h3>
            <p>ลองใช้โหมด Study เพื่อทบทวนเนื้อหาก่อนทำแบบทดสอบอีกครั้ง</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onRestart}
        >
          🔄 ทำใหม่
        </button>
        
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onShowProgress}
        >
          📊 ดูความคืบหน้า
        </button>
      </div>

      {/* Share Results (Future Feature) */}
      <div className="share-section">
        <p className="share-text">แชร์ผลลัพธ์ของคุณ</p>
        <div className="share-buttons">
          <button
            type="button"
            className="btn btn-outline share-btn"
            onClick={() => {
              const text = `ฉันได้คะแนน ${scorePercent}% ใน ${progress.framework} ${progress.level} (${progress.mode}) บน SAKULANG! 🎌`;
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
                alert('คัดลอกข้อความแล้ว!');
              }
            }}
          >
            📱 แชร์
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;