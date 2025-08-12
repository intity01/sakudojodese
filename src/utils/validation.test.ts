// Unit Tests for Validation Utilities
import { describe, it, expect } from 'vitest';
import { validateMCQ, validateTyping, validateOpen, validateQuestion } from './validation';
import type { MCQ, Typing, Open } from '../types/core';

describe('Validation Utilities', () => {
  describe('validateMCQ', () => {
    it('should validate correct MCQ', () => {
      const mcq: Partial<MCQ> = {
        prompt: 'What is 2 + 2?',
        choices: ['3', '4', '5'],
        answerIndex: 1
      };
      const result = validateMCQ(mcq);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject MCQ without prompt', () => {
      const mcq: Partial<MCQ> = {
        choices: ['3', '4', '5'],
        answerIndex: 1
      };
      const result = validateMCQ(mcq);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prompt is required and must not be empty');
    });

    it('should reject MCQ with insufficient choices', () => {
      const mcq: Partial<MCQ> = {
        prompt: 'What is 2 + 2?',
        choices: ['4'],
        answerIndex: 0
      };
      const result = validateMCQ(mcq);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 2 choices are required');
    });

    it('should reject MCQ with invalid answer index', () => {
      const mcq: Partial<MCQ> = {
        prompt: 'What is 2 + 2?',
        choices: ['3', '4', '5'],
        answerIndex: 5
      };
      const result = validateMCQ(mcq);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Answer index must be a valid choice index');
    });
  });

  describe('validateTyping', () => {
    it('should validate correct Typing question', () => {
      const typing: Partial<Typing> = {
        prompt: 'Type "hello"',
        accept: ['hello', 'Hello']
      };
      const result = validateTyping(typing);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject Typing without acceptable answers', () => {
      const typing: Partial<Typing> = {
        prompt: 'Type something'
      };
      const result = validateTyping(typing);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 1 acceptable answer is required');
    });
  });

  describe('validateOpen', () => {
    it('should validate correct Open question', () => {
      const open: Partial<Open> = {
        prompt: 'Explain the concept of democracy'
      };
      const result = validateOpen(open);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject Open without prompt', () => {
      const open: Partial<Open> = {};
      const result = validateOpen(open);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prompt is required and must not be empty');
    });
  });

  describe('validateQuestion', () => {
    it('should validate questions by type', () => {
      const mcq = {
        type: 'mcq' as const,
        prompt: 'Test?',
        choices: ['A', 'B'],
        answerIndex: 0
      };
      const result = validateQuestion(mcq);
      expect(result.isValid).toBe(true);
    });

    it('should reject questions without type', () => {
      const question = {
        prompt: 'Test?'
      };
      const result = validateQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question type is required');
    });
  });
});