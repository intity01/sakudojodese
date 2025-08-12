// Validation Utilities for Saku Dojo v2
// Input validation and data integrity checks

import type { Question, MCQ, Typing, Open, CustomQuestion, ValidationResult } from '../types/core';
import { VALIDATION } from '../config/constants';

/**
 * Validate MCQ question
 * @param question MCQ question to validate
 * @returns Validation result
 */
export const validateMCQ = (question: Partial<MCQ>): ValidationResult => {
  const errors: string[] = [];

  if (!question.prompt || question.prompt.trim().length < VALIDATION.MIN_PROMPT_LENGTH) {
    errors.push('Prompt is required and must not be empty');
  }

  if (question.prompt && question.prompt.length > VALIDATION.MAX_PROMPT_LENGTH) {
    errors.push(`Prompt must be less than ${VALIDATION.MAX_PROMPT_LENGTH} characters`);
  }

  if (!question.choices || question.choices.length < VALIDATION.MIN_CHOICES) {
    errors.push(`At least ${VALIDATION.MIN_CHOICES} choices are required`);
  }

  if (question.choices && question.choices.length > VALIDATION.MAX_CHOICES) {
    errors.push(`Maximum ${VALIDATION.MAX_CHOICES} choices allowed`);
  }

  if (question.choices && question.choices.some(choice => !choice.trim())) {
    errors.push('All choices must be non-empty');
  }

  if (typeof question.answerIndex !== 'number' || 
      question.answerIndex < 0 || 
      (question.choices && question.answerIndex >= question.choices.length)) {
    errors.push('Answer index must be a valid choice index');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Typing question
 * @param question Typing question to validate
 * @returns Validation result
 */
export const validateTyping = (question: Partial<Typing>): ValidationResult => {
  const errors: string[] = [];

  if (!question.prompt || question.prompt.trim().length < VALIDATION.MIN_PROMPT_LENGTH) {
    errors.push('Prompt is required and must not be empty');
  }

  if (question.prompt && question.prompt.length > VALIDATION.MAX_PROMPT_LENGTH) {
    errors.push(`Prompt must be less than ${VALIDATION.MAX_PROMPT_LENGTH} characters`);
  }

  if (!question.accept || question.accept.length < VALIDATION.MIN_ACCEPT_ANSWERS) {
    errors.push(`At least ${VALIDATION.MIN_ACCEPT_ANSWERS} acceptable answer is required`);
  }

  if (question.accept && question.accept.length > VALIDATION.MAX_ACCEPT_ANSWERS) {
    errors.push(`Maximum ${VALIDATION.MAX_ACCEPT_ANSWERS} acceptable answers allowed`);
  }

  if (question.accept && question.accept.some(answer => !answer.trim())) {
    errors.push('All acceptable answers must be non-empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Open question
 * @param question Open question to validate
 * @returns Validation result
 */
export const validateOpen = (question: Partial<Open>): ValidationResult => {
  const errors: string[] = [];

  if (!question.prompt || question.prompt.trim().length < VALIDATION.MIN_PROMPT_LENGTH) {
    errors.push('Prompt is required and must not be empty');
  }

  if (question.prompt && question.prompt.length > VALIDATION.MAX_PROMPT_LENGTH) {
    errors.push(`Prompt must be less than ${VALIDATION.MAX_PROMPT_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate any question type
 * @param question Question to validate
 * @returns Validation result
 */
export const validateQuestion = (question: Partial<Question>): ValidationResult => {
  if (!question.type) {
    return {
      isValid: false,
      errors: ['Question type is required']
    };
  }

  switch (question.type) {
    case 'mcq':
      return validateMCQ(question as Partial<MCQ>);
    case 'typing':
      return validateTyping(question as Partial<Typing>);
    case 'open':
      return validateOpen(question as Partial<Open>);
    default:
      return {
        isValid: false,
        errors: ['Invalid question type']
      };
  }
};

/**
 * Validate custom question with metadata
 * @param question Custom question to validate
 * @returns Validation result
 */
export const validateCustomQuestion = (question: Partial<CustomQuestion>): ValidationResult => {
  const baseValidation = validateQuestion(question);
  
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];

  if (!question._track) {
    errors.push('Track is required');
  }

  if (!question._framework) {
    errors.push('Framework is required');
  }

  if (!question._level) {
    errors.push('Level is required');
  }

  if (!question._created) {
    errors.push('Creation date is required');
  }

  return {
    isValid: errors.length === 0,
    errors: [...baseValidation.errors, ...errors]
  };
};

/**
 * Sanitize question data
 * @param question Question to sanitize
 * @returns Sanitized question
 */
export const sanitizeQuestion = <T extends Partial<Question>>(question: T): T => {
  const sanitized = { ...question };

  if (sanitized.prompt) {
    sanitized.prompt = sanitized.prompt.trim();
  }

  if (sanitized.explanation) {
    sanitized.explanation = sanitized.explanation.trim();
  }

  if ('choices' in sanitized && sanitized.choices) {
    sanitized.choices = sanitized.choices.map(choice => choice.trim());
  }

  if ('accept' in sanitized && sanitized.accept) {
    sanitized.accept = sanitized.accept.map(answer => answer.trim());
  }

  if ('placeholder' in sanitized && sanitized.placeholder) {
    sanitized.placeholder = sanitized.placeholder.trim();
  }

  return sanitized;
};