// Dojo Engine - ระบบจัดการเซสชันการเรียนหลักของ Saku Dojo v2
// Core session management system for Saku Dojo v2

import type {
  Track,
  Framework,
  Mode,
  Question,
  MCQ,
  Typing,
  Open,
  ProgressEntry,
  SessionProgress,
  AnswerResult,
  QuestionBank
} from '../types/core';
import { isMCQ, isTyping, isOpen } from '../types/core';
import { shuffle, calculateScore, getCurrentDate, normalize } from '../utils';
import { SESSION_CONFIG } from '../config/constants';

/**
 * สถานะของเซสชันการเรียน
 * Session state enumeration
 */
export enum SessionState {
  IDLE = 'idle',           // ไม่ได้ใช้งาน
  ACTIVE = 'active',       // กำลังทำงาน
  COMPLETED = 'completed', // เสร็จสิ้นแล้ว
  PAUSED = 'paused'        // หยุดชั่วคราว
}

/**
 * การตั้งค่าเซสชัน
 * Session configuration interface
 */
export interface SessionConfig {
  track: Track;           // ภาษาที่เรียน
  framework: Framework;   // หลักสูตร
  level: string;          // ระดับ
  mode: Mode;             // โหมดการเรียน
  questionCount?: number; // จำนวนข้อ (ไม่บังคับ)
  shuffleQuestions?: boolean; // สลับคำถามหรือไม่
}

/**
 * ข้อมูลเซสชันปัจจุบัน
 * Current session data
 */
export interface SessionData {
  config: SessionConfig;     // การตั้งค่า
  questions: Question[];     // คำถามทั้งหมด
  currentIndex: number;      // ข้อปัจจุบัน
  answers: (string | number | null)[]; // คำตอบที่ให้ไว้
  correctAnswers: boolean[]; // ผลการตอบ (ถูก/ผิด)
  startTime: number;         // เวลาเริ่มต้น
  endTime?: number;          // เวลาสิ้นสุด
  state: SessionState;       // สถานะเซสชัน
}

/**
 * คลาสหลักสำหรับจัดการเซสชันการเรียน
 * Main Dojo Engine class for managing learning sessions
 */
export class DojoEngine {
  private currentSession: SessionData | null = null;
  private questionBank: QuestionBank;

  constructor(questionBank: QuestionBank) {
    this.questionBank = questionBank;
  }

  /**
   * เริ่มเซสชันใหม่
   * Start a new learning session
   * @param config การตั้งค่าเซสชัน / Session configuration
   * @returns สำเร็จหรือไม่ / Success status
   */
  startSession(config: SessionConfig): boolean {
    try {
      // ดึงคำถามจากคลัง / Get questions from bank
      const questions = this.getQuestionsForSession(config);

      if (questions.length === 0) {
        console.warn(`ไม่พบคำถามสำหรับ ${config.track}/${config.framework}/${config.level}`);
        return false;
      }

      // สร้างเซสชันใหม่ / Create new session
      this.currentSession = {
        config,
        questions: config.shuffleQuestions !== false ? shuffle(questions) : questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        correctAnswers: new Array(questions.length).fill(false),
        startTime: Date.now(),
        state: SessionState.ACTIVE
      };

      console.log(`🎯 เริ่มเซสชัน ${config.mode}: ${questions.length} ข้อ`);
      return true;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเริ่มเซสชัน:', error);
      return false;
    }
  }

  /**
   * ดึงคำถามปัจจุบัน
   * Get current question
   * @returns คำถามปัจจุบัน หรือ null / Current question or null
   */
  getCurrentQuestion(): Question | null {
    if (!this.currentSession || this.currentSession.state !== SessionState.ACTIVE) {
      return null;
    }

    const { questions, currentIndex } = this.currentSession;
    return questions[currentIndex] || null;
  }

  /**
   * ดึงความก้าวหน้าของเซสชัน
   * Get session progress
   * @returns ข้อมูลความก้าวหน้า / Progress information
   */
  getSessionProgress(): SessionProgress {
    if (!this.currentSession) {
      return { current: 0, total: 0, correct: 0 };
    }

    const { currentIndex, questions, correctAnswers } = this.currentSession;
    const correct = correctAnswers.filter(Boolean).length;

    return {
      current: Math.min(currentIndex + 1, questions.length),
      total: questions.length,
      correct
    };
  }

