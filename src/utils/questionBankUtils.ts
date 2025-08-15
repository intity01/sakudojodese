// Question Bank Utilities
// Helper functions for data processing, validation, and transformation

import type {
  QuestionBankItem,
  Source,
  ValidationResult,
  LicenseType,
  Language,
  QuestionType,
  DifficultyMetrics,
  CreateQuestionBankItem
} from '../types/questionBank';

// Validation Utilities
export class QuestionBankValidator {
  static validateItem(item: CreateQuestionBankItem): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields validation
    if (!item.prompt?.trim()) {
      errors.push('Prompt is required and cannot be empty');
    }

    if (!item.language) {
      errors.push('Language is required');
    }

    if (!item.type) {
      errors.push('Question type is required');
    }

    if (!item.answer) {
      errors.push('Answer is required');
    }

    if (!item.source) {
      errors.push('Source attribution is required');
    }

    // Content validation
    if (item.prompt && item.prompt.length < 10) {
      warnings.push('Prompt is very short, consider adding more context');
    }

    if (item.prompt && item.prompt.length > 500) {
      warnings.push('Prompt is very long, consider breaking it down');
    }

    // MCQ specific validation
    if (item.type === 'vocab' || item.type === 'grammar') {
      if (!item.choices || item.choices.length < 2) {
        errors.push('MCQ questions must have at least 2 choices');
      }

      if (item.choices && item.choices.length > 6) {
        warnings.push('Too many choices may confuse learners, consider reducing to 3-4');
      }

      if (typeof item.answer !== 'number') {
        errors.push('MCQ answer must be a number (choice index)');
      }

      if (typeof item.answer === 'number' && item.choices) {
        if (item.answer < 0 || item.answer >= item.choices.length) {
          errors.push('Answer index is out of range for available choices');
        }
      }
    }

    // Open-ended validation
    if (item.type === 'conversation' || item.type === 'reading') {
      if (typeof item.answer !== 'string' && !Array.isArray(item.answer)) {
        errors.push('Open-ended questions must have string or array answers');
      }
    }

    // Language-specific validation
    if (item.language === 'JP') {
      // Check for proper Japanese characters
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(item.prompt);
      if (!hasJapanese) {
        warnings.push('Japanese content should contain hiragana, katakana, or kanji characters');
      }
    }

    if (item.language === 'EN') {
      // Check for proper English content
      const hasEnglish = /[a-zA-Z]/.test(item.prompt);
      if (!hasEnglish) {
        warnings.push('English content should contain alphabetic characters');
      }
    }

    // License validation
    if (item.source.license === 'Other' && !item.source.attribution) {
      errors.push('Custom licenses require detailed attribution');
    }

    // Suggestions
    if (!item.explanation) {
      suggestions.push('Consider adding an explanation to help learners understand the answer');
    }

    if (!item.tags || item.tags.length === 0) {
      suggestions.push('Adding tags will help with content discovery and organization');
    }

    if (item.tags && item.tags.length > 10) {
      suggestions.push('Too many tags may reduce their effectiveness, consider using 3-7 key tags');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  static validateSource(source: Source): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!source.name?.trim()) {
      errors.push('Source name is required');
    }

    if (!source.license) {
      errors.push('License type is required');
    }

    if (!source.attribution?.trim()) {
      errors.push('Attribution text is required');
    }

    if (source.url && !this.isValidUrl(source.url)) {
      errors.push('Source URL is not valid');
    }

    if (source.license === 'CC-BY' || source.license === 'CC-BY-SA') {
      if (!source.url) {
        warnings.push('Creative Commons sources should include a URL when possible');
      }
    }

