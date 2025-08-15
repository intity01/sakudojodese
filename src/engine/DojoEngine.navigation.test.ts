// DojoEngine Navigation Tests
// Comprehensive test suite for session navigation and control functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DojoEngine } from './DojoEngine';
import { SessionState } from '../types/core';
import type { SessionConfig, NavigationResult } from '../types/core';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('DojoEngine Navigation & Control', () => {
  let engine: DojoEngine;
  let mockQuestionBank: any;
  let sessionConfig: SessionConfig;

  beforeEach(() => {
    // Reset localStorage mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Create mock question bank
    mockQuestionBank = {
      EN: {
        Classic: {
          A1: [
            {
              id: 'nav-test-1',
              type: 'mcq',
              question: 'What is the capital of France?',
              choices: ['London', 'Berlin', 'Paris', 'Madrid'],
              answerIndex: 2,
              explanation: 'Paris is the capital of France.'
            },
            {
              id: 'nav-test-2',
              type: 'typing',
              question: 'Type the word "hello"',
              accept: ['hello', 'Hello'],
              explanation: 'A common greeting.'
            },
            {
              id: 'nav-test-3',
              type: 'mcq',
              question: 'What is 2 + 2?',
              choices: ['3', '4', '5', '6'],
              answerIndex: 1,
              explanation: 'Basic arithmetic.'
            },
            {
              id: 'nav-test-4',
              type: 'open',
              question: 'Describe your favorite color.',
              explanation: 'Express your preference.'
            },
            {
              id: 'nav-test-5',
              type: 'mcq',
              question: 'Which is a programming language?',
              choices: ['HTML', 'CSS', 'JavaScript', 'JSON'],
              answerIndex: 2,
              explanation: 'JavaScript is a programming language.'
            }
          ]
        }
      }
    };

    engine = new DojoEngine(mockQuestionBank);

    sessionConfig = {
      track: 'EN',
      framework: 'Classic',
      level: 'A1',
      mode: 'Quiz',
      includeCustomQuestions: false,
      questionCount: 5
    };
  });

  afterEach(() => {
    engine.disableAutoSave();
  });

  describe('Basic Navigation', () => {
    beforeEach(() => {
      engine.startSession(sessionConfig);
    });

    it('should navigate to next question successfully', () => {
      const result = engine.nextQuestion();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(1);
      expect(result.totalQuestions).toBe(5);
      expect(result.isFirstQuestion).toBe(false);
      expect(result.isLastQuestion).toBe(false);
      expect(result.question).toBeDefined();
      expect(result.question?.id).toBe('nav-test-2');
    });

    it('should navigate to previous question successfully', () => {
      // Move to second question first
      engine.nextQuestion();
      
      const result = engine.previousQuestion();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(0);
      expect(result.totalQuestions).toBe(5);
      expect(result.isFirstQuestion).toBe(true);
      expect(result.isLastQuestion).toBe(false);
      expect(result.question?.id).toBe('nav-test-1');
    });

    it('should not navigate beyond last question', () => {
      // Navigate to last question
      for (let i = 0; i < 4; i++) {
        engine.nextQuestion();
      }
      
      const result = engine.nextQuestion();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Already at last question');
      expect(result.currentIndex).toBe(4);
      expect(result.isLastQuestion).toBe(true);
    });

    it('should not navigate before first question', () => {
      const result = engine.previousQuestion();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Already at first question');
      expect(result.currentIndex).toBe(0);
      expect(result.isFirstQuestion).toBe(true);
    });

    it('should check if next/previous questions exist', () => {
      // At first question
      expect(engine.hasNextQuestion()).toBe(true);
      expect(engine.hasPreviousQuestion()).toBe(false);

      // Move to middle
      engine.nextQuestion();
      engine.nextQuestion();
      expect(engine.hasNextQuestion()).toBe(true);
      expect(engine.hasPreviousQuestion()).toBe(true);

      // Move to last
      engine.nextQuestion();
      engine.nextQuestion();
      expect(engine.hasNextQuestion()).toBe(false);
      expect(engine.hasPreviousQuestion()).toBe(true);
    });
  });

  describe('Advanced Navigation', () => {
    beforeEach(() => {
      engine.startSession(sessionConfig);
    });

    it('should jump to specific question by index', () => {
      const result = engine.jumpToQuestion(3);
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(3);
      expect(result.previousIndex).toBe(0);
      expect(result.question?.id).toBe('nav-test-4');
      expect(result.isFirstQuestion).toBe(false);
      expect(result.isLastQuestion).toBe(false);
    });

    it('should not jump to invalid question index', () => {
      const result = engine.jumpToQuestion(10);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid question index');
      expect(result.currentIndex).toBe(0); // Should stay at current position
    });

    it('should jump to first question', () => {
      // Move to middle first
      engine.jumpToQuestion(2);
      
      const result = engine.goToFirstQuestion();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(0);
      expect(result.isFirstQuestion).toBe(true);
      expect(result.question?.id).toBe('nav-test-1');
    });

    it('should jump to last question', () => {
      const result = engine.goToLastQuestion();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(4);
      expect(result.isLastQuestion).toBe(true);
      expect(result.question?.id).toBe('nav-test-5');
    });

    it('should find next unanswered question', () => {
      // Answer first question
      engine.answerMCQ(2);
      
      // Skip second question
      engine.nextQuestion();
      engine.skipQuestion();
      
      // Answer third question
      engine.nextQuestion();
      engine.answerMCQ(1);
      
      // Go back to first and find next unanswered
      engine.goToFirstQuestion();
      const result = engine.goToNextUnanswered();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(1); // Should go to skipped question
    });

    it('should find previous unanswered question', () => {
      // Skip first question
      engine.skipQuestion();
      
      // Move to third question and answer it
      engine.jumpToQuestion(2);
      engine.answerMCQ(1);
      
      // Find previous unanswered
      const result = engine.goToPreviousUnanswered();
      
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(0); // Should go to skipped first question
    });

    it('should handle no unanswered questions', () => {
      // Answer all questions
      for (let i = 0; i < 5; i++) {
        engine.jumpToQuestion(i);
        const question = engine.getCurrentQuestion();
        if (question?.type === 'mcq') {
          engine.answerMCQ(0);
        } else if (question?.type === 'typing') {
          engine.answerTyping('test');
        } else if (question?.type === 'open') {
          engine.answerOpen('test answer');
        }
      }
      
      const result = engine.goToNextUnanswered();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No unanswered questions found');
      expect(result.allAnswered).toBe(true);
    });
  });

  describe('Question Skipping', () => {
    beforeEach(() => {
      engine.startSession(sessionConfig);
    });

    it('should skip current question', () => {
      const result = engine.skipQuestion();
      
      expect(result.success).toBe(true);
      expect(result.wasSkipped).toBe(true);
      expect(result.currentIndex).toBe(0); // Should stay at same position
      
      // Check that question was marked as skipped
      const status = engine.getQuestionStatus(0);
      expect(status?.isAnswered).toBe(false);
      expect(status?.answer).toBe(null);
    });

    it('should track skipped questions correctly', () => {
      // Skip first question
      engine.skipQuestion();
      
      // Move to second and answer it
      engine.nextQuestion();
      engine.answerMCQ(0);
      
      // Skip third question
      engine.nextQuestion();
      engine.skipQuestion();
      
      const unanswered = engine.getUnansweredQuestions();
      expect(unanswered).toEqual([0, 2, 3, 4]); // First and third are skipped, last two are unanswered
    });
  });

  describe('Question Status Tracking', () => {
    beforeEach(() => {
      engine.startSession(sessionConfig);
    });

    it('should get current question status', () => {
      const status = engine.getQuestionStatus();
      
      expect(status).toBeDefined();
      expect(status?.index).toBe(0);
      expect(status?.isAnswered).toBe(false);
      expect(status?.isCorrect).toBe(null);
      expect(status?.isCurrent).toBe(true);
      expect(status?.isSkipped).toBe(false);
    });

    it('should get specific question status', () => {
      // Answer first question correctly
      engine.answerMCQ(2);
      
      const status = engine.getQuestionStatus(0);
      
      expect(status?.index).toBe(0);
      expect(status?.isAnswered).toBe(true);
      expect(status?.isCorrect).toBe(true);
      expect(status?.answer).toBe(2);
      expect(status?.isCurrent).toBe(true);
    });

    it('should get all question statuses', () => {
      // Answer first question
      engine.answerMCQ(2);
      
      // Skip second question
      engine.nextQuestion();
      engine.skipQuestion();
      
      // Answer third question incorrectly
      engine.nextQuestion();
      engine.answerMCQ(0);
      
      const allStatuses = engine.getAllQuestionStatuses();
      
      expect(allStatuses).toHaveLength(5);
      expect(allStatuses[0].isAnswered).toBe(true);
      expect(allStatuses[0].isCorrect).toBe(true);
      expect(allStatuses[1].isSkipped).toBe(true);
      expect(allStatuses[2].isAnswered).toBe(true);
      expect(allStatuses[2].isCorrect).toBe(false);
      expect(allStatuses[3].isAnswered).toBe(false);
      expect(allStatuses[4].isAnswered).toBe(false);
    });

    it('should track answered questions', () => {
      // Answer some questions
      engine.answerMCQ(2);
      engine.nextQuestion();
      engine.answerTyping('hello');
      engine.nextQuestion();
      engine.skipQuestion();
      
      const answered = engine.getAnsweredQuestions();
      const unanswered = engine.getUnansweredQuestions();
      
      expect(answered).toEqual([0, 1]);
      expect(unanswered).toEqual([2, 3, 4]);
    });

    it('should track correct and incorrect questions', () => {
      // Answer questions with mixed results
      engine.answerMCQ(2); // Correct
      engine.nextQuestion();
      engine.answerTyping('hello'); // Correct
      engine.nextQuestion();
      engine.answerMCQ(0); // Incorrect (correct answer is index 1)
      
      const correct = engine.getCorrectQuestions();
      const incorrect = engine.getIncorrectQuestions();
      
      expect(correct).toEqual([0, 1]);
      expect(incorrect).toEqual([2]);
    });
  });

  describe('Session State Management', () => {
    beforeEach(() => {
      engine.startSession(sessionConfig);
    });

    it('should save session state automatically on navigation', () => {
      engine.nextQuestion();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dojoEngine_currentSession',
        expect.any(String)
      );
    });

    it('should save session state on skip', () => {
      engine.skipQuestion();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dojoEngine_currentSession',
        expect.any(String)
      );
    });

    it('should save session state on jump', () => {
      engine.jumpToQuestion(3);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dojoEngine_currentSession',
        expect.any(String)
      );
    });

    it('should load session state correctly', () => {
      // Create a mock saved session
      const mockSession = {
        config: sessionConfig,
        questions: mockQuestionBank.EN.Classic.A1.slice(0, 5),
        currentIndex: 2,
        answers: [2, 'hello', null, null, null],
        correct: [true, true, false, false, false],
        startTime: new Date().toISOString(),
        totalPausedDuration: 0,
        state: SessionState.ACTIVE,
        sessionId: 'test-session-123',
        lastSaved: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));
      
      const newEngine = new DojoEngine(mockQuestionBank);
      const loadResult = newEngine.loadSessionState();
      
      expect(loadResult).toBe(true);
      expect(newEngine.getCurrentQuestion()?.id).toBe('nav-test-3');
      expect(newEngine.getSessionProgress().current).toBe(2);
    });

    it('should handle invalid session data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const loadResult = engine.loadSessionState();
      
      expect(loadResult).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dojoEngine_currentSession');
    });

    it('should validate session data integrity', () => {
      const invalidSession = {
        config: sessionConfig,
        questions: mockQuestionBank.EN.Classic.A1.slice(0, 3),
        currentIndex: 5, // Out of bounds
        answers: [2, 'hello'],
        correct: [true, true, false],
        startTime: new Date().toISOString(),
        state: SessionState.ACTIVE,
        sessionId: 'test-session-123'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidSession));
      
      const loadResult = engine.loadSessionState();
      
      expect(loadResult).toBe(false);
    });

    it('should recover session successfully', () => {
      const mockSession = {
        config: sessionConfig,
        questions: mockQuestionBank.EN.Classic.A1.slice(0, 5),
        currentIndex: 1,
        answers: [2, null, null, null, null],
        correct: [true, false, false, false, false],
        startTime: new Date().toISOString(),
        totalPausedDuration: 0,
        state: SessionState.ACTIVE,
        sessionId: 'recovery-test-123',
        lastSaved: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession));
      
      const newEngine = new DojoEngine(mockQuestionBank);
      const recovery = newEngine.recoverSession();
      
      expect(recovery.success).toBe(true);
      expect(recovery.sessionInfo?.sessionId).toBe('recovery-test-123');
    });

    it('should handle auto-save functionality', () => {
      vi.useFakeTimers();
      
      engine.enableAutoSave(1000); // 1 second interval
      
      // Advance time
      vi.advanceTimersByTime(1000);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      engine.disableAutoSave();
      vi.useRealTimers();
    });
  });

  describe('Navigation Error Handling', () => {
    it('should handle navigation without active session', () => {
      const nextResult = engine.nextQuestion();
      const prevResult = engine.previousQuestion();
      const skipResult = engine.skipQuestion();
      const jumpResult = engine.jumpToQuestion(1);
      
      expect(nextResult.success).toBe(false);
      expect(nextResult.error).toBe('Session is not active');
      
      expect(prevResult.success).toBe(false);
      expect(prevResult.error).toBe('Session is not active');
      
      expect(skipResult.success).toBe(false);
      expect(skipResult.error).toBe('Session is not active');
      
      expect(jumpResult.success).toBe(false);
      expect(jumpResult.error).toBe('Session is not active');
    });

    it('should handle navigation with paused session', () => {
      engine.startSession(sessionConfig);
      engine.pauseSession();
      
      const result = engine.nextQuestion();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session is not active');
    });

    it('should handle navigation with completed session', () => {
      engine.startSession(sessionConfig);
      engine.finishSession();
      
      const result = engine.nextQuestion();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session is not active');
    });
  });

  describe('Session Lifecycle Integration', () => {
    it('should maintain navigation state through pause/resume', () => {
      engine.startSession(sessionConfig);
      
      // Navigate to third question
      engine.nextQuestion();
      engine.nextQuestion();
      
      expect(engine.getCurrentQuestion()?.id).toBe('nav-test-3');
      
      // Pause and resume
      engine.pauseSession();
      engine.resumeSession();
      
      // Should still be at third question
      expect(engine.getCurrentQuestion()?.id).toBe('nav-test-3');
      
      // Should be able to navigate normally
      const result = engine.nextQuestion();
      expect(result.success).toBe(true);
      expect(result.currentIndex).toBe(3);
    });

    it('should reset navigation on session restart', () => {
      engine.startSession(sessionConfig);
      
      // Navigate and answer some questions
      engine.answerMCQ(2);
      engine.nextQuestion();
      engine.answerTyping('hello');
      engine.nextQuestion();
      
      expect(engine.getSessionProgress().current).toBe(2);
      
      // Restart session
      const restartResult = engine.restartSession();
      
      expect(restartResult.success).toBe(true);
      expect(engine.getSessionProgress().current).toBe(0);
      expect(engine.getCurrentQuestion()?.id).toBe('nav-test-1');
    });
  });
});