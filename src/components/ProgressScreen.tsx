import React, { useState } from 'react';
import type { ProgressEntry } from '../types/core';

interface ProgressScreenProps {
  progressHistory: ProgressEntry[];
  onBack: () => void;
  onClearHistory: () => void;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({
  progressHistory,
  onBack,
  onClearHistory
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'EN' | 'JP'>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | string>('all');

  // Filter progress based on selections
  const filteredProgress = progressHistory.filter(entry => {
    const trackMatch = selectedTrack === 'all' || entry.track === selectedTrack;
    const modeMatch = selectedMode === 'all' || entry.mode === selectedMode;
    return trackMatch && modeMatch;
  });

  // Calculate statistics
  const stats = {
    totalSessions: filteredProgress.length,
    averageScore: filteredProgress.length > 0 
      ? Math.round(filteredProgress.reduce((sum, entry) => sum + entry.scorePct, 0) / filteredProgress.length)
      : 0,
    totalQuestions: filteredProgress.reduce((sum, entry) => sum + entry.total, 0),
    totalCorrect: filteredProgress.reduce((sum, entry) => sum + entry.correct, 0),
    bestScore: filteredProgress.length > 0 
      ? Math.max(...filteredProgress.map(entry => entry.scorePct))
      : 0,
    recentStreak: calculateStreak(filteredProgress)
  };

  function calculateStreak(entries: ProgressEntry[]): number {
    if (entries.length === 0) return 0;
    
    // Sort by date (newest first)
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (const entry of sorted) {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'needs-work';
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      progressHistory,
      statistics: stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakulang-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <button
          type="button"
          className="btn btn-secondary btn-sm back-btn"
          onClick={onBack}
        >
          ← กลับ
        </button>
        
        <h1>📊 ความคืบหน้า</h1>
        
        <button
          type="button"
          className="btn btn-outline btn-sm export-btn"
          onClick={exportData}
        >
          📤 ส่งออก
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">เซสชัน</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.averageScore}%</div>
            <div className="stat-label">คะแนนเฉลี่ย</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.bestScore}%</div>
            <div className="stat-label">คะแนนสูงสุด</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.recentStreak}</div>
            <div className="stat-label">วันติดต่อกัน</div>
          </div>
        </div>

        <div className="accuracy-display">
          <div className="accuracy-text">
            ความแม่นยำ: {stats.totalQuestions > 0 
              ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
              : 0}%
          </div>
          <div className="accuracy-detail">
            ({stats.totalCorrect}/{stats.totalQuestions} ข้อ)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="progress-filters">
        <div className="filter-group">
          <label>ภาษา:</label>
          <select 
            value={selectedTrack} 
            onChange={(e) => setSelectedTrack(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">ทั้งหมด</option>
            <option value="EN">🇺🇸 English</option>
            <option value="JP">🇯🇵 Japanese</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>โหมด:</label>
          <select 
            value={selectedMode} 
            onChange={(e) => setSelectedMode(e.target.value)}
            className="filter-select"
          >
            <option value="all">ทั้งหมด</option>
            <option value="Quiz">Quiz</option>
            <option value="Study">Study</option>
            <option value="Exam">Exam</option>
            <option value="Read">Read</option>
            <option value="Write">Write</option>
          </select>
        </div>
      </div>

      {/* Progress History */}
      <div className="progress-history">
        <h2>ประวัติการเรียน</h2>
        
        {filteredProgress.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีข้อมูลความคืบหน้า</p>
            <p>เริ่มทำแบบทดสอบเพื่อดูผลลัพธ์ที่นี่</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredProgress
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-main">
                    <div className="history-info">
                      <div className="history-title">
                        {entry.track === 'EN' ? '🇺🇸' : '🇯🇵'} {entry.framework} {entry.level}
                      </div>
                      <div className="history-meta">
                        {entry.mode} • {formatDate(entry.date)}
                      </div>
                    </div>
                    
                    <div className="history-score">
                      <div className={`score-badge ${getScoreColor(entry.scorePct)}`}>
                        {Math.round(entry.scorePct)}%
                      </div>
                      <div className="score-detail">
                        {entry.correct}/{entry.total}
                      </div>
                    </div>
                  </div>
                  
                  <div className="history-progress">
                    <div className="progress-bar-mini">
                      <div 
                        className={`progress-fill-mini ${getScoreColor(entry.scorePct)}`}
                        style={{ width: `${entry.scorePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Clear Data */}
      {progressHistory.length > 0 && (
        <div className="danger-zone">
          <h3>⚠️ ลบข้อมูล</h3>
          <p>การดำเนินการนี้จะลบประวัติการเรียนทั้งหมด และไม่สามารถกู้คืนได้</p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติการเรียนทั้งหมด?')) {
                onClearHistory();
              }
            }}
          >
            🗑️ ลบประวัติทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;