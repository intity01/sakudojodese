// Main Question Bank Index
import type { QuestionBank } from '../../types/core';

// Import English Question Banks
import {
  englishClassicBeginner,
  englishClassicIntermediate,
  englishClassicAdvanced,
  englishClassicExpert
} from './englishClassic';

import {
  englishCEFRA1,
  englishCEFRA2,
  englishCEFRB1,
  englishCEFRB2,
  englishCEFRC1,
  englishCEFRC2
} from './englishCEFR';

// Import Japanese Question Banks
import {
  japaneseClassicBeginner,
  japaneseClassicIntermediate,
  japaneseClassicAdvanced,
  japaneseClassicExpert
} from './japaneseClassic';

import {
  japaneseJLPTN5,
  japaneseJLPTN4,
  japaneseJLPTN3,
  japaneseJLPTN2,
  japaneseJLPTN1
} from './japaneseJLPT';

// Comprehensive Question Bank
export const comprehensiveQuestionBank: QuestionBank = {
  EN: {
    Classic: {
      Beginner: englishClassicBeginner,
      Intermediate: englishClassicIntermediate,
      Advanced: englishClassicAdvanced,
      Expert: englishClassicExpert
    },
    CEFR: {
      A1: englishCEFRA1,
      A2: englishCEFRA2,
      B1: englishCEFRB1,
      B2: englishCEFRB2,
      C1: englishCEFRC1,
      C2: englishCEFRC2
    }
  },
  JP: {
    Classic: {
      Beginner: japaneseClassicBeginner,
      Intermediate: japaneseClassicIntermediate,
      Advanced: japaneseClassicAdvanced,
      Expert: japaneseClassicExpert
    },
    JLPT: {
      N5: japaneseJLPTN5,
      N4: japaneseJLPTN4,
      N3: japaneseJLPTN3,
      N2: japaneseJLPTN2,
      N1: japaneseJLPTN1
    }
  }
};

// Question Bank Statistics
export const getQuestionBankStats = () => {
  const stats = {
    totalQuestions: 0,
    byTrack: {} as Record<string, number>,
    byFramework: {} as Record<string, Record<string, number>>,
    byLevel: {} as Record<string, Record<string, Record<string, number>>>,
    byType: {
      mcq: 0,
      typing: 0,
      open: 0
    },
    byDifficulty: {} as Record<string, Record<string, Record<string, { mcq: number; typing: number; open: number }>>>
  };

  Object.entries(comprehensiveQuestionBank).forEach(([track, frameworks]) => {
    stats.byTrack[track] = 0;
    stats.byFramework[track] = {};
    stats.byLevel[track] = {};
    stats.byDifficulty[track] = {};

    Object.entries(frameworks).forEach(([framework, levels]) => {
      if (!levels) return;
      
      stats.byFramework[track][framework] = 0;
      stats.byLevel[track][framework] = {};
      stats.byDifficulty[track][framework] = {};

      Object.entries(levels).forEach(([level, questions]) => {
        const questionCount = questions.length;
        stats.totalQuestions += questionCount;
        stats.byTrack[track] += questionCount;
        stats.byFramework[track][framework] += questionCount;
        stats.byLevel[track][framework][level] = questionCount;

        // Count by type
        const typeCount = { mcq: 0, typing: 0, open: 0 };
        questions.forEach(q => {
          stats.byType[q.type]++;
          typeCount[q.type]++;
        });
        stats.byDifficulty[track][framework][level] = typeCount;
      });
    });
  });

  return stats;
};

// Advanced Question Bank Analytics
export const getQuestionBankAnalytics = () => {
  const stats = getQuestionBankStats();
  
  return {
    ...stats,
    coverage: {
      tracksCount: Object.keys(stats.byTrack).length,
      frameworksCount: Object.values(stats.byFramework).reduce((sum, frameworks) => 
        sum + Object.keys(frameworks).length, 0),
      levelsCount: Object.values(stats.byLevel).reduce((sum, frameworks) => 
        sum + Object.values(frameworks).reduce((fSum, levels) => 
          fSum + Object.keys(levels).length, 0), 0)
    },
    distribution: {
      averageQuestionsPerTrack: stats.totalQuestions / Object.keys(stats.byTrack).length,
      averageQuestionsPerLevel: stats.totalQuestions / Object.values(stats.byLevel).reduce((sum, frameworks) => 
        sum + Object.values(frameworks).reduce((fSum, levels) => 
          fSum + Object.keys(levels).length, 0), 0),
      typeDistribution: {
        mcq: (stats.byType.mcq / stats.totalQuestions) * 100,
        typing: (stats.byType.typing / stats.totalQuestions) * 100,
        open: (stats.byType.open / stats.totalQuestions) * 100
      }
    },
    recommendations: generateQuestionBankRecommendations(stats)
  };
};

