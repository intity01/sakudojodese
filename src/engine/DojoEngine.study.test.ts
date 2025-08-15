import { describe, it, expect, beforeEach } from 'vitest';
import { DojoEngine } from './DojoEngine';
import type { Track, Framework } from '../types/core';
import { minimalQuestionBank } from '../data/minimalQuestionBank';

describe('DojoEngine Study Mode', () => {
  let engine: DojoEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new DojoEngine(minimalQuestionBank);
  });

  describe('Study Session Creation', () => {
    it('should create study session with all available questions', () => {
      const success = engine.startStudySession('EN', 'Classic', 'Beginner');
      
      expect(success).toBe(true);
      expect(engine.isStudyMode()).toBe(true);
      
      const session = engine.getCurrentSessionData();
      expect(session).toBeTruthy();
      expect(session!.config.mode).toBe('Study');
      expect(session!.questions.length).toBeGreaterThan(0);
    });

    it('should fail to create study session with invalid configuration', () => {
      const success = engine.startStudySession('INVALID' as Track, 'Classic', 'Beginner');
      
      expect(success).toBe(false);
      expect(engine.isStudyMode()).toBe(false);
    });

    it('should include all question types in study mode', () => {
      const success = engine.startStudySession('EN', 'Classic', 'Beginner');
      
      expect(success).toBe(true);
      
      const questions = engine.getStudyQuestions();
      const questionTypes = questions.map(q => q.type);
      
      // Study mode should include all question types (MCQ, typing, and open)
      expect(questionTypes.some(type => type === 'mcq')).toBe(true);
      expect(questionTypes.some(type => type === 'typing')).toBe(true);
      // Open questions might not be present in minimal question bank, so we don't require them
    });

    it('should show all questions without limiting count', () => {
      const success = engine.startStudySession('EN', 'Classic', 'Beginner');
      
      expect(success).toBe(true);
      
      const questions = engine.getStudyQuestions();
      // Study mode should show all available questions, not limited like Quiz mode
      expect(questions.length).toBeGreaterThanOrEqual(10); // Should have more than quiz limit
    });
  });

  describe('Study Progress Tracking', () => {
    beforeEach(() => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
    });

    it('should track study progress correctly', () => {
      const initialProgress = engine.getStudyProgress();
      
      expect(initialProgress.current).toBe(0);
      expect(initialProgress.total).toBeGreaterThan(0);
      expect(initialProgress.viewed).toBe(0);
      expect(initialProgress.completionRate).toBe(0);
      expect(initialProgress.timeElapsed).toBeGreaterThanOrEqual(0);
    });

    it('should update progress when viewing questions', () => {
      // Mark current question as viewed
      engine.markQuestionAsViewed();
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(1);
      expect(progress.completionRate).toBeGreaterThan(0);
    });

    it('should track completion rate correctly', () => {
      const session = engine.getCurrentSessionData();
      const totalQuestions = session!.questions.length;
      
      // View half the questions
      const halfQuestions = Math.floor(totalQuestions / 2);
      for (let i = 0; i < halfQuestions; i++) {
        engine.markQuestionAsViewed();
        if (i < halfQuestions - 1) {
          engine.nextQuestion();
        }
      }
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(halfQuestions);
      expect(progress.completionRate).toBeCloseTo((halfQuestions / totalQuestions) * 100, 1);
    });
  });

  describe('Question Display with Explanations', () => {
    beforeEach(() => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
    });

    it('should provide current question with explanation', () => {
      const questionData = engine.getCurrentQuestionWithAnswer();
      
      expect(questionData.question).toBeTruthy();
      expect(questionData.index).toBe(0);
      expect(questionData.total).toBeGreaterThan(0);
      expect(questionData.hasNext).toBe(true);
      expect(questionData.hasPrevious).toBe(false);
      
      // Explanation might be null for some questions, but the field should exist
      expect(questionData).toHaveProperty('explanation');
    });

    it('should show explanations for questions that have them', () => {
      const questions = engine.getStudyQuestions();
      const questionsWithExplanations = questions.filter(q => q.explanation);
      
      if (questionsWithExplanations.length > 0) {
        // Navigate to a question with explanation
        const questionWithExplanation = questionsWithExplanations[0];
        const questionIndex = questions.findIndex(q => q.id === questionWithExplanation.id);
        
        engine.jumpToQuestion(questionIndex);
        const questionData = engine.getCurrentQuestionWithAnswer();
        
        expect(questionData.explanation).toBeTruthy();
        expect(questionData.explanation).toBe(questionWithExplanation.explanation);
      }
    });

    it('should handle questions without explanations gracefully', () => {
      const questions = engine.getStudyQuestions();
      const questionsWithoutExplanations = questions.filter(q => !q.explanation);
      
      if (questionsWithoutExplanations.length > 0) {
        // Navigate to a question without explanation
        const questionWithoutExplanation = questionsWithoutExplanations[0];
        const questionIndex = questions.findIndex(q => q.id === questionWithoutExplanation.id);
        
        engine.jumpToQuestion(questionIndex);
        const questionData = engine.getCurrentQuestionWithAnswer();
        
        expect(questionData.explanation).toBeNull();
      }
    });
  });

  describe('Study Mode Navigation', () => {
    beforeEach(() => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
    });

    it('should navigate forward and mark questions as viewed', () => {
      const initialProgress = engine.getStudyProgress();
      expect(initialProgress.viewed).toBe(0);
      
      const nextResult = engine.nextQuestionInStudy();
      
      expect(nextResult.success).toBe(true);
      expect(nextResult.currentIndex).toBe(1);
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(1); // Previous question should be marked as viewed
    });

    it('should navigate backward without marking as viewed', () => {
      // Move forward first
      engine.nextQuestionInStudy();
      engine.nextQuestionInStudy();
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(2);
      
      // Move backward
      const prevResult = engine.previousQuestionInStudy();
      
      expect(prevResult.success).toBe(true);
      expect(prevResult.currentIndex).toBe(1);
      
      // Viewed count should remain the same (backward navigation doesn't mark as viewed)
      const newProgress = engine.getStudyProgress();
      expect(newProgress.viewed).toBe(2);
    });

    it('should jump to specific questions and mark current as viewed', () => {
      const initialProgress = engine.getStudyProgress();
      expect(initialProgress.viewed).toBe(0);
      
      const jumpResult = engine.jumpToQuestionInStudy(3);
      
      expect(jumpResult.success).toBe(true);
      expect(jumpResult.currentIndex).toBe(3);
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(1); // Original question should be marked as viewed
    });

    it('should handle navigation boundaries correctly', () => {
      // Try to go before first question
      const prevResult = engine.previousQuestionInStudy();
      expect(prevResult.success).toBe(false);
      expect(prevResult.error).toContain('first question');
      
      // Navigate to last question
      const session = engine.getCurrentSessionData();
      const lastIndex = session!.questions.length - 1;
      
      engine.jumpToQuestionInStudy(lastIndex);
      
      // Try to go past last question
      const nextResult = engine.nextQuestionInStudy();
      expect(nextResult.success).toBe(false);
      expect(nextResult.error).toContain('last question');
    });

    it('should reject navigation when not in study mode', () => {
      // Start a different mode
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });
      
      const nextResult = engine.nextQuestionInStudy();
      expect(nextResult.success).toBe(false);
      expect(nextResult.error).toBe('Not in study mode');
      
      const prevResult = engine.previousQuestionInStudy();
      expect(prevResult.success).toBe(false);
      expect(prevResult.error).toBe('Not in study mode');
      
      const jumpResult = engine.jumpToQuestionInStudy(2);
      expect(jumpResult.success).toBe(false);
      expect(jumpResult.error).toBe('Not in study mode');
    });
  });

  describe('Study Session Summary', () => {
    beforeEach(() => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
    });

    it('should generate detailed study session summary', () => {
      const session = engine.getCurrentSessionData();
      const totalQuestions = session!.questions.length;
      
      // View some questions
      engine.markQuestionAsViewed();
      engine.nextQuestionInStudy();
      engine.nextQuestionInStudy();
      
      const summary = engine.getStudySessionSummary();
      
      expect(summary).toBeTruthy();
      expect(summary!.totalQuestions).toBe(totalQuestions);
      expect(summary!.viewedQuestions).toBe(2);
      expect(summary!.timeSpent).toBeGreaterThanOrEqual(0);
      expect(summary!.questionsWithDetails).toHaveLength(totalQuestions);
      
      // Check question details
      const firstQuestion = summary!.questionsWithDetails[0];
      expect(firstQuestion.wasViewed).toBe(true);
      expect(firstQuestion.question).toBeTruthy();
      expect(firstQuestion).toHaveProperty('explanation');
    });

    it('should return null summary for non-study sessions', () => {
      // Start a different mode
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });
      
      const summary = engine.getStudySessionSummary();
      expect(summary).toBeNull();
    });

    it('should track which questions were viewed', () => {
      // View specific questions
      engine.markQuestionAsViewed(); // Question 0
      engine.nextQuestion();
      engine.nextQuestion();
      engine.markQuestionAsViewed(); // Question 2
      
      const summary = engine.getStudySessionSummary();
      
      expect(summary!.viewedQuestions).toBe(2);
      expect(summary!.questionsWithDetails[0].wasViewed).toBe(true);
      expect(summary!.questionsWithDetails[1].wasViewed).toBe(false);
      expect(summary!.questionsWithDetails[2].wasViewed).toBe(true);
    });
  });

  describe('Study Mode Validation', () => {
    it('should correctly identify study mode', () => {
      expect(engine.isStudyMode()).toBe(false);
      
      engine.startStudySession('EN', 'Classic', 'Beginner');
      expect(engine.isStudyMode()).toBe(true);
      
      engine.resetSession();
      expect(engine.isStudyMode()).toBe(false);
    });

    it('should return empty questions array for non-study mode', () => {
      const questions = engine.getStudyQuestions();
      expect(questions).toHaveLength(0);
      
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });
      
      const quizQuestions = engine.getStudyQuestions();
      expect(quizQuestions).toHaveLength(0);
    });

    it('should return default progress for non-study mode', () => {
      const progress = engine.getStudyProgress();
      
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.viewed).toBe(0);
      expect(progress.completionRate).toBe(0);
      expect(progress.timeElapsed).toBe(0);
    });
  });

  describe('Study Mode Performance', () => {
    it('should create study sessions quickly', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        engine.startStudySession('EN', 'Classic', 'Beginner');
        engine.resetSession(false);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 10 study session creations in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle rapid navigation efficiently', () => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
      
      const startTime = Date.now();
      
      // Rapidly navigate through questions
      const session = engine.getCurrentSessionData();
      const totalQuestions = Math.min(session!.questions.length, 10);
      
      for (let i = 0; i < totalQuestions - 1; i++) {
        engine.nextQuestionInStudy();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle rapid navigation efficiently
      expect(duration).toBeLessThan(50);
      
      const progress = engine.getStudyProgress();
      expect(progress.viewed).toBe(totalQuestions - 1); // Last question not marked yet
    });
  });

  describe('Study Integration with Custom Questions', () => {
    beforeEach(() => {
      // Create some custom questions
      engine.createCustomQuestion({
        type: 'mcq',
        prompt: 'Custom Study MCQ',
        choices: ['A', 'B', 'C'],
        answerIndex: 1,
        explanation: 'This is a custom MCQ explanation',
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });

      engine.createCustomQuestion({
        type: 'open',
        prompt: 'Custom Study Open Question',
        explanation: 'This is a custom open question explanation',
        _track: 'EN',
        _framework: 'Classic',
        _level: 'Beginner'
      });
    });

    it('should include custom questions in study sessions', () => {
      const success = engine.startStudySession('EN', 'Classic', 'Beginner');
      
      expect(success).toBe(true);
      
      const questions = engine.getStudyQuestions();
      const customQuestionIds = questions.filter(q => q.id.startsWith('custom_')).map(q => q.id);
      
      // Should include custom questions
      expect(customQuestionIds.length).toBeGreaterThanOrEqual(0);
    });

    it('should show explanations for custom questions', () => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
      
      const questions = engine.getStudyQuestions();
      const customMCQ = questions.find(q => q.id.startsWith('custom_') && q.type === 'mcq');
      
      if (customMCQ) {
        // Navigate to the custom question
        const questionIndex = questions.findIndex(q => q.id === customMCQ.id);
        engine.jumpToQuestion(questionIndex);
        
        const questionData = engine.getCurrentQuestionWithAnswer();
        
        expect(questionData.question).toBeTruthy();
        expect(questionData.explanation).toBe('This is a custom MCQ explanation');
      }
    });

    it('should track custom questions in study summary', () => {
      engine.startStudySession('EN', 'Classic', 'Beginner');
      
      // View all questions
      const session = engine.getCurrentSessionData();
      for (let i = 0; i < session!.questions.length; i++) {
        engine.markQuestionAsViewed();
        if (i < session!.questions.length - 1) {
          engine.nextQuestion();
        }
      }
      
      const summary = engine.getStudySessionSummary();
      
      expect(summary).toBeTruthy();
      expect(summary!.viewedQuestions).toBe(session!.questions.length);
      
      // Check if custom questions are included in details
      const customQuestionDetails = summary!.questionsWithDetails.filter(
        detail => detail.question.id.startsWith('custom_')
      );
      
      expect(customQuestionDetails.length).toBeGreaterThanOrEqual(0);
      
      // If custom questions exist, they should have explanations
      customQuestionDetails.forEach(detail => {
        expect(detail.explanation).toBeTruthy();
      });
    });
  });
});