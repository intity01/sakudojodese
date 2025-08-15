// Question Bank Data Model & Schema
// Based on Kiro Light specification for open source integration

export type Language = 'EN' | 'JP' | 'TH';
export type QuestionType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'pronunciation' | 'conversation';
export type LicenseType = 'CC-BY' | 'CC-BY-SA' | 'EDRDG' | 'Public-Domain' | 'Other';

// Level Classification System
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type HeuristicLevel = '1' | '2' | '3' | '4' | '5';

export interface LevelClassification {
  system: 'CEFR' | 'JLPT' | 'heuristic';
  level: CEFRLevel | JLPTLevel | HeuristicLevel;
  confidence?: number; // 0-1, for heuristic classifications
}

// Source Attribution System
export interface Source {
  id: string;
  name: string;
  url?: string;
  license: LicenseType;
  attribution: string;
  version?: string;
  lastUpdated?: string;
  description?: string;
}

// Media Attachments with License
export interface MediaItem {
  id: string;
  type: 'audio' | 'image' | 'video';
  url: string;
  mimeType: string;
  size?: number;
  duration?: number; // for audio/video in seconds
  license: LicenseType;
  attribution: string;
  alt?: string; // for accessibility
}

// Difficulty Scoring System
export interface DifficultyMetrics {
  wordFrequency?: number; // 1-10000+ (NGSL/NAWL band)
  sentenceLength?: number; // character count
  grammarComplexity?: number; // 1-10 scale
  kanjiCount?: number; // for Japanese
  vocabularyLevel?: number; // 1-10 scale
  overallScore: number; // computed final score 1-100
}

// Core Question Bank Item
export interface QuestionBankItem {
  // Identity
  id: string;
  version: string;
  
  // Content
  language: Language;
  type: QuestionType;
  prompt: string;
  choices?: string[]; // for MCQ
  answer: string | number | string[]; // flexible answer format
  explanation?: string;
  
  // Classification
  level: LevelClassification;
  difficulty: DifficultyMetrics;
  tags: string[];
  
  // Attribution
  source: Source;
  media?: MediaItem[];
  
  // Metadata
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  reviewedAt?: string; // quality review date
  reviewedBy?: string; // reviewer ID
  
  // Usage Statistics (optional)
  usageCount?: number;
  successRate?: number; // 0-1
  averageTime?: number; // seconds
}

// Question Bank Collection
export interface QuestionBank {
  metadata: {
    id: string;
    name: string;
    description: string;
    version: string;
    language: Language;
    totalItems: number;
    createdAt: string;
    updatedAt: string;
    license: LicenseType;
    attribution: string;
  };
  sources: Source[];
  items: QuestionBankItem[];
}

// Deck/Collection Organization
export interface Deck {
  id: string;
  name: string;
  description: string;
  language: Language;
  type: QuestionType;
  level: LevelClassification;
  tags: string[];
  itemIds: string[]; // references to QuestionBankItem IDs
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // minutes
  source: Source;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Interface
export interface QuestionBankFilter {
  language?: Language[];
  type?: QuestionType[];
  level?: {
    system: 'CEFR' | 'JLPT' | 'heuristic';
    levels: string[];
  };
  tags?: string[];
  source?: string[];
  license?: LicenseType[];
  difficulty?: {
    min: number;
    max: number;
  };
  textSearch?: string;
}

export interface QuestionBankSearchResult {
  items: QuestionBankItem[];
  total: number;
  facets: {
    languages: { [key in Language]?: number };
    types: { [key in QuestionType]?: number };
    levels: { [key: string]: number };
    tags: { [key: string]: number };
    sources: { [key: string]: number };
    licenses: { [key in LicenseType]?: number };
  };
}

// Validation Schema
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// ETL Pipeline Types
export interface ETLJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  source: {
    type: 'ngsl' | 'nawl' | 'jmdict' | 'kanjidic2' | 'tatoeba' | 'wiktionary';
    url: string;
    version: string;
  };
  target: {
    questionBank: string;
    deck?: string;
  };
  progress: {
    total: number;
    processed: number;
    errors: number;
    warnings: number;
  };
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Curation and Quality Control
export interface QualityReview {
  itemId: string;
  reviewerId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  score: number; // 1-5
  comments?: string;
  issues?: string[];
  suggestions?: string[];
  reviewedAt: string;
}

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'license' | 'quality' | 'duplicate';
  pattern?: string; // regex pattern
  action: 'flag' | 'reject' | 'auto_fix';
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
}

// Version Control
export interface VersionInfo {
  version: string;
  releaseDate: string;
  sources: {
    [sourceName: string]: {
      version: string;
      hash: string;
      itemCount: number;
    };
  };
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  notes?: string;
}

// Export/Import Formats
export interface ExportOptions {
  format: 'json' | 'csv' | 'anki' | 'quizlet';
  includeMedia: boolean;
  includeMetadata: boolean;
  filter?: QuestionBankFilter;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
  duplicates: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Utility Types
export type CreateQuestionBankItem = Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
export type UpdateQuestionBankItem = Partial<CreateQuestionBankItem> & { id: string };
export type QuestionBankItemSummary = Pick<QuestionBankItem, 'id' | 'prompt' | 'type' | 'language' | 'level' | 'tags' | 'source'>;