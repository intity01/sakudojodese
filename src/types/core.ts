// Core Types for Saku Dojo v2
// ประเภทข้อมูลหลักสำหรับแอปเรียนภาษา Saku Dojo v2
// Language Learning Application - TypeScript Interfaces

// Track and Curriculum Types
// ประเภทภาษาและหลักสูตร
export type Track = "EN" | "JP"; // ภาษา: อังกฤษ | ญี่ปุ่น
export type Framework = "Classic" | "CEFR" | "JLPT"; // หลักสูตร: ทั่วไป | มาตรฐานยุโรป | มาตรฐานญี่ปุ่น
export type Mode = "Quiz" | "Study" | "Exam" | "Read" | "Write"; // โหมดการเรียน

// Question Types
// ประเภทคำถาม
export interface MCQ {
  id: string; // รหัสประจำคำถาม
  type: "mcq"; // ประเภท: คำถามแบบเลือกตอบ
  prompt: string; // โจทย์คำถาม
  choices: string[]; // ตัวเลือก (ก ข ค ง)
  answerIndex: number; // ตำแหน่งคำตอบที่ถูก (เริ่มจาก 0)
  explanation?: string; // คำอธิบาย (ไม่บังคับ)
  note?: string; // หมายเหตุ (ไม่บังคับ)
}

export interface Typing {
  id: string; // รหัสประจำคำถาม
  type: "typing"; // ประเภท: คำถามแบบพิมพ์คำตอบ
  prompt: string; // โจทย์คำถาม
  accept: string[]; // คำตอบที่ยอมรับได้ (หลายแบบ)
  placeholder?: string; // ข้อความแนะนำ (ไม่บังคับ)
  explanation?: string; // คำอธิบาย (ไม่บังคับ)
}

export interface Open {
  id: string; // รหัสประจำคำถาม
  type: "open"; // ประเภท: คำถามแบบตอบอิสระ
  prompt: string; // โจทย์คำถาม
  explanation?: string; // คำอธิบาย/ตัวอย่างคำตอบ (ไม่บังคับ)
  rubric?: string[]; // เกณฑ์การให้คะแนน (ไม่บังคับ)
}

export type Question = MCQ | Typing | Open; // คำถามทุกประเภทรวมกัน

// Custom Question with metadata for filtering
// คำถามที่ผู้ใช้สร้างเอง พร้อมข้อมูลสำหรับการกรอง
export interface CustomQuestion {
  id: string; // รหัสประจำคำถาม
  type: "mcq" | "typing" | "open"; // ประเภทคำถาม
  prompt: string; // โจทย์คำถาม
  choices?: string[]; // ตัวเลือก (สำหรับ MCQ)
  answerIndex?: number; // คำตอบที่ถูก (สำหรับ MCQ)
  accept?: string[]; // คำตอบที่ยอมรับ (สำหรับ Typing)
  placeholder?: string; // ข้อความแนะนำ
  explanation?: string; // คำอธิบาย
  note?: string; // หมายเหตุ
  rubric?: string[]; // เกณฑ์การให้คะแนน (สำหรับ Open)
  _track: Track; // ภาษา (EN/JP)
  _framework: Framework; // หลักสูตร
  _level: string; // ระดับ
  _created: string; // วันที่สร้าง
  _author?: string; // ผู้สร้าง (ไม่บังคับ)
}

// Progress Tracking
// การติดตามความก้าวหน้า
export interface ProgressEntry {
  date: string; // วันที่ทำแบบทดสอบ (ISO format)
  track: Track; // ภาษาที่เรียน
  framework: Framework; // หลักสูตรที่ใช้
  level: string; // ระดับที่ทำ
  scorePct: number; // คะแนนเปอร์เซ็นต์
  total: number; // จำนวนข้อทั้งหมด
  correct: number; // จำนวนข้อที่ถูก
  mode: Mode; // โหมดการเรียน
}

// User Progress Data Structure
// โครงสร้างข้อมูลความก้าวหน้าของผู้ใช้
export interface UserProgress {
  entries: ProgressEntry[]; // บันทึกผลการเรียนทั้งหมด
  customQuestions: CustomQuestion[]; // คำถามที่ผู้ใช้สร้างเอง
  preferences: { // การตั้งค่าของผู้ใช้
    defaultTrack: Track; // ภาษาเริ่มต้น
    defaultFramework: Framework; // หลักสูตรเริ่มต้น
    defaultLevel: string; // ระดับเริ่มต้น
    enableDictionary: boolean; // เปิดใช้พจนานุกรม
    enableCustomQuestions: boolean; // เปิดใช้คำถามที่สร้างเอง
  };
  statistics: { // สถิติการเรียน
    totalSessions: number; // จำนวนครั้งที่เรียนทั้งหมด
    totalQuestions: number; // จำนวนข้อที่ทำทั้งหมด
    averageScore: number; // คะแนนเฉลี่ย
    streakDays: number; // จำนวนวันที่เรียนติดต่อกัน
    lastActivity: string; // กิจกรรมล่าสุด (วันที่)
  };
}

// SakuLex Dictionary Types
// ประเภทข้อมูลพจนานุกรม SakuLex
export interface Lexeme {
  lang: "en" | "ja"; // ภาษา: อังกฤษ หรือ ญี่ปุ่น
  lemma: string; // คำหลัก (รูปพื้นฐาน)
  reading?: string; // การอ่าน (สำหรับภาษาญี่ปุ่น)
  kana?: string; // ฮิรางานะ/คาตากานะ
  kanji?: string; // ตัวอักษรคันจิ
  pos?: string[]; // ชนิดของคำ (noun, verb, etc.)
  senses: { gloss: string; source?: string }[]; // ความหมายต่างๆ
  examples?: { // ตัวอย่างประโยค
    text: string; // ประโยคตัวอย่าง
    translation?: string; // คำแปล
    source?: string; // แหล่งที่มา
    attribution?: string; // การระบุแหล่งที่มา
  }[];
  frequency?: { zipf?: number; source?: string }; // ความถี่การใช้
  forms?: string[]; // รูปแปรต่างๆ ของคำ
}

// Session Progress Interface
// ความก้าวหน้าในเซสชันปัจจุบัน
export interface SessionProgress {
  current: number; // ข้อปัจจุบัน
  total: number; // จำนวนข้อทั้งหมด
  correct: number; // จำนวนข้อที่ถูก
}

// Question Bank Structure Type
// โครงสร้างคลังคำถาม: ภาษา → หลักสูตร → ระดับ → คำถาม[]
export type QuestionBank = Record<Track, Record<Framework, Record<string, Question[]>>>;

// Type Guards for Question Types
// ตัวตรวจสอบประเภทคำถาม
export const isMCQ = (question: Question): question is MCQ => question.type === "mcq";
export const isTyping = (question: Question): question is Typing => question.type === "typing";
export const isOpen = (question: Question): question is Open => question.type === "open";

// Validation Types
// ประเภทข้อมูลสำหรับการตรวจสอบ
export interface ValidationResult {
  isValid: boolean; // ผลการตรวจสอบ: ถูกต้องหรือไม่
  errors: string[]; // รายการข้อผิดพลาด
}

// Answer Result Type
// ผลลัพธ์การตอบคำถาม
export interface AnswerResult {
  isCorrect: boolean; // ตอบถูกหรือไม่
  explanation?: string; // คำอธิบาย
  correctAnswer?: string | string[]; // คำตอบที่ถูก
}