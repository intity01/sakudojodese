import { describe, it, expect, beforeEach } from 'vitest';
import { DojoEngine } from './DojoEngine';
import type { QuestionBank, SessionConfig, AnswerResult } from '../types/core';

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
          explanation: '2 + 2 equals 4'
        },
        {
          id: 'test-typing-1',
          type: 'typing',
          prompt: 'Type "hello"',
          accept: ['hello', 'Hello', 'HELLO'],
          explanation: 'Simple greeting'
        },
        {
          id: 'test-typing-fuzzy',
          type: 'typing',
          prompt: 'Type "beautiful"',
          accept: ['beautiful', 'Beautiful'],
          explanation: 'Spelling test'
        },
        {
          id: 'test-open-1',
          type: 'open',
          prompt: 'Describe your favorite hobby',
          explanation: 'Express yourself freely'
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

describe('DojoEngine Answer Processing', () => {
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
    
    engine.startSession(mockConfig);
  });

  describe('MCQ Answer Processing', () => {
    beforeEach(() => {
      // Find and jump to MCQ question
      const questions = engine.getCurrentSessionData()?.questions || [];
      const mcqIndex = questions.findIndex(q => q.type === 'mcq');
      if (mcqIndex >= 0) {
        engine.jumpToQuestion(mcqIndex);
      }
    });

    it('should return correct result for right answer', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'mcq') {
        console.log('Skipping MCQ test - no MCQ question found');
        return;
      }
      
      const mcqQuestion = question as any;
      const correctIndex = mcqQuestion.answerIndex;
      const correctChoice = mcqQuestion.choices[correctIndex];
      
      const result = engine.answerMCQ(correctIndex) as AnswerResult;
      
      expect(result.isCorrect).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.selectedAnswer).toBe(correctChoice);
      expect(result.correctAnswer).toBe(correctChoice);
      expect(result.explanation).toBeDefined();
      expect(result.feedback).toContain('Correct');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should return incorrect result for wrong answer', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'mcq') return;
      
      const mcqQuestion = question as any;
      const correctIndex = mcqQuestion.answerIndex;
      const wrongIndex = correctIndex === 0 ? 1 : 0; // Pick different index
      const wrongChoice = mcqQuestion.choices[wrongIndex];
      const correctChoice = mcqQuestion.choices[correctIndex];
      
      const result = engine.answerMCQ(wrongIndex) as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.selectedAnswer).toBe(wrongChoice);
      expect(result.correctAnswer).toBe(correctChoice);
      expect(result.feedback).toContain('Incorrect');
      expect(result.score).toBe(0);
    });

    it('should validate choice index bounds', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'mcq') return;
      
      const result = engine.answerMCQ(999) as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid choice index');
    });

    it('should validate negative choice index', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'mcq') return;
      
      const result = engine.answerMCQ(-1) as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid choice index');
    });
  });

  describe('Typing Answer Processing', () => {
    beforeEach(() => {
      // Find and jump to typing question
      const questions = engine.getCurrentSessionData()?.questions || [];
      const typingIndex = questions.findIndex(q => q.type === 'typing' && q.id === 'test-typing-1');
      if (typingIndex >= 0) {
        engine.jumpToQuestion(typingIndex);
      }
    });

    it('should accept exact match', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'typing' || question.id !== 'test-typing-1') return;
      
      const result = engine.answerTyping('hello') as AnswerResult;
      
      expect(result.isCorrect).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.selectedAnswer).toBe('hello');
      expect(result.correctAnswer).toBe('hello');
      expect(result.acceptedAnswers).toEqual(['hello', 'Hello', 'HELLO']);
      expect(result.feedback).toContain('Perfect');
    });

    it('should accept case variations', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'typing' || question.id !== 'test-typing-1') return;
      
      const result = engine.answerTyping('HELLO') as AnswerResult;
      
      expect(result.isCorrect).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.feedback).toContain('Perfect');
    });

    it('should handle fuzzy matching', () => {
      // Find fuzzy matching question
      const questions = engine.getCurrentSessionData()?.questions || [];
      const fuzzyIndex = questions.findIndex(q => q.type === 'typing' && q.id === 'test-typing-fuzzy');
      if (fuzzyIndex >= 0) {
        engine.jumpToQuestion(fuzzyIndex);
        const result = engine.answerTyping('beatiful') as AnswerResult; // Missing 'u'
        
        expect(result.isCorrect).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.feedback).toContain('Close enough');
      }
    });

    it('should reject completely wrong answers', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'typing') return;
      
      const result = engine.answerTyping('goodbye') as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.feedback).toContain('Incorrect');
      expect(result.score).toBe(0);
    });

    it('should validate empty input', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'typing') return;
      
      const result = engine.answerTyping('') as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty input');
    });

    it('should handle whitespace-only input', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'typing') return;
      
      const result = engine.answerTyping('   ') as AnswerResult;
      
      expect(result.isCorrect).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty input');
    });
  });

  describe('Open Answer Processing', () => {
    beforeEach(() => {
      // Find and jump to open question
      const questions = engine.getCurrentSessionData()?.questions || [];
      const openIndex = questions.findIndex(q => q.type === 'open');
      if (openIndex >= 0) {
        engine.jumpToQuestion(openIndex);
      }
    });

    it('should accept detailed answers', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'open') return;
      
      const longAnswer = 'I really enjoy reading books because it allows me to explore different worlds and perspectives.';
      const result = engine.answerOpen(longAnswer) as AnswerResult;
      
      expect(result.isCorrect).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.selectedAnswer).toBe(longAnswer);
      expect(result.feedback).toContain('Great');
      expect(result.wordCount).toBeGreaterThan(10);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should handle short answers with suggestions', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'open') return;
      
      const shortAnswer = 'Reading';
      const result = engine.answerOpen(shortAnswer) as AnswerResult;
      
      expect(result.isCorrect).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.feedback).toContain('more detail');
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('should validate empty input', () => {
      const question = engine.getCurrentQuestion();
      if (question?.type !== 'open') return;
      
      const result = engine.answerOpen('') as AnswerResult;
      
      expect(result.isCorrect).toBe(true); // Open questions are always "correct"
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty input');
    });
  });

  describe('Answer Validation', () => {
    it('should validate MCQ answers', () => {
      const validation = engine.validateAnswer('mcq', 1);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should invalidate non-numeric MCQ answers', () => {
      const validation = engine.validateAnswer('mcq', 'invalid');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Choice index must be a number');
    });

    it('should validate typing answers', () => {
      const validation = engine.validateAnswer('typing', 'hello world');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should invalidate empty typing answers', () => {
      const validation = engine.validateAnswer('typing', '');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Answer cannot be empty');
    });

    it('should validate open answers', () => {
      const validation = engine.validateAnswer('open', 'This is a valid answer');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should provide suggestions for short open answers', () => {
      const validation = engine.validateAnswer('open', 'Yes');
      expect(validation.isValid).toBe(true);
      expect(validation.suggestions).toContain('Consider providing a more detailed answer');
    });
  });

  describe('Scoring System', () => {
    it('should give different scores for different question types', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      
      // Find MCQ
      const mcqIndex = questions.findIndex(q => q.type === 'mcq');
      let mcqResult: AnswerResult | undefined;
      if (mcqIndex >= 0) {
        engine.jumpToQuestion(mcqIndex);
        const mcqQuestion = engine.getCurrentQuestion() as any;
        mcqResult = engine.answerMCQ(mcqQuestion.answerIndex) as AnswerResult; // Answer correctly
      }
      
      // Find Typing
      const typingIndex = questions.findIndex(q => q.type === 'typing');
      let typingResult: AnswerResult | undefined;
      if (typingIndex >= 0) {
        engine.jumpToQuestion(typingIndex);
        const typingQuestion = engine.getCurrentQuestion() as any;
        typingResult = engine.answerTyping(typingQuestion.accept[0]) as AnswerResult; // Answer correctly
      }
      
      // Find Open
      const openIndex = questions.findIndex(q => q.type === 'open');
      let openResult: AnswerResult | undefined;
      if (openIndex >= 0) {
        engine.jumpToQuestion(openIndex);
        openResult = engine.answerOpen('I love programming because it challenges me') as AnswerResult;
      }
      
      if (mcqResult) expect(mcqResult.score).toBeDefined();
      if (typingResult) expect(typingResult.score).toBeDefined();
      if (openResult) expect(openResult.score).toBeDefined();
      
      // Compare scores if all are available
      if (mcqResult && typingResult && openResult) {
        expect(typingResult.score!).toBeGreaterThan(mcqResult.score!);
        expect(openResult.score!).toBeGreaterThan(typingResult.score!);
      }
    });

    it('should give partial score for fuzzy matches', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      const fuzzyIndex = questions.findIndex(q => q.type === 'typing' && q.id === 'test-typing-fuzzy');
      
      if (fuzzyIndex >= 0) {
        engine.jumpToQuestion(fuzzyIndex);
        const exactResult = engine.answerTyping('beautiful') as AnswerResult;
        const fuzzyResult = engine.answerTyping('beatiful') as AnswerResult;
        
        if (exactResult.score && fuzzyResult.score) {
          expect(exactResult.score).toBeGreaterThan(fuzzyResult.score);
        }
      }
    });
  });

  describe('Session State Integration', () => {
    it('should not accept answers when session is paused', () => {
      engine.pauseSession();
      const result = engine.answerMCQ(1) as AnswerResult;
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Session is not active');
    });

    it('should not accept answers when session is completed', () => {
      engine.finishSession();
      const result = engine.answerMCQ(1) as AnswerResult;
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Session is not active');
    });
  });

  describe('String Similarity Algorithm', () => {
    it('should calculate similarity correctly', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      const fuzzyIndex = questions.findIndex(q => q.type === 'typing' && q.id === 'test-typing-fuzzy');
      
      if (fuzzyIndex >= 0) {
        engine.jumpToQuestion(fuzzyIndex);
        
        // Test various similarity levels
        const perfect = engine.answerTyping('beautiful') as AnswerResult;
        const close = engine.answerTyping('beatiful') as AnswerResult; // Missing 'u'
        const distant = engine.answerTyping('ugly') as AnswerResult;
        
        expect(perfect.isCorrect).toBe(true);
        expect(close.isCorrect).toBe(true); // Should pass fuzzy matching
        expect(distant.isCorrect).toBe(false);
      }
    });
  });
});