  /**
   * ตอบคำถามแบบเลือกตอบ (MCQ)
   * Answer multiple choice question
   * @param choiceIndex ตำแหน่งตัวเลือกที่เลือก / Selected choice index
   * @returns ผลการตอบ / Answer result
   */
  answerMCQ(choiceIndex: number): AnswerResult {
    const question = this.getCurrentQuestion();

    if (!question || !isMCQ(question) || !this.currentSession) {
      return { isCorrect: false, explanation: 'ไม่พบคำถาม MCQ' };
    }

    const mcqQuestion = question as MCQ;
    const isCorrect = choiceIndex === mcqQuestion.answerIndex;

    // บันทึกคำตอบ / Record answer
    this.currentSession.answers[this.currentSession.currentIndex] = choiceIndex;
    this.currentSession.correctAnswers[this.currentSession.currentIndex] = isCorrect;

    const result: AnswerResult = {
      isCorrect
    };

    const correctChoice = mcqQuestion.choices[mcqQuestion.answerIndex];
    if (correctChoice) {
      result.correctAnswer = correctChoice;
    }

    if (mcqQuestion.explanation) {
      result.explanation = mcqQuestion.explanation;
    }

    return result;
  }

  /**
   * ตอบคำถามแบบพิมพ์ (Typing)
   * Answer typing question
   * @param input คำตอบที่พิมพ์ / Typed answer
   * @returns ผลการตอบ / Answer result
   */
  answerTyping(input: string): AnswerResult {
    const question = this.getCurrentQuestion();

    if (!question || !isTyping(question) || !this.currentSession) {
      return { isCorrect: false, explanation: 'ไม่พบคำถาม Typing' };
    }

    const typingQuestion = question as Typing;
    const normalizedInput = normalize(input);
    const acceptableAnswers = typingQuestion.accept.map(normalize);
    const isCorrect = acceptableAnswers.includes(normalizedInput);

    // บันทึกคำตอบ / Record answer
    this.currentSession.answers[this.currentSession.currentIndex] = input;
    this.currentSession.correctAnswers[this.currentSession.currentIndex] = isCorrect;

    const result: AnswerResult = {
      isCorrect
    };

    if (typingQuestion.accept.length > 0) {
      result.correctAnswer = typingQuestion.accept;
    }

    if (typingQuestion.explanation) {
      result.explanation = typingQuestion.explanation;
    }

    return result;
  }

  /**
   * ตอบคำถามแบบเปิด (Open)
   * Answer open-ended question
   * @param input คำตอบ / Answer input
   * @returns ผลการตอบ / Answer result
   */
  answerOpen(input: string): AnswerResult {
    const question = this.getCurrentQuestion();

    if (!question || !isOpen(question) || !this.currentSession) {
      return { isCorrect: false, explanation: 'ไม่พบคำถาม Open' };
    }

    const openQuestion = question as Open;

    // คำถามแบบเปิดไม่มีการให้คะแนนอัตโนมัติ
    // Open questions don't have automatic scoring
    this.currentSession.answers[this.currentSession.currentIndex] = input;
    this.currentSession.correctAnswers[this.currentSession.currentIndex] = true; // ถือว่าถูกเสมอ

    const result: AnswerResult = {
      isCorrect: true // ถือว่าถูกเสมอสำหรับคำถามแบบเปิด
    };

    if (openQuestion.explanation) {
      result.explanation = openQuestion.explanation;
    }

    return result;
  }

  /**
   * ไปข้อถัดไป
   * Move to next question
   * @returns สำเร็จหรือไม่ / Success status
   */
  nextQuestion(): boolean {
    if (!this.currentSession || this.currentSession.state !== SessionState.ACTIVE) {
      return false;
    }

    const { questions, currentIndex } = this.currentSession;

    if (currentIndex < questions.length - 1) {
      this.currentSession.currentIndex++;
      return true;
    } else {
      // เซสชันเสร็จสิ้น / Session completed
      this.currentSession.state = SessionState.COMPLETED;
      this.currentSession.endTime = Date.now();
      return false;
    }
  }

  /**
   * กลับไปข้อก่อนหน้า
   * Move to previous question
   * @returns สำเร็จหรือไม่ / Success status
   */
  previousQuestion(): boolean {
    if (!this.currentSession || this.currentSession.state !== SessionState.ACTIVE) {
      return false;
    }

    if (this.currentSession.currentIndex > 0) {
      this.currentSession.currentIndex--;
      return true;
    }

    return false;
  }

  /**
   * ข้ามข้อปัจจุบัน
   * Skip current question
   * @returns สำเร็จหรือไม่ / Success status
   */
  skipQuestion(): boolean {
    if (!this.currentSession) {
      return false;
    }

    // ทำเครื่องหมายว่าข้าม / Mark as skipped
    this.currentSession.answers[this.currentSession.currentIndex] = null;
    this.currentSession.correctAnswers[this.currentSession.currentIndex] = false;

    return this.nextQuestion();
  }

