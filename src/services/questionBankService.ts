// Question Bank Service Layer
// Handles CRUD operations, search, filtering, and data management

import type {
  QuestionBank,
  QuestionBankItem,
  QuestionBankFilter,
  QuestionBankSearchResult,
  Deck,
  Source,
  ValidationResult,
  ETLJob,
  QualityReview,
  VersionInfo,
  ExportOptions,
  ImportResult,
  APIResponse,
  PaginatedResponse,
  CreateQuestionBankItem,
  UpdateQuestionBankItem,
  DifficultyMetrics,
  LevelClassification
} from '../types/questionBank';

export class QuestionBankService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/question-bank', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  // Question Bank CRUD Operations
  async getQuestionBanks(): Promise<APIResponse<QuestionBank[]>> {
    const response = await fetch(`${this.baseUrl}/banks`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getQuestionBank(id: string): Promise<APIResponse<QuestionBank>> {
    const response = await fetch(`${this.baseUrl}/banks/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createQuestionBank(bank: Omit<QuestionBank, 'metadata'>): Promise<APIResponse<QuestionBank>> {
    const response = await fetch(`${this.baseUrl}/banks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bank),
    });
    return response.json();
  }

  // Question Item Operations
  async searchItems(
    filter: QuestionBankFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<APIResponse<PaginatedResponse<QuestionBankItem>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...this.serializeFilter(filter),
    });

    const response = await fetch(`${this.baseUrl}/items/search?${params}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getItem(id: string): Promise<APIResponse<QuestionBankItem>> {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createItem(item: CreateQuestionBankItem): Promise<APIResponse<QuestionBankItem>> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async updateItem(item: UpdateQuestionBankItem): Promise<APIResponse<QuestionBankItem>> {
    const response = await fetch(`${this.baseUrl}/items/${item.id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async deleteItem(id: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Deck Operations
  async getDecks(filter?: { language?: string; type?: string }): Promise<APIResponse<Deck[]>> {
    const params = filter ? new URLSearchParams(filter as Record<string, string>) : '';
    const response = await fetch(`${this.baseUrl}/decks?${params}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getDeck(id: string): Promise<APIResponse<Deck>> {
    const response = await fetch(`${this.baseUrl}/decks/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getDeckItems(id: string): Promise<APIResponse<QuestionBankItem[]>> {
    const response = await fetch(`${this.baseUrl}/decks/${id}/items`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Source Management
  async getSources(): Promise<APIResponse<Source[]>> {
    const response = await fetch(`${this.baseUrl}/sources`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createSource(source: Omit<Source, 'id'>): Promise<APIResponse<Source>> {
    const response = await fetch(`${this.baseUrl}/sources`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(source),
    });
    return response.json();
  }

  // Validation
  async validateItem(item: CreateQuestionBankItem): Promise<APIResponse<ValidationResult>> {
    const response = await fetch(`${this.baseUrl}/items/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  async validateBatch(items: CreateQuestionBankItem[]): Promise<APIResponse<ValidationResult[]>> {
    const response = await fetch(`${this.baseUrl}/items/validate-batch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ items }),
    });
    return response.json();
  }

  // ETL Operations
  async getETLJobs(): Promise<APIResponse<ETLJob[]>> {
    const response = await fetch(`${this.baseUrl}/etl/jobs`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async startETLJob(job: Omit<ETLJob, 'id' | 'status' | 'progress'>): Promise<APIResponse<ETLJob>> {
    const response = await fetch(`${this.baseUrl}/etl/jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(job),
    });
    return response.json();
  }

  async getETLJobStatus(id: string): Promise<APIResponse<ETLJob>> {
    const response = await fetch(`${this.baseUrl}/etl/jobs/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Quality Control
  async submitReview(review: Omit<QualityReview, 'reviewedAt'>): Promise<APIResponse<QualityReview>> {
    const response = await fetch(`${this.baseUrl}/quality/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...review,
        reviewedAt: new Date().toISOString(),
      }),
    });
    return response.json();
  }

  async getItemReviews(itemId: string): Promise<APIResponse<QualityReview[]>> {
    const response = await fetch(`${this.baseUrl}/quality/reviews?itemId=${itemId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Version Management
  async getVersions(): Promise<APIResponse<VersionInfo[]>> {
    const response = await fetch(`${this.baseUrl}/versions`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createVersion(notes?: string): Promise<APIResponse<VersionInfo>> {
    const response = await fetch(`${this.baseUrl}/versions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return response.json();
  }

  // Export/Import
  async exportData(options: ExportOptions): Promise<APIResponse<{ downloadUrl: string }>> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    });
    return response.json();
  }

  async importData(file: File, format: string): Promise<APIResponse<ImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const response = await fetch(`${this.baseUrl}/import`, {
      method: 'POST',
      headers: {
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      body: formData,
    });
    return response.json();
  }

  // Analytics and Statistics
  async getStatistics(): Promise<APIResponse<{
    totalItems: number;
    itemsByLanguage: Record<string, number>;
    itemsByType: Record<string, number>;
    itemsByLevel: Record<string, number>;
    itemsBySource: Record<string, number>;
    recentActivity: {
      date: string;
      created: number;
      updated: number;
      reviewed: number;
    }[];
  }>> {
    const response = await fetch(`${this.baseUrl}/statistics`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Utility Methods
  private serializeFilter(filter: QuestionBankFilter): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (filter.language) {
      params.language = filter.language.join(',');
    }
    if (filter.type) {
      params.type = filter.type.join(',');
    }
    if (filter.level) {
      params.levelSystem = filter.level.system;
      params.levels = filter.level.levels.join(',');
    }
    if (filter.tags) {
      params.tags = filter.tags.join(',');
    }
    if (filter.source) {
      params.source = filter.source.join(',');
    }
    if (filter.license) {
      params.license = filter.license.join(',');
    }
    if (filter.difficulty) {
      params.difficultyMin = filter.difficulty.min.toString();
      params.difficultyMax = filter.difficulty.max.toString();
    }
    if (filter.textSearch) {
      params.q = filter.textSearch;
    }
    
    return params;
  }

  // Difficulty Calculation Utilities
  static calculateDifficulty(item: CreateQuestionBankItem): DifficultyMetrics {
    let score = 50; // base score
    
    // Word frequency impact (if available)
    if (item.difficulty?.wordFrequency) {
      // Higher frequency = easier (lower score)
      score -= Math.min(item.difficulty.wordFrequency / 100, 20);
    }
    
    // Sentence length impact
    const promptLength = item.prompt.length;
    if (promptLength > 100) {
      score += Math.min((promptLength - 100) / 10, 15);
    }
    
    // Grammar complexity (if specified)
    if (item.difficulty?.grammarComplexity) {
      score += item.difficulty.grammarComplexity * 3;
    }
    
    // Kanji count for Japanese
    if (item.language === 'JP' && item.difficulty?.kanjiCount) {
      score += item.difficulty.kanjiCount * 2;
    }
    
    // Vocabulary level
    if (item.difficulty?.vocabularyLevel) {
      score += item.difficulty.vocabularyLevel * 4;
    }
    
    return {
      ...item.difficulty,
      overallScore: Math.max(1, Math.min(100, Math.round(score)))
    };
  }

  // Level Classification Utilities
  static classifyLevel(item: CreateQuestionBankItem): LevelClassification {
    // This is a simplified heuristic - in practice, this would use
    // more sophisticated NLP and ML models
    
    const difficulty = this.calculateDifficulty(item);
    
    if (item.language === 'EN') {
      // CEFR classification based on difficulty
      if (difficulty.overallScore <= 20) return { system: 'CEFR', level: 'A1' };
      if (difficulty.overallScore <= 35) return { system: 'CEFR', level: 'A2' };
      if (difficulty.overallScore <= 50) return { system: 'CEFR', level: 'B1' };
      if (difficulty.overallScore <= 70) return { system: 'CEFR', level: 'B2' };
      if (difficulty.overallScore <= 85) return { system: 'CEFR', level: 'C1' };
      return { system: 'CEFR', level: 'C2' };
    }
    
    if (item.language === 'JP') {
      // JLPT classification based on difficulty
      if (difficulty.overallScore <= 25) return { system: 'JLPT', level: 'N5' };
      if (difficulty.overallScore <= 40) return { system: 'JLPT', level: 'N4' };
      if (difficulty.overallScore <= 60) return { system: 'JLPT', level: 'N3' };
      if (difficulty.overallScore <= 80) return { system: 'JLPT', level: 'N2' };
      return { system: 'JLPT', level: 'N1' };
    }
    
    // Fallback to heuristic levels
    const heuristicLevel = Math.ceil(difficulty.overallScore / 20);
    return { 
      system: 'heuristic', 
      level: Math.min(5, heuristicLevel).toString() as '1' | '2' | '3' | '4' | '5',
      confidence: 0.7 // Lower confidence for heuristic classification
    };
  }
}

// Default instance
export const questionBankService = new QuestionBankService();