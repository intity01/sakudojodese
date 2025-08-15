// Unit Tests for DojoEngine
// การทดสอบระบบจัดการเซสชันการเรียน

import { describe, it, expect, beforeEach } from 'vitest';
import { DojoEngine } from './DojoEngine';
import { SessionState } from '../types/core';
import type { QuestionBank, MCQ, Typing, Open } from '../types/core';

// ข้อมูลทดสอบ / Test data
const mockQuestionBank: QuestionBank = {
  EN: {
    Classic: {
      Beginner: [
        {
          id: 'mcq1',
          type: 'mcq',
          prompt: 'What is 2 + 2?',
          choices: ['3', '4', '5'],
          answerIndex: 1,
          explanation: '2 + 2 = 4'
        } as MCQ,
        {
          id: 'typing1',
          type: 'typing',
          prompt: 'Type "hello"',
          accept: ['hello', 'Hello'],
          explanation: 'Simple greeting'
        } as Typing,
        {
          id: 'open1',
          type: 'open',
          prompt: 'Describe your day',
          explanation: 'Open-ended question'
        } as Open
      ]
    },
    CEFR: {
      A1: []
    },
    JLPT: {
      N5: []
    }
  },
  JP: {
    Classic: {
      Beginner: []
    },
    CEFR: {
      A1: []
    },
    JLPT: {
      N5: []
    }
  }
};