  /**
   * จบเซสชันและสร้างรายงานผล
   * Finish session and generate progress entry
   * @returns รายงานผลการเรียน / Progress entry
   */
  finishSession(): ProgressEntry | null {
    if (!this.currentSession) {
      return null;
    }

    const { config, correctAnswers } = this.currentSession;
    const total = correctAnswers.length;
    const correct = correctAnswers.filter(Boolean).length;
    const scorePct = calculateScore(correct, total);

    // อัปเดตสถานะ / Update state
    this.currentSession.state = SessionState.COMPLETED;
    this.currentSession.endTime = Date.now();

    const progressEntry: ProgressEntry = {
      date: getCurrentDate(),
      track: config.track,
      framework: config.framework,
      level: config.level,
      mode: config.mode,
      scorePct,
      total,
      correct
    };

    console.log(`✅ เซสชันเสร็จสิ้น: ${correct}/${total} (${scorePct}%)`);

    // ล้างเซสชัน / Clear session
    this.currentSession = null;

    return progressEntry;
  }

  /**
   * บังคับจบเซสชันทันที (ไม่ว่าจะอยู่ข้อไหน)
   * Force finish session immediately
   * @returns รายงานผลการเรียน / Progress entry
   */
  forceFinishSession(): ProgressEntry | null {
    if (!this.currentSession) {
      return null;
    }

    // เปลี่ยนสถานะเป็น COMPLETED ก่อน
    this.currentSession.state = SessionState.COMPLETED;
    return this.finishSession();
  }

  /**
   * รีเซ็ตเซสชัน
   * Reset current session
   */
  resetSession(): void {
    if (this.currentSession) {
      console.log('🔄 รีเซ็ตเซสชัน');
      this.currentSession = null;
    }
  }

  /**
   * หยุดเซสชันชั่วคราว
   * Pause current session
   */
  pauseSession(): boolean {
    if (this.currentSession && this.currentSession.state === SessionState.ACTIVE) {
      this.currentSession.state = SessionState.PAUSED;
      console.log('⏸️ หยุดเซสชันชั่วคราว');
      return true;
    }
    return false;
  }

  /**
   * เริ่มเซสชันต่อ
   * Resume paused session
   */
  resumeSession(): boolean {
    if (this.currentSession && this.currentSession.state === SessionState.PAUSED) {
      this.currentSession.state = SessionState.ACTIVE;
      console.log('▶️ เริ่มเซสชันต่อ');
      return true;
    }
    return false;
  }

  /**
   * ตรวจสอบสถานะเซสชัน
   * Check session state
   * @returns สถานะปัจจุบัน / Current state
   */
  getSessionState(): SessionState {
    return this.currentSession?.state || SessionState.IDLE;
  }

  /**
   * ดึงคำถามสำหรับเซสชัน
   * Get questions for session based on configuration
   * @param config การตั้งค่าเซสชัน / Session configuration
   * @returns อาร์เรย์คำถาม / Array of questions
   */
  private getQuestionsForSession(config: SessionConfig): Question[] {
    const { track, framework, level, mode, questionCount } = config;

    // ตรวจสอบว่ามีคำถามในคลังหรือไม่
    // Check if questions exist in bank
    const trackBank = this.questionBank[track];
    if (!trackBank) return [];

    const frameworkBank = trackBank[framework];
    if (!frameworkBank) return [];

    const levelQuestions = frameworkBank[level];
    if (!levelQuestions || levelQuestions.length === 0) return [];

    let questions = [...levelQuestions];

    // ปรับจำนวนคำถามตามโหมด
    // Adjust question count based on mode
    switch (mode) {
      case 'Quiz':
        const minQuestions = SESSION_CONFIG.QUIZ_MIN_QUESTIONS;
        const maxQuestions = SESSION_CONFIG.QUIZ_MAX_QUESTIONS;
        const targetCount = questionCount || Math.min(maxQuestions, questions.length);
        questions = questions.slice(0, Math.max(minQuestions, targetCount));
        break;

      case 'Exam':
        const examCount = questionCount || SESSION_CONFIG.EXAM_QUESTIONS;
        // สำหรับ Exam อาจจะรวมคำถามจากหลายระดับ
        // For Exam, might include questions from multiple levels
        questions = questions.slice(0, examCount);
        break;

      case 'Study':
        // Study mode แสดงคำถามทั้งหมด
        // Study mode shows all questions
        break;

      case 'Read':
      case 'Write':
        // โหมดเหล่านี้อาจจะมีคำถามพิเศษ
        // These modes might have special questions
        break;
    }

    return questions;
  }
}