// Core Types for Saku Dojo v2

export type Track = "EN" | "JP";
export type Framework = "Classic" | "CEFR" | "JLPT";
export type Mode = "Quiz" | "Study" | "Exam" | "Read" | "Write";

// Question Types
export interface MCQ {
  id: string;
  type: "mcq";
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
  note?: string;
}

export interface Typing {
  id: string;
  type: "typing";
  prompt: string;
  accept: string[];
  placeholder?: string;
  explanation?: string;
}

export interface Open {
  id: string;
  type: "open";
  prompt: string;
  explanation?: string;
  rubric?: string[];
}

export type Question = MCQ | Typing | Open;

// Progress Tracking
export interface ProgressEntry {
  date: string;
  track: Track;
  framework: Framework;
  level: string;
  scorePct: number;
  total: number;
  correct: number;
  mode: Mode;
}

// Custom Question with metadata
export interface CustomQuestion {
  id: string;
  type: "mcq" | "typing" | "open";
  prompt: string;
  choices?: string[];
  answerIndex?: number;
  accept?: string[];
  explanation?: string;
  rubric?: string[];
  _track: Track;
  _framework: Framework;
  _level: string;
  _created: string;
  _author?: string;
}

// Session Configuration
export interface SessionConfig {
  track: Track;
  framework: Framework;
  level: string;
  mode: Mode;
  questionCount?: number;
}

// Question Bank Structure
export type QuestionBank = {
  [K in Track]: {
    [F in Framework]?: {
      [level: string]: Question[];
    };
  };
};

// User Progress Data
export interface UserProgress {
  entries: ProgressEntry[];
  customQuestions: CustomQuestion[];
  preferences: {
    defaultTrack: Track;
    defaultFramework: Framework;
    defaultLevel: string;
    enableDictionary: boolean;
    enableCustomQuestions: boolean;
  };
  statistics: {
    totalSessions: number;
    totalQuestions: number;
    averageScore: number;
    streakDays: number;
    lastActivity: string;
  };
}

// SakuLex Dictionary Types
export interface Lexeme {
  lang: "en" | "ja";
  lemma: string;
  reading?: string;
  kana?: string;
  kanji?: string;
  pos?: string[];
  senses: { gloss: string; source?: string }[];
  examples?: {
    text: string;
    translation?: string;
    source?: string;
    attribution?: string;
  }[];
  frequency?: { zipf?: number; source?: string };
  forms?: string[];
}

// Utility Types
export interface SessionProgress {
  current: number;
  total: number;
  correct: number;
  score: number;
}

export interface SessionResult {
  progress: ProgressEntry;
  questions: Question[];
  answers: (number | string | null)[];
  correct: boolean[];
}

// Session State Management
export enum SessionState {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface SessionData {
  config: SessionConfig;
  questions: Question[];
  currentIndex: number;
  answers: (number | string | null)[];
  correct: boolean[];
  startTime: Date;
  pausedTime?: Date;
  totalPausedDuration: number;
  state: SessionState;
  sessionId: string;
}

// Answer Processing Types
export interface AnswerResult {
  isCorrect: boolean;
  isValid: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  explanation?: string;
  feedback: string;
  error?: string;
  score?: number;
  suggestions?: string[];
  wordCount?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

// Navigation and Control Types
export interface NavigationResult {
  success: boolean;
  error?: string;
  currentIndex: number;
  totalQuestions: number;
  isFirstQuestion?: boolean;
  isLastQuestion?: boolean;
  question?: Question | null;
  previousIndex?: number;
  wasSkipped?: boolean;
}

export interface SessionCompletionResult {
  success: boolean;
  error?: string;
  progressEntry?: ProgressEntry;
  sessionSummary?: SessionSummary;
  achievements?: Achievement[];
}

export interface SessionResetResult {
  success: boolean;
  error?: string;
  sessionId: string;
  wasCompleted: boolean;
  questionsAnswered: number;
  savedToHistory: boolean;
  restarted?: boolean;
  newSessionId?: string;
  clearedHistory?: number;
  hadActiveSession?: boolean;
}

export interface SessionSummary {
  sessionId: string;
  config: SessionConfig;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  scorePct: number;
  completionRate: number;
  sessionDuration: number;
  startTime: Date;
  endTime: Date;
  questions: QuestionResult[];
}

export interface QuestionResult {
  question: Question;
  answer: number | string | null;
  isCorrect: boolean;
  wasSkipped: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}