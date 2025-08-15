import { describe, it, expect, beforeEach } from 'vitest';
import { 
  comprehensiveQuestionBank,
  getQuestionBankStats,
  getQuestionBankAnalytics,
  getAvailableTracks,
  getAvailableFrameworks,
  getAvailableLevels,
  getQuestionCount,
  getQuestions,
  filterQuestionsByType,
  getRandomQuestions,
  searchQuestions,
  getFilteredQuestions,
  getRecommendedQuestions,
  getCrossLevelQuestions,
  validateQuestionBank,
  type QuestionFilter
} from './index';

describe('Question Bank System', () => {
  describe('Basic Structure', () => {
    it('should have the correct structure', () => {
      expect(comprehensiveQuestionBank).toBeDefined();
      expect(comprehensiveQuestionBank.EN).toBeDefined();
      expect(comprehensiveQuestionBank.JP).toBeDefined();
      expect(comprehensiveQuestionBank.EN.Classic).toBeDefined();
      expect(comprehensiveQuestionBank.EN.CEFR).toBeDefined();
      expect(comprehensiveQuestionBank.JP.Classic).toBeDefined();
      expect(comprehensiveQuestionBank.JP.JLPT).toBeDefined();
    });

    it('should have questions in each level', () => {
      const tracks = getAvailableTracks();
      expect(tracks.length).toBeGreaterThan(0);

      tracks.forEach(track => {
        const frameworks = getAvailableFrameworks(track);
        expect(frameworks.length).toBeGreaterThan(0);

        frameworks.forEach(framework => {
          const levels = getAvailableLevels(track, framework);
          expect(levels.length).toBeGreaterThan(0);

          levels.forEach(level => {
            const count = getQuestionCount(track, framework, level);
            expect(count).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have comprehensive coverage', () => {
      const analytics = getQuestionBankAnalytics();
      
      expect(analytics.coverage.tracksCount).toBe(2); // EN and JP
      expect(analytics.coverage.frameworksCount).toBeGreaterThanOrEqual(4); // Classic, CEFR, JLPT
      expect(analytics.coverage.levelsCount).toBeGreaterThan(10);
      expect(analytics.totalQuestions).toBeGreaterThan(50);
    });
  });

  describe('Question Retrieval', () => {
    it('should retrieve questions correctly', () => {
      const questions = getQuestions('EN', 'Classic', 'Beginner');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      
      questions.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('prompt');
        expect(['mcq', 'typing', 'open']).toContain(question.type);
      });
    });

    it('should return empty array for invalid parameters', () => {
      expect(getQuestions('INVALID', 'Classic', 'Beginner')).toEqual([]);
      expect(getQuestions('EN', 'INVALID', 'Beginner')).toEqual([]);
      expect(getQuestions('EN', 'Classic', 'INVALID')).toEqual([]);
    });

    it('should retrieve Japanese JLPT questions correctly', () => {
      const n5Questions = getQuestions('JP', 'JLPT', 'N5');
      const n1Questions = getQuestions('JP', 'JLPT', 'N1');
      
      expect(n5Questions.length).toBeGreaterThan(0);
      expect(n1Questions.length).toBeGreaterThan(0);
      
      // N5 should have more basic questions, N1 should have more complex ones
      expect(n5Questions.length).toBeGreaterThanOrEqual(n1Questions.length);
    });

    it('should retrieve English CEFR questions correctly', () => {
      const a1Questions = getQuestions('EN', 'CEFR', 'A1');
      const c2Questions = getQuestions('EN', 'CEFR', 'C2');
      
      expect(a1Questions.length).toBeGreaterThan(0);
      expect(c2Questions.length).toBeGreaterThan(0);
    });
  });

  describe('Question Filtering', () => {
    it('should filter questions by type', () => {
      const allQuestions = getQuestions('EN', 'Classic', 'Beginner');
      const mcqQuestions = filterQuestionsByType('EN', 'Classic', 'Beginner', 'mcq');
      const typingQuestions = filterQuestionsByType('EN', 'Classic', 'Beginner', 'typing');
      const openQuestions = filterQuestionsByType('EN', 'Classic', 'Beginner', 'open');

      expect(mcqQuestions.every(q => q.type === 'mcq')).toBe(true);
      expect(typingQuestions.every(q => q.type === 'typing')).toBe(true);
      expect(openQuestions.every(q => q.type === 'open')).toBe(true);
      
      expect(mcqQuestions.length + typingQuestions.length + openQuestions.length).toBeLessThanOrEqual(allQuestions.length);
    });

    it('should get random questions', () => {
      const questions1 = getRandomQuestions('EN', 'Classic', 'Beginner', 5);
      const questions2 = getRandomQuestions('EN', 'Classic', 'Beginner', 5);
      
      expect(questions1.length).toBeLessThanOrEqual(5);
      expect(questions2.length).toBeLessThanOrEqual(5);
      
      // Questions should be different (with high probability)
      const ids1 = questions1.map(q => q.id).sort();
      const ids2 = questions2.map(q => q.id).sort();
      expect(ids1).not.toEqual(ids2);
    });

    it('should search questions by term', () => {
      const results = searchQuestions('EN', 'Classic', 'Beginner', 'article');
      
      results.forEach(question => {
        const searchTerm = 'article';
        const found = 
          question.prompt.toLowerCase().includes(searchTerm) ||
          (question.explanation && question.explanation.toLowerCase().includes(searchTerm)) ||
          question.id.toLowerCase().includes(searchTerm);
        expect(found).toBe(true);
      });
    });

    it('should use advanced filtering', () => {
      const filter: QuestionFilter = {
        tracks: ['EN'],
        frameworks: ['Classic', 'CEFR'],
        types: ['mcq', 'typing'],
        maxQuestions: 10,
        includeExplanations: true
      };
      
      const results = getFilteredQuestions(filter);
      
      expect(results.length).toBeLessThanOrEqual(10);
      expect(results.every(q => ['mcq', 'typing'].includes(q.type))).toBe(true);
      expect(results.every(q => q.explanation && q.explanation.length > 0)).toBe(true);
      expect(results.every(q => q.metadata?.track === 'EN')).toBe(true);
    });

    it('should filter by search term in advanced filter', () => {
      const filter: QuestionFilter = {
        tracks: ['EN'],
        searchTerm: 'grammar',
        maxQuestions: 5
      };
      
      const results = getFilteredQuestions(filter);
      
      results.forEach(question => {
        const found = 
          question.prompt.toLowerCase().includes('grammar') ||
          (question.explanation && question.explanation.toLowerCase().includes('grammar')) ||
          question.id.toLowerCase().includes('grammar');
        expect(found).toBe(true);
      });
    });
  });

  describe('Recommended Questions', () => {
    it('should get recommended questions for user level', () => {
      const recommendations = getRecommendedQuestions('A2', 'EN', 'CEFR', 8);
      
      expect(recommendations.length).toBeLessThanOrEqual(8);
      expect(recommendations.every(q => q.metadata?.track === 'EN')).toBe(true);
      expect(recommendations.every(q => q.metadata?.framework === 'CEFR')).toBe(true);
      
      // Should include appropriate levels for A2 (A1, A2)
      const levels = recommendations.map(q => q.metadata?.level);
      expect(levels.some(level => ['A1', 'A2'].includes(level!))).toBe(true);
    });

    it('should balance question types in recommendations', () => {
      const recommendations = getRecommendedQuestions('N4', 'JP', 'JLPT', 10);
      
      const mcqCount = recommendations.filter(q => q.type === 'mcq').length;
      const typingCount = recommendations.filter(q => q.type === 'typing').length;
      const openCount = recommendations.filter(q => q.type === 'open').length;
      
      // Should have a reasonable distribution
      expect(mcqCount).toBeGreaterThan(0);
      expect(mcqCount + typingCount + openCount).toBe(recommendations.length);
    });

    it('should get cross-level questions for exam mode', () => {
      const examQuestions = getCrossLevelQuestions('EN', 'CEFR', 'B1', 15);
      
      expect(examQuestions.length).toBeLessThanOrEqual(15);
      
      // Should include questions from adjacent levels
      const levels = examQuestions.map(q => q.metadata?.level);
      const uniqueLevels = [...new Set(levels)];
      expect(uniqueLevels.length).toBeGreaterThan(1); // Should have multiple levels
    });
  });

  describe('Statistics and Analytics', () => {
    it('should generate correct statistics', () => {
      const stats = getQuestionBankStats();
      
      expect(stats.totalQuestions).toBeGreaterThan(0);
      expect(Object.keys(stats.byTrack)).toContain('EN');
      expect(Object.keys(stats.byTrack)).toContain('JP');
      
      // Verify totals match
      const trackTotal = Object.values(stats.byTrack).reduce((sum, count) => sum + count, 0);
      expect(trackTotal).toBe(stats.totalQuestions);
      
      // Check type distribution
      expect(stats.byType.mcq).toBeGreaterThan(0);
      expect(stats.byType.typing).toBeGreaterThan(0);
      expect(stats.byType.open).toBeGreaterThan(0);
      
      const typeTotal = stats.byType.mcq + stats.byType.typing + stats.byType.open;
      expect(typeTotal).toBe(stats.totalQuestions);
    });

    it('should generate analytics with recommendations', () => {
      const analytics = getQuestionBankAnalytics();
      
      expect(analytics.coverage).toBeDefined();
      expect(analytics.distribution).toBeDefined();
      expect(analytics.recommendations).toBeDefined();
      
      expect(Array.isArray(analytics.recommendations)).toBe(true);
      expect(analytics.distribution.typeDistribution.mcq).toBeGreaterThan(0);
      expect(analytics.distribution.typeDistribution.typing).toBeGreaterThan(0);
      expect(analytics.distribution.typeDistribution.open).toBeGreaterThan(0);
      
      // Percentages should add up to 100
      const totalPercentage = 
        analytics.distribution.typeDistribution.mcq +
        analytics.distribution.typeDistribution.typing +
        analytics.distribution.typeDistribution.open;
      expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1);
    });

    it('should provide meaningful recommendations', () => {
      const analytics = getQuestionBankAnalytics();
      
      // Recommendations should be strings
      analytics.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Validation', () => {
    it('should validate question bank structure', () => {
      const validation = validateQuestionBank();
      
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
      
      // Should have minimal errors in a well-structured question bank
      if (validation.errors.length > 0) {
        console.warn('Question bank validation errors:', validation.errors);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('Question bank validation warnings:', validation.warnings);
      }
      
      // Critical errors should be minimal
      expect(validation.errors.length).toBeLessThan(5);
    });

    it('should validate individual question structures', () => {
      const questions = getQuestions('EN', 'Classic', 'Beginner');
      
      questions.forEach(question => {
        expect(question.id).toBeDefined();
        expect(typeof question.id).toBe('string');
        expect(question.id.length).toBeGreaterThan(0);
        
        expect(question.type).toBeDefined();
        expect(['mcq', 'typing', 'open']).toContain(question.type);
        
        expect(question.prompt).toBeDefined();
        expect(typeof question.prompt).toBe('string');
        expect(question.prompt.length).toBeGreaterThan(0);
        
        if (question.type === 'mcq') {
          const mcq = question as any;
          expect(Array.isArray(mcq.choices)).toBe(true);
          expect(mcq.choices.length).toBeGreaterThanOrEqual(2);
          expect(typeof mcq.answerIndex).toBe('number');
          expect(mcq.answerIndex).toBeGreaterThanOrEqual(0);
          expect(mcq.answerIndex).toBeLessThan(mcq.choices.length);
        }
        
        if (question.type === 'typing') {
          const typing = question as any;
          expect(Array.isArray(typing.accept)).toBe(true);
          expect(typing.accept.length).toBeGreaterThan(0);
          typing.accept.forEach((answer: string) => {
            expect(typeof answer).toBe('string');
            expect(answer.length).toBeGreaterThan(0);
          });
        }
      });
    });

    it('should validate Japanese JLPT questions', () => {
      const n5Questions = getQuestions('JP', 'JLPT', 'N5');
      const n1Questions = getQuestions('JP', 'JLPT', 'N1');
      
      // N5 questions should be simpler
      n5Questions.forEach(question => {
        expect(question.id).toMatch(/jp-jlpt-n5-/);
      });
      
      // N1 questions should be more complex
      n1Questions.forEach(question => {
        expect(question.id).toMatch(/jp-jlpt-n1-/);
      });
    });

    it('should validate English CEFR questions', () => {
      const a1Questions = getQuestions('EN', 'CEFR', 'A1');
      const c2Questions = getQuestions('EN', 'CEFR', 'C2');
      
      // A1 questions should be basic
      a1Questions.forEach(question => {
        expect(question.id).toMatch(/en-cefr-a1-/);
      });
      
      // C2 questions should be advanced
      c2Questions.forEach(question => {
        expect(question.id).toMatch(/en-cefr-c2-/);
      });
    });
  });

  describe('Question Quality', () => {
    it('should have explanations for most questions', () => {
      const allQuestions: any[] = [];
      
      getAvailableTracks().forEach(track => {
        getAvailableFrameworks(track).forEach(framework => {
          getAvailableLevels(track, framework).forEach(level => {
            allQuestions.push(...getQuestions(track, framework, level));
          });
        });
      });
      
      const questionsWithExplanations = allQuestions.filter(q => q.explanation && q.explanation.length > 0);
      const explanationRatio = questionsWithExplanations.length / allQuestions.length;
      
      // At least 80% of questions should have explanations
      expect(explanationRatio).toBeGreaterThan(0.8);
    });

    it('should have unique question IDs', () => {
      const allQuestions: any[] = [];
      
      getAvailableTracks().forEach(track => {
        getAvailableFrameworks(track).forEach(framework => {
          getAvailableLevels(track, framework).forEach(level => {
            allQuestions.push(...getQuestions(track, framework, level));
          });
        });
      });
      
      const ids = allQuestions.map(q => q.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have reasonable question distribution', () => {
      const stats = getQuestionBankStats();
      
      // Each track should have a reasonable number of questions
      Object.entries(stats.byTrack).forEach(([track, count]) => {
        expect(count).toBeGreaterThan(10); // At least 10 questions per track
      });
      
      // Each level should have some questions
      Object.entries(stats.byLevel).forEach(([track, frameworks]) => {
        Object.entries(frameworks).forEach(([framework, levels]) => {
          Object.entries(levels).forEach(([level, count]) => {
            expect(count).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have balanced question types across levels', () => {
      const stats = getQuestionBankStats();
      
      Object.entries(stats.byDifficulty).forEach(([track, frameworks]) => {
        Object.entries(frameworks).forEach(([framework, levels]) => {
          Object.entries(levels).forEach(([level, typeCounts]) => {
            // Each level should have at least some variety in question types
            const totalQuestions = typeCounts.mcq + typeCounts.typing + typeCounts.open;
            if (totalQuestions >= 5) {
              // For levels with enough questions, expect some variety
              const nonZeroTypes = [typeCounts.mcq, typeCounts.typing, typeCounts.open].filter(count => count > 0);
              expect(nonZeroTypes.length).toBeGreaterThan(1);
            }
          });
        });
      });
    });

    it('should have appropriate difficulty progression', () => {
      // English CEFR should progress from A1 to C2
      const cefr = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const cefrCounts = cefr.map(level => getQuestionCount('EN', 'CEFR', level));
      
      // Should have questions at each level
      cefrCounts.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
      
      // Japanese JLPT should progress from N5 to N1
      const jlpt = ['N5', 'N4', 'N3', 'N2', 'N1'];
      const jlptCounts = jlpt.map(level => getQuestionCount('JP', 'JLPT', level));
      
      // Should have questions at each level
      jlptCounts.forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should retrieve questions efficiently', () => {
      const startTime = Date.now();
      
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        getQuestions('EN', 'Classic', 'Beginner');
        getRandomQuestions('JP', 'JLPT', 'N5', 5);
        filterQuestionsByType('EN', 'CEFR', 'A1', 'mcq');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large filter operations efficiently', () => {
      const startTime = Date.now();
      
      const filter: QuestionFilter = {
        tracks: ['EN', 'JP'],
        types: ['mcq', 'typing', 'open'],
        maxQuestions: 100,
        includeExplanations: true
      };
      
      const results = getFilteredQuestions(filter);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should be fast
    });
  });
});