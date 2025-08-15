// CoachMarks Component - Kiro Spec Compliant
// แสดงทิป Quick Add + Focus ~800ms หลังเข้าแอปครั้งแรก

import React, { useState, useEffect } from 'react';

interface CoachMarksProps {
  onComplete: () => void;
}

const CoachMarks: React.FC<CoachMarksProps> = ({ onComplete }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tips = [
    {
      title: "🚀 Quick Add",
      content: "พิมพ์งานใหม่แบบเร็ว เช่น 'อ่านหนังสือ 30m พรุ่งนี้เช้า #study'",
      position: { top: '20%', left: '50%', transform: 'translateX(-50%)' }
    },
    {
      title: "🎯 Focus Mode", 
      content: "เข้าโหมดโฟกัสเพื่อทำงานอย่างมีสมาธิ",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
  ];

  useEffect(() => {
    // Show after 800ms as per Kiro spec
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Save that tips have been seen
    localStorage.setItem('settings.tips.seen', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentTipData = tips[currentTip];
  if (!currentTipData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Tip Card */}
      <div style={{
        position: 'absolute',
        ...currentTipData.position,
        backgroundColor: 'var(--surface)',
        border: '2px solid var(--pri-500)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        maxWidth: '320px',
        boxShadow: 'var(--shadow-modal)',
        animation: 'slideIn 0.4s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--fg-0)'
          }}>
            {currentTipData.title}
          </h3>
          
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--fg-muted)',
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <p style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--fg-muted)',
          lineHeight: '1.5',
          fontSize: '0.875rem'
        }}>
          {currentTipData.content}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {tips.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === currentTip ? 'var(--pri-500)' : 'var(--border)',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              onClick={handleSkip}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--fg-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
            >
              ข้าม
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--pri-500)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {currentTip < tips.length - 1 ? 'ถัดไป' : 'เริ่มใช้งาน'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CoachMarks;