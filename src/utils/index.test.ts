// Unit Tests for Utility Functions
import { describe, it, expect } from 'vitest';
import {
  uid,
  normalize,
  shuffle,
  calculateScore,
  clamp,
  secureUid,
  safeJsonParse,
  isEmpty,
  truncate,
  toTitleCase,
  formatDate,
  deepClone,
  getCurrentDate,
  sanitizeHtml,
  isValidEmail,
  debounce,
  throttle
} from './index';

describe('Utility Functions', () => {
  describe('uid', () => {
    it('should generate a string of length 8', () => {
      const id = uid();
      expect(id).toHaveLength(8);
    });

    it('should generate unique IDs', () => {
      const id1 = uid();
      const id2 = uid();
      expect(id1).not.toBe(id2);
    });

    it('should only contain alphanumeric characters', () => {
      const id = uid();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('normalize', () => {
    it('should convert to lowercase', () => {
      expect(normalize('HELLO')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalize('  hello  ')).toBe('hello');
    });

    it('should replace full-width spaces', () => {
      expect(normalize('hello　world')).toBe('hello world');
    });

    it('should normalize quotes', () => {
      expect(normalize("hello'world")).toBe("hello'world");
      expect(normalize("hello'world")).toBe("hello'world");
      expect(normalize("hello`world")).toBe("hello'world");
    });

    it('should handle empty strings', () => {
      expect(normalize('')).toBe('');
      expect(normalize(null as any)).toBe('');
      expect(normalize(undefined as any)).toBe('');
    });

    it('should normalize Unicode characters', () => {
      expect(normalize('café')).toBe('café');
    });
  });

  describe('shuffle', () => {
    it('should return array of same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(arr.length);
    });

    it('should contain same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });

    it('should handle empty arrays', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('should handle single element arrays', () => {
      expect(shuffle([1])).toEqual([1]);
    });
  });

  describe('calculateScore', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateScore(8, 10)).toBe(80);
      expect(calculateScore(3, 4)).toBe(75);
      expect(calculateScore(1, 3)).toBe(33);
    });

    it('should handle perfect scores', () => {
      expect(calculateScore(10, 10)).toBe(100);
    });

    it('should handle zero scores', () => {
      expect(calculateScore(0, 10)).toBe(0);
    });

    it('should handle zero total', () => {
      expect(calculateScore(5, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateScore(1, 3)).toBe(33); // 33.33... -> 33
      expect(calculateScore(2, 3)).toBe(67); // 66.66... -> 67
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should work with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(5, -10, -1)).toBe(-1);
    });
  });

  describe('secureUid', () => {
    it('should generate a string', () => {
      const id = secureUid();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = secureUid();
      const id2 = secureUid();
      expect(id1).not.toBe(id2);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"test": true}', {});
      expect(result).toEqual({ test: true });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' hello ')).toBe(false);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('formatDate', () => {
    it('should format date strings', () => {
      const date = '2024-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('should format Date objects', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should handle arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });

    it('should handle primitives', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(null)).toBe(null);
    });

    it('should handle dates', () => {
      const date = new Date('2024-01-15');
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('getCurrentDate', () => {
    it('should return ISO string', () => {
      const date = getCurrentDate();
      expect(typeof date).toBe('string');
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const html = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeHtml(html);
      expect(sanitized).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;Hello');
    });

    it('should handle plain text', () => {
      const text = 'Hello World';
      const sanitized = sanitizeHtml(text);
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(callCount).toBe(1);

      // Wait for throttle delay
      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn();
      expect(callCount).toBe(2);
    });
  });
});