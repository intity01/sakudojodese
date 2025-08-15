import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DojoEngine } from './DojoEngine';
import { SessionState } from '../types/core';
import type { QuestionBank, SessionConfig } from '../types/core';

// Mock question bank for testing
const mockQuestionBank: QuestionBank = {
  EN: {
    Classic: {
      Beginner: [
        {
          id: 'test-mcq-1',
          type: 'mcq',
          prompt: 'What is 2 + 2?',
          choices: ['3', '4', '5', '6'],
          answerIndex: 1,
          explanation: '2 + 2 = 4'
        },
        {
          id: 'test-typing-1',
          type: 'typing',
          prompt: 'Type "hello"',
          accept: ['hello', 'Hello'],
          explanation: 'Simple greeting'
        },
        {
          id: 'test-open-1',
          type: 'open',
          prompt: 'Describe your day',
          explanation: 'Open-ended question'
        }
      ]
    }
  },
  JP: {
    Classic: {
      Beginner: []
    }
  }
};

describe('DojoEngine Session Management', () => {
  let engine: DojoEngine;
  let mockConfig: SessionConfig;

  beforeEach(() => {
    engine = new DojoEngine(mockQuestionBank);
    mockConfig = {
      track: 'EN',
      framework: 'Classic',
      level: 'Beginner',
      mode: 'Quiz'
    };
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('Session State Management', () => {
    it('should start with IDLE state', () => {
      expect(engine.getSessionState()).toBe(SessionState.IDLE);
    });

    it('should transition to ACTIVE when starting session', () => {
      const success = engine.startSession(mockConfig);
      expect(success).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.ACTIVE);
    });

    it('should pause and resume session', () => {
      engine.startSession(mockConfig);
      
      const pauseSuccess = engine.pauseSession();
      expect(pauseSuccess).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.PAUSED);
      
      const resumeSuccess = engine.resumeSession();
      expect(resumeSuccess).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.ACTIVE);
    });

    it('should not pause when session is not active', () => {
      const pauseSuccess = engine.pauseSession();
      expect(pauseSuccess).toBe(false);
    });

    it('should not resume when session is not paused', () => {
      engine.startSession(mockConfig);
      const resumeSuccess = engine.resumeSession();
      expect(resumeSuccess).toBe(false);
    });

    it('should complete session when finished', () => {
      engine.startSession(mockConfig);
      const result = engine.finishSession();
      
      expect(result).toBeTruthy();
      expect(engine.getSessionState()).toBe(SessionState.COMPLETED);
    });
  });

  describe('Session Duration Tracking', () => {
    it('should track session duration', async () => {
      engine.startSession(mockConfig);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const duration = engine.getSessionDuration();
      expect(duration).toBeGreaterThan(0);
    });

    it('should exclude paused time from duration', async () => {
      engine.startSession(mockConfig);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      engine.pauseSession();
      
      // Wait while paused
      await new Promise(resolve => setTimeout(resolve, 20));
      
      engine.resumeSession();
      
      const duration = engine.getSessionDuration();
      // Duration should be less than total elapsed time due to pause
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Session History', () => {
    it('should maintain session history', () => {
      engine.startSession(mockConfig);
      engine.finishSession();
      
      const history = engine.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].config).toEqual(mockConfig);
    });

    it('should clear session history', () => {
      engine.startSession(mockConfig);
      engine.finishSession();
      
      engine.clearSessionHistory();
      const history = engine.getSessionHistory();
      expect(history).toHaveLength(0);
    });

    it('should find session by ID', () => {
      engine.startSession(mockConfig);
      const sessionData = engine.getCurrentSessionData();
      engine.finishSession();
      
      if (sessionData) {
        const foundSession = engine.getSessionById(sessionData.sessionId);
        expect(foundSession).toBeTruthy();
        expect(foundSession?.sessionId).toBe(sessionData.sessionId);
      }
    });
  });

  describe('Enhanced Navigation', () => {
    beforeEach(() => {
      engine.startSession(mockConfig);
    });

    it('should jump to specific question', () => {
      const result = engine.jumpToQuestion(1);
      expect(result.success).toBe(true);
      
      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(1);
    });

    it('should not jump to invalid question index', () => {
      const result = engine.jumpToQuestion(999);
      expect(result.success).toBe(false);
    });

    it('should not allow navigation when session is paused', () => {
      engine.pauseSession();
      
      engine.nextQuestion();
      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(0); // Should not have moved
    });
  });

  describe('Session Validation', () => {
    it('should validate active session', () => {
      engine.startSession(mockConfig);
      const validation = engine.validateSession();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid session', () => {
      const validation = engine.validateSession();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No active session');
    });
  });

  describe('Session Persistence', () => {
    it('should save session to storage', () => {
      engine.startSession(mockConfig);
      const success = engine.saveSessionToStorage();
      
      expect(success).toBe(true);
      expect(localStorage.getItem('dojo-current-session')).toBeTruthy();
    });

    it('should load session from storage', () => {
      engine.startSession(mockConfig);
      engine.saveSessionToStorage();
      
      // Create new engine instance
      const newEngine = new DojoEngine(mockQuestionBank);
      const success = newEngine.loadSessionFromStorage();
      
      expect(success).toBe(true);
      expect(newEngine.getSessionState()).toBe(SessionState.ACTIVE);
    });

    it('should clear stored session', () => {
      engine.startSession(mockConfig);
      engine.saveSessionToStorage();
      
      engine.clearStoredSession();
      expect(localStorage.getItem('dojo-current-session')).toBeNull();
    });
  });

  describe('Session Statistics', () => {
    it('should calculate session stats', () => {
      // Complete a session
      engine.startSession(mockConfig);
      
      // Find and answer MCQ question
      const questions = engine.getCurrentSessionData()?.questions || [];
      const mcqIndex = questions.findIndex(q => q.type === 'mcq');
      if (mcqIndex >= 0) {
        engine.jumpToQuestion(mcqIndex);
        const mcqQuestion = engine.getCurrentQuestion() as any;
        engine.answerMCQ(mcqQuestion.answerIndex); // Correct answer
      }
      
      engine.finishSession();
      
      const stats = engine.getSessionStats();
      expect(stats.totalSessions).toBe(1);
      expect(stats.completedSessions).toBe(1);
      expect(stats.averageScore).toBeGreaterThan(0);
    });

    it('should handle empty session history', () => {
      const stats = engine.getSessionStats();
      expect(stats.totalSessions).toBe(0);
      expect(stats.completedSessions).toBe(0);
      expect(stats.averageScore).toBe(0);
    });
  });

  describe('Answer Processing with Session State', () => {
    beforeEach(() => {
      engine.startSession(mockConfig);
    });

    it('should not accept answers when session is paused', () => {
      engine.pauseSession();
      
      const result = engine.answerMCQ(1);
      expect(result.isValid).toBe(false);
    });

    it('should not accept answers when session is completed', () => {
      engine.finishSession();
      
      const result = engine.answerMCQ(1);
      expect(result.isValid).toBe(false);
    });

    it('should accept answers when session is active', () => {
      // Jump to the MCQ question (first question)
      engine.jumpToQuestion(0);
      const question = engine.getCurrentQuestion();
      
      if (question?.type === 'mcq') {
        const mcqQuestion = question as any;
        const correctIndex = mcqQuestion.answerIndex;
        const result = engine.answerMCQ(correctIndex);
        expect(result.isValid).toBe(true);
        expect(result.isCorrect).toBe(true);
      } else {
        // If not MCQ, test with open question
        const result = engine.answerOpen('This is a detailed test answer with more than ten words to ensure validity.');
        expect(result.isValid).toBe(true);
        expect(result.isCorrect).toBe(true);
      }
    });
  });

  describe('Session Recovery', () => {
    it('should handle corrupted session data gracefully', () => {
      localStorage.setItem('dojo-current-session', 'invalid-json');
      
      const success = engine.loadSessionFromStorage();
      expect(success).toBe(false);
    });

    it('should validate loaded session structure', () => {
      const invalidSession = { invalid: 'data' };
      localStorage.setItem('dojo-current-session', JSON.stringify(invalidSession));
      
      const success = engine.loadSessionFromStorage();
      expect(success).toBe(false);
    });
  });
});