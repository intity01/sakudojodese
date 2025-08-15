import { describe, it, expect, beforeEach } from 'vitest';
import { DojoEngine } from './DojoEngine';
import type { CustomQuestion, Track, Framework } from '../types/core';
import { minimalQuestionBank } from '../data/minimalQuestionBank';

describe('DojoEngine Custom Questions', () => {
  let engine: DojoEngine;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    engine = new DojoEngine(minimalQuestionBank);
  });

  describe('Custom Question Creation', () => {
    it('should create a valid MCQ custom question', () => {
      const questionData = {
        type: 'mcq' as const,
        prompt: 'What is the capital of France?',
        choices: ['London', 'Berlin', 'Paris', 'Madrid'],
        answerIndex: 2,
        explanation: 'Paris is the capital and largest city of France.',
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner',
        _author: 'Test Author'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestions).toContain('Custom question created successfully');
    });

    it('should create a valid typing custom question', () => {
      const questionData = {
        type: 'typing' as const,
        prompt: 'Type the word for "hello" in French',
        accept: ['bonjour', 'salut'],
        explanation: 'Bonjour is the most common greeting in French.',
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should create a valid open custom question', () => {
      const questionData = {
        type: 'open' as const,
        prompt: 'Describe your favorite hobby in 50 words',
        explanation: 'This exercise helps practice descriptive writing.',
        rubric: ['Clear description', 'Proper grammar', 'Word count'],
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Intermediate'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject question with missing prompt', () => {
      const questionData = {
        type: 'mcq' as const,
        prompt: '',
        choices: ['A', 'B', 'C'],
        answerIndex: 0,
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question prompt is required');
    });

    it('should reject MCQ with insufficient choices', () => {
      const questionData = {
        type: 'mcq' as const,
        prompt: 'Test question?',
        choices: ['Only one choice'],
        answerIndex: 0,
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('MCQ questions must have at least 2 choices');
    });

    it('should reject MCQ with invalid answer index', () => {
      const questionData = {
        type: 'mcq' as const,
        prompt: 'Test question?',
        choices: ['A', 'B', 'C'],
        answerIndex: 5,
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('MCQ questions must have a valid answer index');
    });

    it('should reject typing question without accepted answers', () => {
      const questionData = {
        type: 'typing' as const,
        prompt: 'Type something',
        accept: [],
        _track: 'EN' as Track,
        _framework: 'Classic' as Framework,
        _level: 'Beginner'
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Typing questions must have at least one accepted answer');
    });

    it('should reject question without required metadata', () => {
      const questionData = {
        type: 'mcq' as const,
        prompt: 'Test question?',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: '' as any,
        _framework: '' as any,
        _level: ''
      };

      const result = engine.createCustomQuestion(questionData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Track is required');
      expect(result.errors).toContain('Framework is required');
      expect(result.errors).toContain('Level is required');
    });
  });

  describe('Custom Question Retrieval', () => {
    beforeEach(() => {
      // Clear any existing custom questions
      engine.clearAllCustomQuestions();
      
      // Create some test questions
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'English Classic Beginner Question',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });

      engine.createCustomQuestion({
        type: 'typing',
        prompt: 'English CEFR A1 Question',
        accept: ['answer'],
        _track: 'EN',
        _framework: 'CEFR',
        _level: 'A1'
      });

      engine.createCustomQuestion({
        type: 'open',
        prompt: 'Japanese JLPT N5 Question',
        _track: 'JP',
        _framework: 'JLPT',
        _level: 'N5'
      });
    });

    it('should get all custom questions', () => {
      const questions = engine.getCustomQuestions();
      expect(questions).toHaveLength(3);
    });

    it('should filter by track', () => {
      const enQuestions = engine.getCustomQuestions('EN');
      expect(enQuestions).toHaveLength(2);
      expect(enQuestions.every(q => q._track === 'EN')).toBe(true);

      const jpQuestions = engine.getCustomQuestions('JP');
      expect(jpQuestions).toHaveLength(1);
      expect(jpQuestions[0]._track).toBe('JP');
    });

    it('should filter by track and framework', () => {
      const classicQuestions = engine.getCustomQuestions('EN', 'Classic');
      expect(classicQuestions).toHaveLength(1);
      expect(classicQuestions[0]._framework).toBe('Classic');

      const cefrQuestions = engine.getCustomQuestions('EN', 'CEFR');
      expect(cefrQuestions).toHaveLength(1);
      expect(cefrQuestions[0]._framework).toBe('CEFR');
    });

    it('should filter by track, framework, and level', () => {
      const specificQuestions = engine.getCustomQuestions('EN', 'Classic', 'Beginner');
      expect(specificQuestions).toHaveLength(1);
      expect(specificQuestions[0]._level).toBe('Beginner');
    });

    it('should return empty array for non-matching filters', () => {
      const noMatch = engine.getCustomQuestions('EN', 'Classic', 'Advanced');
      expect(noMatch).toHaveLength(0);
    });
  });

  describe('Custom Question Updates', () => {
    let questionId: string;

    beforeEach(() => {
      // Clear any existing custom questions
      engine.clearAllCustomQuestions();
      
      const result = engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Original question',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });
      
      const questions = engine.getCustomQuestions();
      questionId = questions[0].id;
    });

    it('should update existing custom question', () => {
      const result = engine.updateCustomQuestion(questionId, {
        prompt: 'Updated question',
        explanation: 'New explanation'
      });

      expect(result.isValid).toBe(true);
      expect(result.suggestions).toContain('Custom question updated successfully');

      const questions = engine.getCustomQuestions();
      const updated = questions.find(q => q.id === questionId);
      expect(updated?.prompt).toBe('Updated question');
      expect(updated?.explanation).toBe('New explanation');
    });

    it('should reject update for non-existent question', () => {
      const result = engine.updateCustomQuestion('non-existent-id', {
        prompt: 'Updated question'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom question not found');
    });

    it('should validate updated question data', () => {
      const result = engine.updateCustomQuestion(questionId, {
        prompt: '', // Invalid empty prompt
        choices: ['Only one'] // Invalid for MCQ
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question prompt is required');
      expect(result.errors).toContain('MCQ questions must have at least 2 choices');
    });
  });

  describe('Custom Question Deletion', () => {
    let questionId: string;

    beforeEach(() => {
      // Clear any existing custom questions
      engine.clearAllCustomQuestions();
      
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Question to delete',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });
      
      const questions = engine.getCustomQuestions();
      questionId = questions[0].id;
    });

    it('should delete existing custom question', () => {
      const initialCount = engine.getCustomQuestions().length;
      const result = engine.deleteCustomQuestion(questionId);

      expect(result).toBe(true);
      expect(engine.getCustomQuestions()).toHaveLength(initialCount - 1);
    });

    it('should return false for non-existent question', () => {
      const result = engine.deleteCustomQuestion('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Session Integration', () => {
    beforeEach(() => {
      // Clear any existing custom questions
      engine.clearAllCustomQuestions();
      
      // Create custom questions for testing
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Custom MCQ Question',
        choices: ['A', 'B', 'C'],
        answerIndex: 1,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });

      engine.createCustomQuestion({
        type: 'typing',
        prompt: 'Custom Typing Question',
        accept: ['answer', 'response'],
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });
    });

    it('should include custom questions in session', () => {
      const success = engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      expect(success).toBe(true);
      
      const session = engine.getCurrentSessionData();
      expect(session).toBeTruthy();
      
      // Should include both standard and custom questions
      const customQuestionIds = engine.getCustomQuestions('EN', 'Classic', 'Beginner').map(q => q.id);
      const sessionQuestionIds = session!.questions.map(q => q.id);
      
      // At least some custom questions should be included
      const hasCustomQuestions = customQuestionIds.some(id => sessionQuestionIds.includes(id));
      expect(hasCustomQuestions).toBe(true);
    });

    it('should process answers for custom questions', () => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      const session = engine.getCurrentSessionData();
      const customQuestion = session!.questions.find(q => q.id.startsWith('custom_'));
      
      if (customQuestion && customQuestion.type === 'mcq') {
        const result = engine.answerMCQ(1);
        expect(result.isValid).toBe(true);
        expect(result.isCorrect).toBe(true);
      } else {
        // If no custom MCQ found, just verify the session works
        expect(session!.questions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Persistence', () => {
    it('should persist custom questions to localStorage', () => {
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Persistent question',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });

      // Create new engine instance to test loading
      const newEngine = new DojoEngine(minimalQuestionBank);
      const questions = newEngine.getCustomQuestions();
      
      expect(questions).toHaveLength(1);
      expect(questions[0].prompt).toBe('Persistent question');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Corrupt the localStorage data
      localStorage.setItem('dojo-custom-questions', 'invalid-json');
      
      // Should not crash and should start with empty array
      const newEngine = new DojoEngine(minimalQuestionBank);
      const questions = newEngine.getCustomQuestions();
      
      expect(questions).toHaveLength(0);
    });
  });

  describe('Data Export/Import', () => {
    beforeEach(() => {
      // Clear any existing custom questions
      engine.clearAllCustomQuestions();
      
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Export test question',
        choices: ['A', 'B'],
        answerIndex: 0,
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });
    });

    it('should export user data including custom questions', () => {
      const userData = engine.exportUserData();
      
      expect(userData.customQuestions).toHaveLength(1);
      expect(userData.customQuestions[0].prompt).toBe('Export test question');
      expect(userData.preferences).toBeDefined();
      expect(userData.statistics).toBeDefined();
    });

    it('should import user data successfully', () => {
      const userData = engine.exportUserData();
      
      // Clear current data
      localStorage.clear();
      const newEngine = new DojoEngine(minimalQuestionBank);
      
      // Import data
      const result = newEngine.importUserData(userData);
      
      expect(result.isValid).toBe(true);
      expect(result.suggestions).toContain('Imported 1 new custom questions');
      
      const questions = newEngine.getCustomQuestions();
      expect(questions).toHaveLength(1);
    });

    it('should handle invalid import data', () => {
      const invalidData = {
        customQuestions: 'not-an-array',
        entries: 'not-an-array'
      } as any;
      
      const result = engine.importUserData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid custom questions data');
      expect(result.errors).toContain('Invalid progress entries data');
    });

    it('should merge imported questions without duplicates', () => {
      const userData = engine.exportUserData();
      
      // Import the same data again
      const result = engine.importUserData(userData);
      
      expect(result.isValid).toBe(true);
      expect(result.suggestions).toContain('Imported 0 new custom questions');
      
      // Should still have only 1 question (no duplicates)
      const questions = engine.getCustomQuestions();
      expect(questions).toHaveLength(1);
    });
  });
});