import { useState, useEffect } from 'react';
import { DojoEngine } from '../engine/DojoEngine';
import type { Question, MCQ, Typing, Open, AnswerResult } from '../types/core';
import { isMCQ, isTyping, isOpen } from '../types/core';

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
  const [progress, setProgress] = useState({ current: 0, total: 0, correct: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    updateDisplay();
  }, []);

  const updateDisplay = () => {
    const question = engine.getCurrentQuestion();
    const prog = engine.getSessionProgress();
    setCurrentQuestion(question);
    setProgress(prog);
    setSelectedAnswer('');
    setShowResult(false);
    setLastResult(null);
    setIsAnswered(false);
  };

  const handleAnswer = () => {
    if (!currentQuestion || isAnswered) return;

    let result: AnswerResult;

    if (isMCQ(currentQuestion)) {
      result = engine.answerMCQ(Number(selectedAnswer));
    } else if (isTyping(currentQuestion)) {
      result = engine.answerTyping(String(selectedAnswer));
    } else if (isOpen(currentQuestion)) {
      result = engine.answerOpen(String(selectedAnswer));
    } else {
      return;
    }

    setLastResult(result);
    setShowResult(true);
    setIsAnswered(true);
  };

  const handleNext = () => {
    const hasNext = engine.nextQuestion();
    if (hasNext) {
      updateDisplay();
    } else {
      // Session completed
      onFinish();
    }
  };

  const handleSkip = () => {
    engine.skipQuestion();
    const hasNext = engine.nextQuestion();
    if (hasNext) {
      updateDisplay();
    } else {
      onFinish();
    }
  };

  const canAnswer = () => {
    if (isAnswered) return false;
    if (!currentQuestion) return false;
    
    if (isMCQ(currentQuestion)) {
      return selectedAnswer !== '';
    } else {
      return String(selectedAnswer).trim().length > 0;
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <div className="card">
          <div className="card-body">
            <p>Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {progress.current} of {progress.total}
          </span>
          <span className="text-sm text-gray-600">
            Score: {progress.correct}/{progress.current - 1}
          </span>
        </div>
        <div className="progress">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">
              {currentQuestion.type === 'mcq' && '🎯 Multiple Choice'}
              {currentQuestion.type === 'typing' && '⌨️ Type Your Answer'}
              {currentQuestion.type === 'open' && '✍️ Open Question'}
            </h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              ID: {currentQuestion.id}
            </span>
          </div>
        </div>

        <div className="card-body">
          <div className="mb-6">
            <p className="text-lg mb-4">{currentQuestion.prompt}</p>

            {/* MCQ Options */}
            {isMCQ(currentQuestion) && (
              <div className="space-y-3">
                {(currentQuestion as MCQ).choices.map((choice, index) => (
                  <label 
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswer === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isAnswered ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    <input
                      type="radio"
                      name="mcq-answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={(e) => !isAnswered && setSelectedAnswer(Number(e.target.value))}
                      disabled={isAnswered}
                      className="mr-3"
                    />
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Typing Input */}
            {isTyping(currentQuestion) && (
              <div>
                <input
                  type="text"
                  className="form-input"
                  placeholder={(currentQuestion as Typing).placeholder || 'Type your answer...'}
                  value={selectedAnswer}
                  onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                  autoFocus
                />
              </div>
            )}

            {/* Open Text Area */}
            {isOpen(currentQuestion) && (
              <div>
                <textarea
                  className="form-textarea"
                  placeholder="Write your answer here..."
                  value={selectedAnswer}
                  onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                  rows={4}
                  autoFocus
                />
                {(currentQuestion as Open).rubric && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <strong>Evaluation criteria:</strong> {(currentQuestion as Open).rubric!.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answer Result */}
          {showResult && lastResult && (
            <div className={`alert ${lastResult.isCorrect ? 'alert-success' : 'alert-error'} mb-4`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {lastResult.isCorrect ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold mb-2">
                    {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  {lastResult.explanation && (
                    <p className="mb-2">{lastResult.explanation}</p>
                  )}
                  {lastResult.correctAnswer && !lastResult.isCorrect && (
                    <p>
                      <strong>Correct answer:</strong> {' '}
                      {Array.isArray(lastResult.correctAnswer) 
                        ? lastResult.correctAnswer.join(', ')
                        : lastResult.correctAnswer
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="flex gap-3">
            {!isAnswered ? (
              <>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleAnswer}
                  disabled={!canAnswer()}
                >
                  Submit Answer
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSkip}
                >
                  Skip
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary flex-1"
                onClick={handleNext}
              >
                {progress.current < progress.total ? 'Next Question' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Button */}
      <div className="text-center">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onExit}
        >
          🚪 Exit Session
        </button>
      </div>
    </div>
  );
};

export default QuestionScreen;