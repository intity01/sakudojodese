import React from 'react';

interface HomeScreenProps {
  onStartQuickSession?: () => void;
  onViewProgress?: () => void;
  onShowLeaderboardTest?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartQuickSession,
  onViewProgress,
  onShowLeaderboardTest
}) => {
  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="home-screen">
      {/* Today Card */}
      <div className="today-card">
        <div className="today-header">
          <h2>{today}</h2>
          <div className="progress-ring">
            <div className="progress-circle">
              <span className="progress-text">75%</span>
            </div>
          </div>
        </div>
        <div className="next-session">
          <span className="next-chip">Next at 09:00</span>
        </div>
      </div>

      {/* Quick Peek - Today's Tasks */}
      <section className="quick-peek">
        <h3>วันนี้</h3>
        <div className="task-list">
          <div className="task-item">
            <span className="task-time">09:00</span>
            <span className="task-title">ทบทวนคำศัพท์ภาษาอังกฤษ</span>
          </div>
          <div className="task-item">
            <span className="task-time">14:00</span>
            <span className="task-title">แบบฝึกหัดไวยากรณ์ญี่ปุ่น</span>
          </div>
          <div className="task-item">
            <span className="task-time">19:00</span>
            <span className="task-title">อ่านบทความภาษาอังกฤษ</span>
          </div>
        </div>
      </section>

      {/* Learn Teaser */}
      <section className="learn-teaser">
        <div className="section-header">
          <h3>คำแนะนำประจำวัน</h3>
          <button className="view-all-button">ดูทั้งหมด →</button>
        </div>
        <div className="learn-cards">
          <div className="learn-card">
            <span className="word">Serendipity</span>
            <span className="meaning">ความบังเอิญที่ดี</span>
          </div>
          <div className="learn-card">
            <span className="word">頑張る</span>
            <span className="meaning">พยายาม, ทำให้ดีที่สุด</span>
          </div>
          <div className="learn-card">
            <span className="word">Resilience</span>
            <span className="meaning">ความยืดหยุ่น, ความแข็งแกร่ง</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="btn btn-primary btn-lg"
          onClick={onStartQuickSession}
        >
          🚀 เริ่มเรียนด่วน
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onViewProgress}
        >
          📊 ดูความคืบหน้า
        </button>
        {/* Development Test Button */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            className="btn btn-outline"
            onClick={onShowLeaderboardTest}
            style={{ 
              marginTop: '8px',
              fontSize: '14px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #d1d5db'
            }}
          >
            🏆 Test Leaderboard Components
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;