// Generate recommendations for question bank improvement
const generateQuestionBankRecommendations = (stats: any): string[] => {
  const recommendations: string[] = [];
  
  // Check for imbalanced question types
  const totalQuestions = stats.totalQuestions;
  const mcqRatio = stats.byType.mcq / totalQuestions;
  const typingRatio = stats.byType.typing / totalQuestions;
  const openRatio = stats.byType.open / totalQuestions;
  
  if (mcqRatio > 0.7) {
    recommendations.push('Consider adding more typing and open-ended questions for better variety');
  }
  if (typingRatio < 0.15) {
    recommendations.push('Add more typing questions to improve practical language skills');
  }
  if (openRatio < 0.1) {
    recommendations.push('Include more open-ended questions for creative expression practice');
  }
  
  // Check for level imbalances
  Object.entries(stats.byLevel).forEach(([track, frameworks]) => {
    Object.entries(frameworks as Record<string, Record<string, number>>).forEach(([framework, levels]) => {
      const levelCounts = Object.values(levels);
      const minCount = Math.min(...levelCounts);
      const maxCount = Math.max(...levelCounts);
      
      if (maxCount > minCount * 3) {
        recommendations.push(`${track}/${framework}: Balance question distribution across levels`);
      }
    });
  });
  
  // Check for minimum question thresholds
  Object.entries(stats.byLevel).forEach(([track, frameworks]) => {
    Object.entries(frameworks as Record<string, Record<string, number>>).forEach(([framework, levels]) => {
      Object.entries(levels).forEach(([level, count]) => {
        if (count < 10) {
          recommendations.push(`${track}/${framework}/${level}: Add more questions (currently ${count}, recommended: 15+)`);
        }
      });
    });
  });
  
  return recommendations;
};

// Question Bank Utilities
export const getAvailableTracks = (): string[] => {
  return Object.keys(comprehensiveQuestionBank);
};

export const getAvailableFrameworks = (track: string): string[] => {
  const trackData = comprehensiveQuestionBank[track as keyof typeof comprehensiveQuestionBank];
  return trackData ? Object.keys(trackData) : [];
};

export const getAvailableLevels = (track: string, framework: string): string[] => {
  const trackData = comprehensiveQuestionBank[track as keyof typeof comprehensiveQuestionBank];
  if (!trackData) return [];
  
  const frameworkData = trackData[framework as keyof typeof trackData];
  return frameworkData ? Object.keys(frameworkData) : [];
};

export const getQuestionCount = (track: string, framework: string, level: string): number => {
  const trackData = comprehensiveQuestionBank[track as keyof typeof comprehensiveQuestionBank];
  if (!trackData) return 0;
  
  const frameworkData = trackData[framework as keyof typeof trackData];
  if (!frameworkData) return 0;
  
  const levelData = frameworkData[level as keyof typeof frameworkData];
  return levelData ? levelData.length : 0;
};

export const getQuestions = (track: string, framework: string, level: string) => {
  const trackData = comprehensiveQuestionBank[track as keyof typeof comprehensiveQuestionBank];
  if (!trackData) return [];
  
  const frameworkData = trackData[framework as keyof typeof trackData];
  if (!frameworkData) return [];
  
  const levelData = frameworkData[level as keyof typeof frameworkData];
  return levelData || [];
};

// Question Filtering and Selection
export const filterQuestionsByType = (
  track: string, 
  framework: string, 
  level: string, 
  questionType: 'mcq' | 'typing' | 'open'
) => {
  const questions = getQuestions(track, framework, level);
  return questions.filter(q => q.type === questionType);
};

