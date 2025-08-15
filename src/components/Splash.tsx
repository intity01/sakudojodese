import { useEffect, useState } from 'react';

interface SplashProps {
  onComplete: () => void;
}

// Kiro-spec compliant splash with progress
const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Progress simulation: 12% → 28% → 56% → 86% → 92% → 100%
    const stages = [12, 28, 56, 86, 92, 100];
    let currentStage = 0;
    
    const progressTimer = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setProgress(stages[currentStage] || 100);
      } else {
        clearInterval(progressTimer);
        setTimeout(onComplete, 100);
      }
    }, 50); // Fast progression
    
    return () => clearInterval(progressTimer);
  }, [onComplete]);



  return (
    <div 
      role="status" 
      aria-label="กำลังโหลด"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#E5E7EB',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Logo */}
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🎌 SAKULANG
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '200px',
        height: '4px',
        backgroundColor: '#334155',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#10B981',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Progress Text */}
      <div style={{
        fontSize: '0.875rem',
        color: '#94A3B8',
        marginBottom: '0.5rem'
      }}>
        {progress}% · กำลังเตรียมระบบ…
      </div>

      {/* Offline Badge */}
      {!isOnline && (
        <div style={{
          fontSize: '0.75rem',
          color: '#F59E0B',
          backgroundColor: '#451A03',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          border: '1px solid #92400E'
        }}>
          · ออฟไลน์
        </div>
      )}
    </div>
  );
};

export default Splash;