describe('DojoEngine', () => {
  let engine: DojoEngine;

  beforeEach(() => {
    engine = new DojoEngine(mockQuestionBank);
  });

  describe('Session Management', () => {
    it('should start a new session successfully', () => {
      const success = engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      expect(success).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.ACTIVE);
    });

    it('should fail to start session with no questions', () => {
      const success = engine.startSession({
        track: 'EN',
        framework: 'CEFR',
        level: 'A1',
        mode: 'Quiz'
      });

      expect(success).toBe(false);
      expect(engine.getSessionState()).toBe(SessionState.IDLE);
    });

    it('should get current question', () => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      const question = engine.getCurrentQuestion();
      expect(question).not.toBeNull();
      expect(question?.id).toBeDefined();
    });

    it('should track session progress', () => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(1);
      expect(progress.total).toBe(3);
      expect(progress.correct).toBe(0);
    });
  });

  describe('Question Answering', () => {
    beforeEach(() => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Study',
        shuffleQuestions: false // ไม่สลับเพื่อให้ทดสอบได้แน่นอน
      });
    });

    it('should answer MCQ correctly', () => {
      // ข้อแรกควรเป็น MCQ
      const question = engine.getCurrentQuestion();
      expect(question?.type).toBe('mcq');

      const result = engine.answerMCQ(1); // คำตอบที่ถูก
      expect(result.isCorrect).toBe(true);
      expect(result.explanation).toBe('2 + 2 = 4');
      expect(result.correctAnswer).toBe('4');
    });

    it('should answer MCQ incorrectly', () => {
      const result = engine.answerMCQ(0); // คำตอบที่ผิด
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe('4');
    });

    it('should answer Typing question correctly', () => {
      // ไปข้อที่ 2 (Typing)
      engine.nextQuestion();
      const question = engine.getCurrentQuestion();
      expect(question?.type).toBe('typing');

      const result = engine.answerTyping('hello');
      expect(result.isCorrect).toBe(true);
      expect(result.explanation).toBe('Simple greeting');
    });

    it('should answer Typing question with case insensitive', () => {
      engine.nextQuestion();
      const result = engine.answerTyping('HELLO');
      expect(result.isCorrect).toBe(true);
    });

    it('should answer Open question', () => {
      // ไปข้อที่ 3 (Open)
      engine.nextQuestion();
      engine.nextQuestion();
      const question = engine.getCurrentQuestion();
      expect(question?.type).toBe('open');

      const result = engine.answerOpen('I had a great day!');
      expect(result.isCorrect).toBe(true); // Open questions are always correct
      expect(result.explanation).toBe('Open-ended question');
    });
  });

  describe('Session Navigation', () => {
    beforeEach(() => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Study',
        shuffleQuestions: false
      });
    });

    it('should move to next question', () => {
      const initialProgress = engine.getSessionProgress();
      const success = engine.nextQuestion();
      
      expect(success).toBe(true);
      const newProgress = engine.getSessionProgress();
      expect(newProgress.current).toBe(initialProgress.current + 1);
    });

    it('should move to previous question', () => {
      engine.nextQuestion(); // ไปข้อที่ 2
      const success = engine.previousQuestion(); // กลับข้อที่ 1
      
      expect(success).toBe(true);
      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(1);
    });

    it('should not go to previous from first question', () => {
      const success = engine.previousQuestion();
      expect(success).toBe(false);
      
      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(1);
    });

    it('should skip question', () => {
      const success = engine.skipQuestion();
      expect(success).toBe(true);
      
      const progress = engine.getSessionProgress();
      expect(progress.current).toBe(2);
      expect(progress.correct).toBe(0); // ข้ามแล้วไม่ได้คะแนน
    });

    it('should complete session at last question', () => {
      // ไปข้อสุดท้าย
      engine.nextQuestion();
      engine.nextQuestion();
      
      const success = engine.nextQuestion(); // พยายามไปข้อถัดไป
      expect(success).toBe(false);
      expect(engine.getSessionState()).toBe(SessionState.COMPLETED);
    });
  });

  describe('Session Control', () => {
    beforeEach(() => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });
    });

    it('should pause and resume session', () => {
      expect(engine.pauseSession()).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.PAUSED);
      
      expect(engine.resumeSession()).toBe(true);
      expect(engine.getSessionState()).toBe(SessionState.ACTIVE);
    });

    it('should reset session', () => {
      engine.resetSession();
      expect(engine.getSessionState()).toBe(SessionState.IDLE);
      expect(engine.getCurrentQuestion()).toBeNull();
    });

    it('should finish session and generate progress entry', () => {
      // ตอบคำถามทั้งหมด โดยตรวจสอบประเภทคำถามก่อน
      let correctCount = 0;
      
      // ข้อที่ 1
      const q1 = engine.getCurrentQuestion();
      if (q1?.type === 'mcq') {
        const result = engine.answerMCQ(1);
        if (result.isCorrect) correctCount++;
      } else if (q1?.type === 'typing') {
        const result = engine.answerTyping('hello');
        if (result.isCorrect) correctCount++;
      } else if (q1?.type === 'open') {
        const result = engine.answerOpen('My answer');
        if (result.isCorrect) correctCount++;
      }
      engine.nextQuestion();
      
      // ข้อที่ 2
      const q2 = engine.getCurrentQuestion();
      if (q2?.type === 'mcq') {
        const result = engine.answerMCQ(1);
        if (result.isCorrect) correctCount++;
      } else if (q2?.type === 'typing') {
        const result = engine.answerTyping('hello');
        if (result.isCorrect) correctCount++;
      } else if (q2?.type === 'open') {
        const result = engine.answerOpen('My answer');
        if (result.isCorrect) correctCount++;
      }
      engine.nextQuestion();
      
      // ข้อที่ 3
      const q3 = engine.getCurrentQuestion();
      if (q3?.type === 'mcq') {
        const result = engine.answerMCQ(1);
        if (result.isCorrect) correctCount++;
      } else if (q3?.type === 'typing') {
        const result = engine.answerTyping('hello');
        if (result.isCorrect) correctCount++;
      } else if (q3?.type === 'open') {
        const result = engine.answerOpen('My answer');
        if (result.isCorrect) correctCount++;
      }
      engine.nextQuestion(); // ไปข้อถัดไป ซึ่งจะทำให้เซสชันเสร็จสิ้น

      const progressEntry = engine.finishSession();
      
      expect(progressEntry).not.toBeNull();
      expect(progressEntry?.track).toBe('EN');
      expect(progressEntry?.framework).toBe('Classic');
      expect(progressEntry?.level).toBe('Beginner');
      expect(progressEntry?.mode).toBe('Quiz');
      expect(progressEntry?.total).toBe(3);
      expect(progressEntry?.correct).toBe(correctCount); // จำนวนข้อที่ตอบถูก
      expect(progressEntry?.scorePct).toBe(Math.round((correctCount / 3) * 100)); // คะแนนเปอร์เซ็นต์
      
      expect(engine.getSessionState()).toBe(SessionState.IDLE);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty question bank', () => {
      const emptyEngine = new DojoEngine({
        EN: { Classic: {}, CEFR: {}, JLPT: {} },
        JP: { Classic: {}, CEFR: {}, JLPT: {} }
      });

      const success = emptyEngine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      expect(success).toBe(false);
    });

    it('should handle operations without active session', () => {
      expect(engine.getCurrentQuestion()).toBeNull();
      expect(engine.nextQuestion()).toBe(false);
      expect(engine.previousQuestion()).toBe(false);
      expect(engine.skipQuestion()).toBe(false);
      expect(engine.finishSession()).toBeNull();
    });

    it('should handle invalid question types', () => {
      engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz'
      });

      // พยายามตอบ MCQ เมื่อคำถามไม่ใช่ MCQ
      const currentQuestion = engine.getCurrentQuestion();
      if (currentQuestion?.type !== 'mcq') {
        const result = engine.answerMCQ(0);
        expect(result.isCorrect).toBe(false);
      }
    });
  });
});