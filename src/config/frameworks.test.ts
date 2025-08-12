// Unit Tests for Framework Configuration
import { describe, it, expect } from 'vitest';
import {
  FRAMEWORK_LEVELS,
  TRACK_FRAMEWORKS,
  getFrameworkLevels,
  getTrackFrameworks,
  isValidFrameworkForTrack,
  isValidLevelForFramework,
  getDefaultLevel,
  getDefaultFramework,
  getNextLevel,
  getPreviousLevel,
} from './frameworks';

describe('Framework Configuration', () => {
  describe('FRAMEWORK_LEVELS', () => {
    it('should have correct Classic levels', () => {
      expect(FRAMEWORK_LEVELS.Classic).toEqual(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
    });

    it('should have correct CEFR levels', () => {
      expect(FRAMEWORK_LEVELS.CEFR).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    });

    it('should have correct JLPT levels', () => {
      expect(FRAMEWORK_LEVELS.JLPT).toEqual(['N5', 'N4', 'N3', 'N2', 'N1']);
    });
  });

  describe('TRACK_FRAMEWORKS', () => {
    it('should have correct EN frameworks', () => {
      expect(TRACK_FRAMEWORKS.EN).toEqual(['Classic', 'CEFR']);
    });

    it('should have correct JP frameworks', () => {
      expect(TRACK_FRAMEWORKS.JP).toEqual(['Classic', 'JLPT']);
    });
  });

  describe('getFrameworkLevels', () => {
    it('should return correct levels for valid frameworks', () => {
      expect(getFrameworkLevels('Classic')).toEqual(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
      expect(getFrameworkLevels('CEFR')).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
      expect(getFrameworkLevels('JLPT')).toEqual(['N5', 'N4', 'N3', 'N2', 'N1']);
    });

    it('should return empty array for invalid framework', () => {
      expect(getFrameworkLevels('Invalid' as any)).toEqual([]);
    });
  });

  describe('getTrackFrameworks', () => {
    it('should return correct frameworks for valid tracks', () => {
      expect(getTrackFrameworks('EN')).toEqual(['Classic', 'CEFR']);
      expect(getTrackFrameworks('JP')).toEqual(['Classic', 'JLPT']);
    });

    it('should return empty array for invalid track', () => {
      expect(getTrackFrameworks('Invalid' as any)).toEqual([]);
    });
  });

  describe('isValidFrameworkForTrack', () => {
    it('should validate EN frameworks correctly', () => {
      expect(isValidFrameworkForTrack('EN', 'Classic')).toBe(true);
      expect(isValidFrameworkForTrack('EN', 'CEFR')).toBe(true);
      expect(isValidFrameworkForTrack('EN', 'JLPT')).toBe(false);
    });

    it('should validate JP frameworks correctly', () => {
      expect(isValidFrameworkForTrack('JP', 'Classic')).toBe(true);
      expect(isValidFrameworkForTrack('JP', 'JLPT')).toBe(true);
      expect(isValidFrameworkForTrack('JP', 'CEFR')).toBe(false);
    });
  });

  describe('isValidLevelForFramework', () => {
    it('should validate Classic levels correctly', () => {
      expect(isValidLevelForFramework('Classic', 'Beginner')).toBe(true);
      expect(isValidLevelForFramework('Classic', 'Expert')).toBe(true);
      expect(isValidLevelForFramework('Classic', 'A1')).toBe(false);
    });

    it('should validate CEFR levels correctly', () => {
      expect(isValidLevelForFramework('CEFR', 'A1')).toBe(true);
      expect(isValidLevelForFramework('CEFR', 'C2')).toBe(true);
      expect(isValidLevelForFramework('CEFR', 'N5')).toBe(false);
    });

    it('should validate JLPT levels correctly', () => {
      expect(isValidLevelForFramework('JLPT', 'N5')).toBe(true);
      expect(isValidLevelForFramework('JLPT', 'N1')).toBe(true);
      expect(isValidLevelForFramework('JLPT', 'Beginner')).toBe(false);
    });
  });

  describe('getDefaultLevel', () => {
    it('should return first level for valid frameworks', () => {
      expect(getDefaultLevel('Classic')).toBe('Beginner');
      expect(getDefaultLevel('CEFR')).toBe('A1');
      expect(getDefaultLevel('JLPT')).toBe('N5');
    });

    it('should handle invalid framework gracefully', () => {
      // Since we removed the fallback, this will throw an error
      expect(() => getDefaultLevel('Invalid' as any)).toThrow();
    });
  });

  describe('getDefaultFramework', () => {
    it('should return first framework for valid tracks', () => {
      expect(getDefaultFramework('EN')).toBe('Classic');
      expect(getDefaultFramework('JP')).toBe('Classic');
    });

    it('should return Classic for invalid track', () => {
      expect(getDefaultFramework('Invalid' as any)).toBe('Classic');
    });
  });

  describe('getNextLevel', () => {
    it('should return next level in sequence', () => {
      expect(getNextLevel('Classic', 'Beginner')).toBe('Intermediate');
      expect(getNextLevel('CEFR', 'A1')).toBe('A2');
      expect(getNextLevel('JLPT', 'N5')).toBe('N4');
    });

    it('should return same level if at end', () => {
      expect(getNextLevel('Classic', 'Expert')).toBe('Expert');
      expect(getNextLevel('CEFR', 'C2')).toBe('C2');
      expect(getNextLevel('JLPT', 'N1')).toBe('N1');
    });

    it('should return current level for invalid level', () => {
      expect(getNextLevel('Classic', 'Invalid')).toBe('Invalid');
    });
  });

  describe('getPreviousLevel', () => {
    it('should return previous level in sequence', () => {
      expect(getPreviousLevel('Classic', 'Intermediate')).toBe('Beginner');
      expect(getPreviousLevel('CEFR', 'A2')).toBe('A1');
      expect(getPreviousLevel('JLPT', 'N4')).toBe('N5');
    });

    it('should return same level if at beginning', () => {
      expect(getPreviousLevel('Classic', 'Beginner')).toBe('Beginner');
      expect(getPreviousLevel('CEFR', 'A1')).toBe('A1');
      expect(getPreviousLevel('JLPT', 'N5')).toBe('N5');
    });

    it('should return current level for invalid level', () => {
      expect(getPreviousLevel('Classic', 'Invalid')).toBe('Invalid');
    });
  });
});