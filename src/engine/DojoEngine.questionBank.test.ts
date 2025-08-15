import { describe, it, expect, beforeEach } from 'vitest';
import { DojoEngine } from './DojoEngine';
import { comprehensiveQuestionBank } from '../data/questionBanks';
import type { SessionConfig } from '../types/core';

describe('DojoEngine Question Bank Integration', () => {
  let engine: DojoEngine;

  beforeEach(() => {
    engine = new DojoEngine(comprehensiveQuestionBank);
  });

  describe('Question Bank Access', () => {
    it('should get available tracks', () => {
      const tracks = engine.getAvailableTracks();
      expect(tracks).toContain('EN');
      expect(tracks).toContain('JP');
      expect(tracks.length).toBe(2);
    });

    it('should get available frameworks for English', () => {
      const frameworks = engine.getAvailableFrameworks('EN');
      expect(frameworks).toContain('Classic');
      expect(frameworks).toContain('CEFR');
      expect(frameworks.length).toBe(2);
    });

    it('should get available frameworks for Japanese', () => {
      const frameworks = engine.getAvailableFrameworks('JP');
      expect(frameworks).toContain('Classic');
      expect(frameworks).toContain('JLPT');
      expect(frameworks.length).toBe(2);
    });

    it('should get available levels for English Classic', () => {
      const levels = engine.getAvailableLevels('EN', 'Classic');
      expect(levels).toContain('Beginner');
      expect(levels).toContain('Intermediate');
      expect(levels).toContain('Advanced');
      expect(levels).toContain('Expert');
      expect(levels.length).toBe(4);
    });

    it('should get available levels for Japanese JLPT', () => {
      const levels = engine.getAvailableLevels('JP', 'JLPT');
      expect(levels).toContain('N5');
      expect(levels).toContain('N4');
      expect(levels).toContain('N3');
      expect(levels).toContain('N2');
      expect(levels).toContain('N1');
      expect(levels.length).toBe(5);
    });

    it('should get question count for specific combinations', () => {
      const count = engine.getQuestionCount('EN', 'Classic', 'Beginner');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for invalid combinations', () => {
      expect(engine.getQuestionCount('INVALID' as any, 'Classic', 'Beginner')).toBe(0);
      expect(engine.getQuestionCount('EN', 'INVALID' as any, 'Beginner')).toBe(0);
      expect(engine.getQuestionCount('EN', 'Classic', 'INVALID')).toBe(0);
    });
  });

  describe('Question Filtering', () => {
    it('should filter questions by type', () => {
      const mcqQuestions = engine.getQuestionsByType('EN', 'Classic', 'Beginner', 'mcq');
      const typingQuestions = engine.getQuestionsByType('EN', 'Classic', 'Beginner', 'typing');
      const openQuestions = engine.getQuestionsByType('EN', 'Classic', 'Beginner', 'open');

      expect(mcqQuestions.every(q => q.type === 'mcq')).toBe(true);
      expect(typingQuestions.every(q => q.type === 'typing')).toBe(true);
      expect(openQuestions.every(q => q.type === 'open')).toBe(true);
    });

    it('should get random questions from bank', () => {
      const randomQuestions = engine.getRandomQuestionsFromBank('EN', 'Classic', 'Beginner', 3);
      expect(randomQuestions.length).toBeLessThanOrEqual(3);
      expect(randomQuestions.length).toBeGreaterThan(0);
    });

    it('should not return more questions than available', () => {
      const totalQuestions = engine.getQuestionCount('EN', 'Classic', 'Beginner');
      const randomQuestions = engine.getRandomQuestionsFromBank('EN', 'Classic', 'Beginner', totalQuestions + 10);
      expect(randomQuestions.length).toBe(totalQuestions);
    });
  });

  describe('Session Creation with Question Bank', () => {
    it('should create session with English Classic questions', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };

      const success = engine.startSession(config);
      expect(success).toBe(true);

      const sessionData = engine.getCurrentSessionData();
      expect(sessionData).toBeDefined();
      expect(sessionData!.questions.length).toBeGreaterThan(0);
      expect(sessionData!.config).toEqual(config);
    });

    it('should create session with Japanese JLPT questions', () => {
      const config: SessionConfig = {
        track: 'JP',
        framework: 'JLPT',
        level: 'N5',
        mode: 'Quiz'
      };

      const success = engine.startSession(config);
      expect(success).toBe(true);

      const sessionData = engine.getCurrentSessionData();
      expect(sessionData).toBeDefined();
      expect(sessionData!.questions.length).toBeGreaterThan(0);
      expect(sessionData!.config).toEqual(config);
    });

    it('should create session with English CEFR questions', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'CEFR',
        level: 'A1',
        mode: 'Study'
      };

      const success = engine.startSession(config);
      expect(success).toBe(true);

      const sessionData = engine.getCurrentSessionData();
      expect(sessionData).toBeDefined();
      expect(sessionData!.questions.length).toBeGreaterThan(0);
    });

    it('should fail to create session with invalid configuration', () => {
      const config: SessionConfig = {
        track: 'INVALID' as any,
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };

      const success = engine.startSession(config);
      expect(success).toBe(false);
    });

    it('should create exam session with mixed question types', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Intermediate',
        mode: 'Exam'
      };

      const success = engine.startSession(config);
      expect(success).toBe(true);

      const sessionData = engine.getCurrentSessionData();
      expect(sessionData).toBeDefined();
      
      const questions = sessionData!.questions;
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(20); // Exam mode limit

      // Should have mixed question types
      const questionTypes = new Set(questions.map(q => q.type));
      expect(questionTypes.size).toBeGreaterThan(1); // Multiple types
    });

    it('should limit quiz session questions', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz',
        questionCount: 5
      };

      const success = engine.startSession(config);
      expect(success).toBe(true);

      const sessionData = engine.getCurrentSessionData();
      expect(sessionData).toBeDefined();
      expect(sessionData!.questions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Question Bank Integration with Answer Processing', () => {
    beforeEach(() => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      engine.startSession(config);
    });

    it('should process MCQ answers from question bank', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      const mcqIndex = questions.findIndex(q => q.type === 'mcq');
      
      if (mcqIndex >= 0) {
        engine.jumpToQuestion(mcqIndex);
        const question = engine.getCurrentQuestion() as any;
        
        // Answer correctly
        const result = engine.answerMCQ(question.answerIndex);
        expect(result.isCorrect).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.explanation).toBeDefined();
        expect(result.score).toBeGreaterThan(0);
      }
    });

    it('should process typing answers from question bank', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      const typingIndex = questions.findIndex(q => q.type === 'typing');
      
      if (typingIndex >= 0) {
        engine.jumpToQuestion(typingIndex);
        const question = engine.getCurrentQuestion() as any;
        
        // Answer with first accepted answer
        const result = engine.answerTyping(question.accept[0]);
        expect(result.isCorrect).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.explanation).toBeDefined();
        expect(result.score).toBeGreaterThan(0);
      }
    });

    it('should process open answers from question bank', () => {
      const questions = engine.getCurrentSessionData()?.questions || [];
      const openIndex = questions.findIndex(q => q.type === 'open');
      
      if (openIndex >= 0) {
        engine.jumpToQuestion(openIndex);
        
        const result = engine.answerOpen('This is a detailed answer with more than ten words to demonstrate proper functionality.');
        expect(result.isCorrect).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.explanation).toBeDefined();
        expect(result.score).toBeGreaterThan(0);
      }
    });
  });

  describe('Multi-Framework Support', () => {
    it('should handle different English frameworks', () => {
      // Test Classic framework
      const classicConfig: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      
      expect(engine.startSession(classicConfig)).toBe(true);
      engine.resetSession();

      // Test CEFR framework
      const cefrConfig: SessionConfig = {
        track: 'EN',
        framework: 'CEFR',
        level: 'A1',
        mode: 'Quiz'
      };
      
      expect(engine.startSession(cefrConfig)).toBe(true);
    });

    it('should handle different Japanese frameworks', () => {
      // Test Classic framework
      const classicConfig: SessionConfig = {
        track: 'JP',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      
      expect(engine.startSession(classicConfig)).toBe(true);
      engine.resetSession();

      // Test JLPT framework
      const jlptConfig: SessionConfig = {
        track: 'JP',
        framework: 'JLPT',
        level: 'N5',
        mode: 'Quiz'
      };
      
      expect(engine.startSession(jlptConfig)).toBe(true);
    });
  });

  describe('Question Bank Performance', () => {
    it('should create sessions quickly with large question banks', () => {
      const start = performance.now();
      
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      
      engine.startSession(config);
      
      const end = performance.now();
      const duration = end - start;
      
      // Should create session in under 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should handle multiple session creations efficiently', () => {
      const start = performance.now();
      
      const configs: SessionConfig[] = [
        { track: 'EN', framework: 'Classic', level: 'Beginner', mode: 'Quiz' },
        { track: 'EN', framework: 'CEFR', level: 'A1', mode: 'Study' },
        { track: 'JP', framework: 'Classic', level: 'Beginner', mode: 'Quiz' },
        { track: 'JP', framework: 'JLPT', level: 'N5', mode: 'Exam' }
      ];
      
      configs.forEach(config => {
        engine.startSession(config);
        engine.resetSession();
      });
      
      const end = performance.now();
      const duration = end - start;
      
      // Should handle multiple sessions in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Question Quality Validation', () => {
    it('should have valid question structures in sessions', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      
      engine.startSession(config);
      const questions = engine.getCurrentSessionData()?.questions || [];
      
      questions.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.prompt).toBeDefined();
        expect(['mcq', 'typing', 'open']).toContain(question.type);
        
        if (question.type === 'mcq') {
          const mcq = question as any;
          expect(mcq.choices).toBeDefined();
          expect(Array.isArray(mcq.choices)).toBe(true);
          expect(mcq.choices.length).toBeGreaterThanOrEqual(2);
          expect(mcq.answerIndex).toBeDefined();
          expect(mcq.answerIndex).toBeGreaterThanOrEqual(0);
          expect(mcq.answerIndex).toBeLessThan(mcq.choices.length);
        }
        
        if (question.type === 'typing') {
          const typing = question as any;
          expect(typing.accept).toBeDefined();
          expect(Array.isArray(typing.accept)).toBe(true);
          expect(typing.accept.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have meaningful content in questions', () => {
      const config: SessionConfig = {
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      };
      
      engine.startSession(config);
      const questions = engine.getCurrentSessionData()?.questions || [];
      
      questions.forEach(question => {
        expect(question.prompt.length).toBeGreaterThan(5);
        expect(question.prompt.trim()).toBe(question.prompt);
        
        if (question.explanation) {
          expect(question.explanation.length).toBeGreaterThan(5);
        }
      });
    });
  });
});