export const getRandomQuestions = (
  track: string, 
  framework: string, 
  level: string, 
  count: number
) => {
  const questions = getQuestions(track, framework, level);
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const searchQuestions = (
  track: string, 
  framework: string, 
  level: string, 
  searchTerm: string
) => {
  const questions = getQuestions(track, framework, level);
  const term = searchTerm.toLowerCase();
  
  return questions.filter(q => 
    q.prompt.toLowerCase().includes(term) ||
    (q.explanation && q.explanation.toLowerCase().includes(term)) ||
    q.id.toLowerCase().includes(term)
  );
};

// Advanced Question Filtering
export interface QuestionFilter {
  tracks?: string[];
  frameworks?: string[];
  levels?: string[];
  types?: ('mcq' | 'typing' | 'open')[];
  searchTerm?: string;
  minQuestions?: number;
  maxQuestions?: number;
  includeExplanations?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const getFilteredQuestions = (filter: QuestionFilter) => {
  let allQuestions: any[] = [];
  
  // Collect questions based on filter criteria
  Object.entries(comprehensiveQuestionBank).forEach(([track, frameworks]) => {
    if (filter.tracks && !filter.tracks.includes(track)) return;
    
    Object.entries(frameworks).forEach(([framework, levels]) => {
      if (filter.frameworks && !filter.frameworks.includes(framework)) return;
      if (!levels) return;
      
      Object.entries(levels).forEach(([level, questions]) => {
        if (filter.levels && !filter.levels.includes(level)) return;
        
        let filteredQuestions = [...questions];
        
        // Filter by type
        if (filter.types && filter.types.length > 0) {
          filteredQuestions = filteredQuestions.filter(q => filter.types!.includes(q.type));
        }
        
        // Filter by search term
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filteredQuestions = filteredQuestions.filter(q => 
            q.prompt.toLowerCase().includes(term) ||
            (q.explanation && q.explanation.toLowerCase().includes(term)) ||
            q.id.toLowerCase().includes(term)
          );
        }
        
        // Filter by explanation requirement
        if (filter.includeExplanations) {
          filteredQuestions = filteredQuestions.filter(q => q.explanation && q.explanation.length > 0);
        }
        
        // Add metadata to questions
        const questionsWithMeta = filteredQuestions.map(q => ({
          ...q,
          metadata: {
            track,
            framework,
            level,
            difficulty: getDifficultyLevel(track, framework, level),
            source: 'static_bank'
          }
        }));
        
        allQuestions.push(...questionsWithMeta);
      });
    });
  });
  
  // Apply quantity limits
  if (filter.maxQuestions && allQuestions.length > filter.maxQuestions) {
    // Shuffle and take random subset
    allQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, filter.maxQuestions);
  }
  
  if (filter.minQuestions && allQuestions.length < filter.minQuestions) {
    console.warn(`Only ${allQuestions.length} questions found, but ${filter.minQuestions} requested`);
  }
  
  return allQuestions;
};

// Get difficulty level based on track/framework/level
const getDifficultyLevel = (track: string, framework: string, level: string): 'easy' | 'medium' | 'hard' => {
  // English difficulty mapping
  if (track === 'EN') {
    if (framework === 'Classic') {
      switch (level) {
        case 'Beginner': return 'easy';
        case 'Intermediate': return 'medium';
        case 'Advanced': case 'Expert': return 'hard';
        default: return 'medium';
      }
    } else if (framework === 'CEFR') {
      switch (level) {
        case 'A1': case 'A2': return 'easy';
        case 'B1': case 'B2': return 'medium';
        case 'C1': case 'C2': return 'hard';
        default: return 'medium';
      }
    }
  }
  
  // Japanese difficulty mapping
  if (track === 'JP') {
    if (framework === 'Classic') {
      switch (level) {
        case 'Beginner': return 'easy';
        case 'Intermediate': return 'medium';
        case 'Advanced': case 'Expert': return 'hard';
        default: return 'medium';
      }
    } else if (framework === 'JLPT') {
      switch (level) {
        case 'N5': case 'N4': return 'easy';
        case 'N3': case 'N2': return 'medium';
        case 'N1': return 'hard';
        default: return 'medium';
      }
    }
  }
  
  return 'medium';
};

