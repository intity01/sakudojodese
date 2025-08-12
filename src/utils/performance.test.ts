// Unit Tests for Performance Utilities
import { describe, it, expect, vi } from 'vitest';
import { memoize, LRUCache, PerformanceTimer } from './performance';

describe('Performance Utilities', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(10)).toBe(20);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('LRUCache', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
    });

    it('should evict least recently used items', () => {
      const cache = new LRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should update access order', () => {
      const cache = new LRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // Access 'a' to make it recently used
      cache.set('c', 3); // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });
  });

  describe('PerformanceTimer', () => {
    it('should track elapsed time', () => {
      const mockNow = vi.spyOn(performance, 'now');
      mockNow.mockReturnValue(0);
      
      const timer = new PerformanceTimer();
      timer.start();
      
      mockNow.mockReturnValue(100);
      expect(timer.getElapsed()).toBe(100);
      
      mockNow.mockRestore();
    });

    it('should create marks', () => {
      const mockNow = vi.spyOn(performance, 'now');
      mockNow.mockReturnValue(0);
      
      const timer = new PerformanceTimer();
      timer.start();
      
      mockNow.mockReturnValue(50);
      timer.mark('test');
      expect(timer.getMark('test')).toBe(50);
      
      mockNow.mockRestore();
    });
  });
});