    if (!source.description) {
      suggestions.push('Adding a description helps users understand the source');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Data Transformation Utilities
export class QuestionBankTransformer {
  // Convert from legacy format to new schema
  static fromLegacyFormat(legacyItem: any): CreateQuestionBankItem {
    return {
      language: this.mapLanguage(legacyItem.lang || legacyItem.language),
      type: this.mapQuestionType(legacyItem.type),
      prompt: legacyItem.question || legacyItem.prompt,
      choices: legacyItem.choices || legacyItem.options,
      answer: legacyItem.answer || legacyItem.correctAnswer,
      explanation: legacyItem.explanation || legacyItem.hint,
      level: {
        system: 'heuristic',
        level: '3', // default middle level
        confidence: 0.5
      },
      difficulty: {
        overallScore: 50 // default middle difficulty
      },
      tags: legacyItem.tags || [],
      source: {
        id: 'legacy-import',
        name: 'Legacy Import',
        license: 'Other',
        attribution: 'Imported from legacy system'
      }
    };
  }

  // Convert to Anki format
  static toAnkiFormat(item: QuestionBankItem): {
    front: string;
    back: string;
    tags: string;
    source: string;
  } {
    let front = item.prompt;
    let back = '';

    if (item.type === 'vocab' && item.choices) {
      // For vocabulary, show the word and choices on front
      back = `Answer: ${item.choices[item.answer as number]}`;
      if (item.explanation) {
        back += `\n\nExplanation: ${item.explanation}`;
      }
    } else if (typeof item.answer === 'string') {
      back = item.answer;
      if (item.explanation) {
        back += `\n\n${item.explanation}`;
      }
    }

    return {
      front,
      back,
      tags: item.tags.join(' '),
      source: item.source.name
    };
  }

  // Convert to Quizlet format
  static toQuizletFormat(item: QuestionBankItem): {
    term: string;
    definition: string;
  } {
    let term = item.prompt;
    let definition = '';

    if (item.type === 'vocab' && item.choices) {
      definition = item.choices[item.answer as number];
    } else if (typeof item.answer === 'string') {
      definition = item.answer;
    }

    if (item.explanation) {
      definition += ` (${item.explanation})`;
    }

    return { term, definition };
  }

  private static mapLanguage(lang: string): Language {
    const langMap: Record<string, Language> = {
      'en': 'EN',
      'english': 'EN',
      'jp': 'JP',
      'ja': 'JP',
      'japanese': 'JP',
      'th': 'TH',
      'thai': 'TH'
    };
    return langMap[lang.toLowerCase()] || 'EN';
  }

  private static mapQuestionType(type: string): QuestionType {
    const typeMap: Record<string, QuestionType> = {
      'vocabulary': 'vocab',
      'word': 'vocab',
      'grammar': 'grammar',
      'reading': 'reading',
      'listening': 'listening',
      'pronunciation': 'pronunciation',
      'speaking': 'conversation',
      'conversation': 'conversation'
    };
    return typeMap[type.toLowerCase()] || 'vocab';
  }
}

// Content Analysis Utilities
export class QuestionBankAnalyzer {
  // Analyze text complexity
  static analyzeTextComplexity(text: string): {
    characterCount: number;
    wordCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    complexityScore: number;
  } {
    const characterCount = text.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Simple complexity score based on various factors
    let complexityScore = 0;
    
    // Length factor
    complexityScore += Math.min(characterCount / 10, 20);
    
    // Sentence length factor
    complexityScore += Math.min(averageWordsPerSentence * 2, 30);
    
    // Word length factor
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    complexityScore += Math.min(averageWordLength * 5, 25);
    
    // Special characters factor (for Japanese)
    const specialCharCount = (text.match(/[\u4E00-\u9FAF]/g) || []).length;
    complexityScore += Math.min(specialCharCount * 2, 25);
    
    return {
      characterCount,
      wordCount,
      sentenceCount,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      complexityScore: Math.min(100, Math.round(complexityScore))
    };
  }

  // Extract tags from content
  static extractTags(item: CreateQuestionBankItem): string[] {
    const tags = new Set<string>();
    
    // Add type-based tags
    tags.add(item.type);
    tags.add(item.language.toLowerCase());
    
    // Extract from prompt
    const prompt = item.prompt.toLowerCase();
    
    // Common topic keywords
    const topicKeywords = {
      'business': ['business', 'work', 'office', 'company', 'meeting', 'professional'],
      'travel': ['travel', 'airport', 'hotel', 'vacation', 'trip', 'journey'],
      'food': ['food', 'restaurant', 'eat', 'drink', 'meal', 'cooking'],
      'family': ['family', 'mother', 'father', 'child', 'parent', 'sibling'],
      'education': ['school', 'study', 'learn', 'teacher', 'student', 'class'],
      'health': ['health', 'doctor', 'hospital', 'medicine', 'sick', 'healthy'],
      'technology': ['computer', 'internet', 'phone', 'digital', 'online', 'app']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        tags.add(topic);
      }
    }
    
    // Grammar-specific tags for Japanese
    if (item.language === 'JP') {
      if (prompt.includes('は') || prompt.includes('が')) tags.add('particles');
      if (prompt.includes('です') || prompt.includes('ます')) tags.add('polite-form');
      if (prompt.includes('た') || prompt.includes('だ')) tags.add('past-tense');
    }
    
    // Grammar-specific tags for English
    if (item.language === 'EN') {
      if (prompt.includes('will') || prompt.includes('going to')) tags.add('future-tense');
      if (prompt.includes('have') || prompt.includes('has')) tags.add('present-perfect');
      if (prompt.includes('would') || prompt.includes('could')) tags.add('conditionals');
    }
    
    return Array.from(tags);
  }

  // Detect duplicates
  static findSimilarItems(
    newItem: CreateQuestionBankItem,
    existingItems: QuestionBankItem[],
    threshold: number = 0.8
  ): QuestionBankItem[] {
    const similar: QuestionBankItem[] = [];
    
    for (const existing of existingItems) {
      const similarity = this.calculateSimilarity(newItem.prompt, existing.prompt);
      if (similarity >= threshold) {
        similar.push(existing);
      }
    }
    
    return similar;
  }

  private static calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

// License and Attribution Utilities
export class LicenseUtils {
  static readonly LICENSE_INFO: Record<LicenseType, {
    name: string;
    url: string;
    requiresAttribution: boolean;
    allowsCommercial: boolean;
    allowsDerivatives: boolean;
    description: string;
  }> = {
    'CC-BY': {
      name: 'Creative Commons Attribution 4.0',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      requiresAttribution: true,
      allowsCommercial: true,
      allowsDerivatives: true,
      description: 'Allows any use with proper attribution'
    },
    'CC-BY-SA': {
      name: 'Creative Commons Attribution-ShareAlike 4.0',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      requiresAttribution: true,
      allowsCommercial: true,
      allowsDerivatives: true,
      description: 'Allows any use with attribution, derivatives must use same license'
    },
    'EDRDG': {
      name: 'Electronic Dictionary Research and Development Group',
      url: 'https://www.edrdg.org/edrdg/licence.html',
      requiresAttribution: true,
      allowsCommercial: false,
      allowsDerivatives: true,
      description: 'Free for non-commercial use with attribution'
    },
    'Public-Domain': {
      name: 'Public Domain',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      requiresAttribution: false,
      allowsCommercial: true,
      allowsDerivatives: true,
      description: 'No rights reserved, free for any use'
    },
    'Other': {
      name: 'Other License',
      url: '',
      requiresAttribution: true,
      allowsCommercial: false,
      allowsDerivatives: false,
      description: 'Custom license terms apply'
    }
  };

  static generateAttribution(source: Source): string {
    const info = this.LICENSE_INFO[source.license];
    
    let attribution = source.attribution;
    
    if (info.requiresAttribution) {
      if (source.url) {
        attribution += ` (${source.url})`;
      }
      
      if (source.license !== 'Other') {
        attribution += ` - Licensed under ${info.name}`;
        if (info.url) {
          attribution += ` (${info.url})`;
        }
      }
    }
    
    return attribution;
  }

  static validateLicenseCompatibility(licenses: LicenseType[]): {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const hasCommercialRestriction = licenses.some(
      license => !this.LICENSE_INFO[license].allowsCommercial
    );
    
    const hasShareAlike = licenses.includes('CC-BY-SA');
    const hasOther = licenses.includes('Other');
    
    if (hasCommercialRestriction && licenses.length > 1) {
      issues.push('Mixing commercial and non-commercial licenses may restrict usage');
    }
    
    if (hasShareAlike && licenses.length > 1) {
      issues.push('CC-BY-SA requires derivatives to use the same license');
      recommendations.push('Consider using CC-BY-SA for all content or separate into different collections');
    }
    
    if (hasOther) {
      issues.push('Custom licenses require manual review for compatibility');
      recommendations.push('Review custom license terms carefully');
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Export utilities
export {
  QuestionBankValidator as Validator,
  QuestionBankTransformer as Transformer,
  QuestionBankAnalyzer as Analyzer,
  LicenseUtils
};