// Question Bank Recommendations
export const getRecommendedQuestions = (
  userLevel: string,
  track: string,
  framework: string,
  count: number = 10,
  focusAreas?: string[]
) => {
  const filter: QuestionFilter = {
    tracks: [track],
    frameworks: [framework],
    maxQuestions: count * 2, // Get more to allow for better selection
    includeExplanations: true
  };
  
  // Determine appropriate levels based on user level
  if (track === 'EN' && framework === 'CEFR') {
    switch (userLevel) {
      case 'A1':
        filter.levels = ['A1'];
        break;
      case 'A2':
        filter.levels = ['A1', 'A2'];
        break;
      case 'B1':
        filter.levels = ['A2', 'B1'];
        break;
      case 'B2':
        filter.levels = ['B1', 'B2'];
        break;
      case 'C1':
        filter.levels = ['B2', 'C1'];
        break;
      case 'C2':
        filter.levels = ['C1', 'C2'];
        break;
    }
  } else if (track === 'JP' && framework === 'JLPT') {
    switch (userLevel) {
      case 'N5':
        filter.levels = ['N5'];
        break;
      case 'N4':
        filter.levels = ['N5', 'N4'];
        break;
      case 'N3':
        filter.levels = ['N4', 'N3'];
        break;
      case 'N2':
        filter.levels = ['N3', 'N2'];
        break;
      case 'N1':
        filter.levels = ['N2', 'N1'];
        break;
    }
  }
  
  let questions = getFilteredQuestions(filter);
  
  // Apply focus areas if specified
  if (focusAreas && focusAreas.length > 0) {
    questions = questions.filter(q => 
      focusAreas.some(area => 
        q.prompt.toLowerCase().includes(area.toLowerCase()) ||
        (q.explanation && q.explanation.toLowerCase().includes(area.toLowerCase()))
      )
    );
  }
  
  // Balance question types
  const mcqQuestions = questions.filter(q => q.type === 'mcq');
  const typingQuestions = questions.filter(q => q.type === 'typing');
  const openQuestions = questions.filter(q => q.type === 'open');
  
  const selectedQuestions = [];
  const mcqCount = Math.floor(count * 0.6); // 60% MCQ
  const typingCount = Math.floor(count * 0.3); // 30% Typing
  const openCount = count - mcqCount - typingCount; // Remaining for Open
  
  selectedQuestions.push(...mcqQuestions.slice(0, mcqCount));
  selectedQuestions.push(...typingQuestions.slice(0, typingCount));
  selectedQuestions.push(...openQuestions.slice(0, openCount));
  
  // Fill remaining slots if needed
  const remaining = count - selectedQuestions.length;
  if (remaining > 0) {
    const unusedQuestions = questions.filter(q => !selectedQuestions.includes(q));
    selectedQuestions.push(...unusedQuestions.slice(0, remaining));
  }
  
  return selectedQuestions.sort(() => Math.random() - 0.5);
};

// Cross-level question selection for exam mode
export const getCrossLevelQuestions = (
  track: string,
  framework: string,
  targetLevel: string,
  count: number = 20
) => {
  const allLevels = getAvailableLevels(track, framework);
  const targetIndex = allLevels.indexOf(targetLevel);
  
  if (targetIndex === -1) {
    return getRandomQuestions(track, framework, targetLevel, count);
  }
  
  // Include questions from current level and adjacent levels
  const includeLevels = [];
  if (targetIndex > 0) includeLevels.push(allLevels[targetIndex - 1]); // Previous level
  includeLevels.push(allLevels[targetIndex]); // Current level
  if (targetIndex < allLevels.length - 1) includeLevels.push(allLevels[targetIndex + 1]); // Next level
  
  const filter: QuestionFilter = {
    tracks: [track],
    frameworks: [framework],
    levels: includeLevels,
    maxQuestions: count,
    includeExplanations: true
  };
  
  return getFilteredQuestions(filter);
};

// Validation
export const validateQuestionBank = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  Object.entries(comprehensiveQuestionBank).forEach(([track, frameworks]) => {
    Object.entries(frameworks).forEach(([framework, levels]) => {
      if (!levels) {
        errors.push(`Missing levels for ${track}/${framework}`);
        return;
      }

      Object.entries(levels).forEach(([level, questions]) => {
        if (questions.length === 0) {
          warnings.push(`No questions found for ${track}/${framework}/${level}`);
        }

        questions.forEach((question, index) => {
          // Validate question structure
          if (!question.id) {
            errors.push(`Missing ID for question at ${track}/${framework}/${level}[${index}]`);
          }
          if (!question.prompt) {
            errors.push(`Missing prompt for question ${question.id}`);
          }
          if (!question.type) {
            errors.push(`Missing type for question ${question.id}`);
          }

          // Type-specific validation
          if (question.type === 'mcq') {
            const mcq = question as any;
            if (!mcq.choices || mcq.choices.length < 2) {
              errors.push(`MCQ question ${question.id} needs at least 2 choices`);
            }
            if (mcq.answerIndex === undefined || mcq.answerIndex < 0 || mcq.answerIndex >= mcq.choices?.length) {
              errors.push(`MCQ question ${question.id} has invalid answerIndex`);
            }
          }

          if (question.type === 'typing') {
            const typing = question as any;
            if (!typing.accept || typing.accept.length === 0) {
              errors.push(`Typing question ${question.id} needs at least one accepted answer`);
            }
          }
        });
      });
    });
  });

  return { errors, warnings };
};

// Export default question bank (can be switched between minimal and comprehensive)
export { comprehensiveQuestionBank as questionBank };
export { minimalQuestionBank } from '../minimalQuestionBank';

// Re-export for backward compatibility
export default comprehensiveQuestionBank;