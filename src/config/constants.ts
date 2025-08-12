// Application Constants for Saku Dojo v2
// ค่าคงที่ของแอปพลิเคชัน Saku Dojo v2
// Storage keys, limits, and configuration values
// คีย์สำหรับเก็บข้อมูล, ขีดจำกัด, และค่าการตั้งค่า

// Storage Keys
// คีย์สำหรับเก็บข้อมูลใน localStorage
export const STORAGE_KEYS = {
  PROGRESS: "saku-bilingual-dojo-progress-v2", // ความก้าวหน้าการเรียน
  CUSTOM_QUESTIONS: "saku-user-questions", // คำถามที่ผู้ใช้สร้างเอง
  PREFERENCES: "saku-preferences", // การตั้งค่าของผู้ใช้
  DAILY_CHALLENGE: "saku-daily-challenge", // ความท้าทายรายวัน
} as const;

// Session Configuration
// การตั้งค่าเซสชันการเรียน
export const SESSION_CONFIG = {
  QUIZ_MIN_QUESTIONS: 6, // จำนวนข้อต่ำสุดในโหมด Quiz
  QUIZ_MAX_QUESTIONS: 14, // จำนวนข้อสูงสุดในโหมด Quiz
  EXAM_QUESTIONS: 20, // จำนวนข้อในโหมด Exam
  DAILY_CHALLENGE_QUESTIONS: 10, // จำนวนข้อในความท้าทายรายวัน
  STUDY_MODE_SHOW_ALL: true, // แสดงคำถามทั้งหมดในโหมด Study
} as const;

// Performance Limits
// ขีดจำกัดประสิทธิภาพ
export const PERFORMANCE_LIMITS = {
  MAX_BUNDLE_SIZE_KB: 200, // ขนาดไฟล์สูงสุด (KB)
  FIRST_INTERACTION_MS: 1000, // เวลาโหลดครั้งแรก (มิลลิวินาที)
  MODE_SWITCH_MS: 300, // เวลาเปลี่ยนโหมด (มิลลิวินาที)
  DICTIONARY_LOOKUP_MS: 150, // เวลาค้นหาพจนานุกรม (มิลลิวินาที)
} as const;

// UI Configuration
// การตั้งค่าส่วนติดต่อผู้ใช้
export const UI_CONFIG = {
  CORRECT_ANSWER_DELAY_MS: 420, // หน่วงเวลาเมื่อตอบถูก (มิลลิวินาที)
  INCORRECT_ANSWER_DELAY_MS: 560, // หน่วงเวลาเมื่อตอบผิด (มิลลิวินาที)
  TYPING_ANSWER_DELAY_MS: 700, // หน่วงเวลาสำหรับคำถามพิมพ์ (มิลลิวินาที)
  PROGRESS_CHART_MAX_POINTS: 20, // จำนวนจุดสูงสุดในกราฟความก้าวหน้า
} as const;

// Validation Rules
// กฎการตรวจสอบข้อมูล
export const VALIDATION = {
  MIN_PROMPT_LENGTH: 1, // ความยาวต่ำสุดของโจทย์
  MAX_PROMPT_LENGTH: 500, // ความยาวสูงสุดของโจทย์
  MIN_CHOICES: 2, // จำนวนตัวเลือกต่ำสุด
  MAX_CHOICES: 6, // จำนวนตัวเลือกสูงสุด
  MIN_ACCEPT_ANSWERS: 1, // จำนวนคำตอบที่ยอมรับต่ำสุด
  MAX_ACCEPT_ANSWERS: 10, // จำนวนคำตอบที่ยอมรับสูงสุด
} as const;

// Default Values
// ค่าเริ่มต้น
export const DEFAULTS = {
  TRACK: "EN" as const, // ภาษาเริ่มต้น: อังกฤษ
  FRAMEWORK: "Classic" as const, // หลักสูตรเริ่มต้น: ทั่วไป
  MODE: "Quiz" as const, // โหมดเริ่มต้น: แบบทดสอบ
  ENABLE_DICTIONARY: false, // ปิดพจนานุกรมเริ่มต้น
  ENABLE_CUSTOM_QUESTIONS: true, // เปิดคำถามที่สร้างเองเริ่มต้น
} as const;

// Error Messages
// ข้อความแสดงข้อผิดพลาด
export const ERROR_MESSAGES = {
  STORAGE_UNAVAILABLE: "Local storage is not available. Progress will not be saved.", // ไม่สามารถเก็บข้อมูลได้
  INVALID_QUESTION_DATA: "Invalid question data provided.", // ข้อมูลคำถามไม่ถูกต้อง
  SESSION_NOT_FOUND: "No active session found.", // ไม่พบเซสชันที่ใช้งานอยู่
  DICTIONARY_UNAVAILABLE: "Dictionary service is currently unavailable.", // บริการพจนานุกรมไม่พร้อมใช้งาน
  NETWORK_ERROR: "Network error occurred. Please check your connection.", // เกิดข้อผิดพลาดเครือข่าย
} as const;

// Feature Flags
// สวิตช์เปิด-ปิดฟีเจอร์
export const FEATURE_FLAGS = {
  ENABLE_DICTIONARY: false, // เปิดใช้พจนานุกรม
  ENABLE_ANALYTICS: false, // เปิดใช้การวิเคราะห์
  ENABLE_SERVICE_WORKER: false, // เปิดใช้ service worker
  ENABLE_EXPERIMENTAL_MODES: false, // เปิดใช้โหมดทดลอง
} as const;