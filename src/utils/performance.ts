// Performance Utilities for Saku Dojo v2
// Memoization, caching, and performance monitoring

/**
 * Simple memoization function
 * @param fn Function to memoize
 * @returns Memoized function
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * LRU Cache implementation
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();

  start(): void {
    this.startTime = performance.now();
  }

  mark(name: string): void {
    this.marks.set(name, performance.now() - this.startTime);
  }

  getMark(name: string): number | undefined {
    return this.marks.get(name);
  }

  getElapsed(): number {
    return performance.now() - this.startTime;
  }

  reset(): void {
    this.startTime = 0;
    this.marks.clear();
  }
}

/**
 * Batch operations to reduce DOM updates
 * @param operations Array of functions to execute
 */
export const batchOperations = (operations: (() => void)[]): void => {
  requestAnimationFrame(() => {
    operations.forEach(op => op());
  });
};

/**
 * Lazy loading utility
 * @param loader Function that returns a promise
 * @returns Function that loads and caches the result
 */
export const createLazyLoader = <T>(loader: () => Promise<T>) => {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cached) return cached;
    if (loading) return loading;

    loading = loader();
    cached = await loading;
    loading = null;
    return cached;
  };
};