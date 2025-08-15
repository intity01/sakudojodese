import React, { useState, useEffect } from 'react';
import type { DojoEngine } from '../engine/DojoEngine';
import type { Question, MCQ, Typing, Open } from '../types/core';

interface QuestionScreenProps {
  engine: DojoEngine;
  onFinish: () => void;
  onExit: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  engine,
  onFinish,
  onExit
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<number>(-1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, correct: 0 });
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Load current question and progress
  useEffect(() => {
    updateDisplay();
    // Check if we're in study mode
    setIsStudyMode(engine.isStudyMode());
  }, []);

  const updateDisplay = () => {
    const question = engine.getCurrentQuestion();
    const sessionProgress = engine.getSessionProgress();
    
    setCurrentQuestion(question);
    setProgress(sessionProgress);
    setShowFeedback(false);
    setUserAnswer('');
    setSelectedChoice(-1);
    setAnswerResult(null);
  };

  const handleMCQAnswer = (choiceIndex: number) => {
    if (showFeedback) return;
    
    setSelectedChoice(choiceIndex);
    const result = engine.answerMCQ(choiceIndex);
    
    if (typeof result === 'object' && 'isCorrect' in result) {
      setIsCorrect(result.isCorrect);
      setAnswerResult(result);
    } else {
      // Fallback for backward compatibility
      setIsCorrect(result as boolean);
      setAnswerResult({ isCorrect: result as boolean });
    }
    
    setShowFeedback(true);
    
    // Update progress
    const sessionProgress = engine.getSessionProgress();
    setProgress(sessionProgress);
  };

  const handleTypingSubmit = () => {
    if (showFeedback || !userAnswer.trim()) return;
    
    const result = engine.answerTyping(userAnswer.trim());
    
    if (typeof result === 'object' && 'isCorrect' in result) {
      setIsCorrect(result.isCorrect);
      setAnswerResult(result);
    } else {
      // Fallback for backward compatibility
      setIsCorrect(result as boolean);
      setAnswerResult({ isCorrect: result as boolean });
    }
    
    setShowFeedback(true);
    
    // Update progress
    const sessionProgress = engine.getSessionProgress();
    setProgress(sessionProgress);
  };

  const handleOpenSubmit = () => {
    if (showFeedback) return;
    
    const result = engine.answerOpen(userAnswer);
    
    if (typeof result === 'object' && 'isCorrect' in result) {
      setIsCorrect(result.isCorrect);
      setAnswerResult(result);
    } else {
      // Open questions are always correct
      setIsCorrect(true);
      setAnswerResult({ isCorrect: true });
    }
    
    setShowFeedback(true);
    
    // Update progress
    const sessionProgress = engine.getSessionProgress();
    setProgress(sessionProgress);
  };

  const handleNext = () => {
    const result = engine.nextQuestion();
    
    if (typeof result === 'object' && 'success' in result) {
      if (result.success) {
        updateDisplay();
      } else if (result.isLastQuestion) {
        onFinish();
      }
    } else {
      // Fallback for backward compatibility
      if (engine.hasNextQuestion()) {
        updateDisplay();
      } else {
        onFinish();
      }
    }
  };

  const handlePause = () => {
    engine.pauseSession();
    // Could show pause overlay or navigate away
  };

  const handleResume = () => {
    engine.resumeSession();
  };

  const handleSkip = () => {
    const result = engine.skipQuestion();
    
    if (typeof result === 'object' && 'success' in result) {
      if (result.success) {
        updateDisplay();
        if (result.isLastQuestion) {
          // Auto-finish if we skipped the last question
          setTimeout(() => onFinish(), 1000);
        }
      }
    } else {
      // Fallback for backward compatibility
      if (engine.hasNextQuestion()) {
        updateDisplay();
      } else {
        onFinish();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentQuestion?.type === 'typing' && !showFeedback) {
      handleTypingSubmit();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="question-screen">
        <div className="loading">
          <p>กำลังโหลดคำถาม...</p>
        </div>
      </div>
    );
  }

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="question-screen">
      {/* Header with Progress */}
      <div className="question-header">
        <div className="progress-info">
          <span className="question-counter">
            {progress.current} / {progress.total}
          </span>
          {isStudyMode ? (
            <span className="mode-indicator study">
              📚 Study Mode
            </span>
          ) : (
            <span className="score">
              คะแนน: {progress.correct}/{progress.current}
            </span>
          )}
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePause}
            disabled={!engine.isSessionActive()}
          >
            ⏸️ หยุดชั่วคราว
          </button>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm exit-btn"
            onClick={onExit}
          >
            ออก
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content">
        <div className="question-prompt">
          <h2>{currentQuestion.prompt}</h2>
        </div>

        {/* MCQ Question */}
        {currentQuestion.type === 'mcq' && (
          <div className="mcq-choices">
            {(currentQuestion as MCQ).choices.map((choice, index) => (
              <button
                key={index}
                type="button"
                className={`choice-btn ${
                  selectedChoice === index ? 'selected' : ''
                } ${
                  showFeedback && index === (currentQuestion as MCQ).answerIndex 
                    ? 'correct' 
                    : showFeedback && selectedChoice === index && !isCorrect
                    ? 'incorrect'
                    : ''
                }`}
                onClick={() => handleMCQAnswer(index)}
                disabled={showFeedback}
              >
                <span className="choice-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="choice-text">{choice}</span>
              </button>
            ))}
          </div>
        )}

        {/* Typing Question */}
        {currentQuestion.type === 'typing' && (
          <div className="typing-input">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={(currentQuestion as Typing).placeholder || "พิมพ์คำตอบของคุณ..."}
              className={`typing-field ${
                showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''
              }`}
              disabled={showFeedback}
            />
            
            {!showFeedback && (
              <button
                type="button"
                className="btn btn-primary submit-btn"
                onClick={handleTypingSubmit}
                disabled={!userAnswer.trim()}
              >
                ส่งคำตอบ
              </button>
            )}

            {showFeedback && (
              <div className="accepted-answers">
                <p><strong>คำตอบที่ถูกต้อง:</strong></p>
                <ul>
                  {(currentQuestion as Typing).accept.map((answer, index) => (
                    <li key={index}>{answer}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Open Question */}
        {currentQuestion.type === 'open' && (
          <div className="open-input">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="เขียนคำตอบของคุณ..."
              className="open-field"
              rows={6}
              disabled={showFeedback}
            />
            
            {!showFeedback && (
              <button
                type="button"
                className="btn btn-primary submit-btn"
                onClick={handleOpenSubmit}
              >
                ส่งคำตอบ
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'} ${isStudyMode ? 'study-mode' : ''}`}>
            {currentQuestion.type !== 'open' && (
              <div className="feedback-result">
                {isCorrect ? (
                  <span className="result-icon correct">✅ ถูกต้อง!</span>
                ) : (
                  <span className="result-icon incorrect">❌ ไม่ถูกต้อง</span>
                )}
                {isStudyMode && (
                  <span className="study-badge">📚 Study Mode</span>
                )}
              </div>
            )}

            {/* Study Mode: Show enhanced feedback */}
            {isStudyMode && answerResult && answerResult.feedback && (
              <div className="study-feedback">
                <h4>💡 คำแนะนำ:</h4>
                <p>{answerResult.feedback}</p>
              </div>
            )}

            {/* Show correct answer for incorrect responses in Study mode */}
            {isStudyMode && !isCorrect && answerResult && answerResult.correctAnswer && (
              <div className="correct-answer">
                <h4>✅ คำตอบที่ถูกต้อง:</h4>
                <p><strong>{answerResult.correctAnswer}</strong></p>
              </div>
            )}

            {currentQuestion.explanation && (
              <div className="explanation">
                <h4>{isStudyMode ? '📖 คำอธิบายเพิ่มเติม:' : 'คำอธิบาย:'}</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}

            {currentQuestion.type === 'open' && (currentQuestion as Open).rubric && (
              <div className="rubric">
                <h4>เกณฑ์การประเมิน:</h4>
                <ul>
                  {(currentQuestion as Open).rubric!.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Study Mode: Show additional learning tips */}
            {isStudyMode && (
              <div className="study-tips">
                <p><em>💡 ใน Study Mode คุณสามารถดูคำอธิบายทันทีเพื่อการเรียนรู้ที่ดีขึ้น</em></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {showFeedback && (
        <div className="question-navigation">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSkip}
          >
            ข้าม
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
          >
            {engine.hasNextQuestion() ? 'ถัดไป' : 'เสร็จสิ้น'}
          </button>
        </div>
      )}

      {!showFeedback && currentQuestion.type !== 'open' && (
        <div className="question-navigation">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSkip}
          >
            ข้าม
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionScreen;