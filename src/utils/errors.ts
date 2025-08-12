// Error Handling Utilities for Saku Dojo v2
// Custom error types and error handling functions

/**
 * Custom error types for better error handling
 */
export class SakuDojoError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any> | undefined;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'SakuDojoError';
    this.code = code;
    this.context = context;
  }
}

export class ValidationError extends SakuDojoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class StorageError extends SakuDojoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

export class SessionError extends SakuDojoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SESSION_ERROR', context);
    this.name = 'SessionError';
  }
}

export class NetworkError extends SakuDojoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error, context?: Record<string, any>) => void;

/**
 * Default error handler
 * @param error Error to handle
 * @param context Additional context
 */
export const defaultErrorHandler: ErrorHandler = (error, context) => {
  console.error('Saku Dojo Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  });
};

/**
 * Safe async function wrapper
 * @param fn Async function to wrap
 * @param errorHandler Error handler function
 * @returns Wrapped function that handles errors
 */
export const safeAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: ErrorHandler = defaultErrorHandler
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler(error as Error, { function: fn.name, args });
      throw error;
    }
  }) as T;
};

/**
 * Safe sync function wrapper
 * @param fn Function to wrap
 * @param errorHandler Error handler function
 * @returns Wrapped function that handles errors
 */
export const safeSync = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler: ErrorHandler = defaultErrorHandler
): T => {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error as Error, { function: fn.name, args });
      throw error;
    }
  }) as T;
};

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create a success result
 * @param data Success data
 * @returns Success result
 */
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data
});

/**
 * Create an error result
 * @param error Error
 * @returns Error result
 */
export const failure = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error
});

/**
 * Try-catch wrapper that returns Result type
 * @param fn Function to execute
 * @returns Result with success/error
 */
export const trySync = <T>(fn: () => T): Result<T> => {
  try {
    return success(fn());
  } catch (error) {
    return failure(error as Error);
  }
};

/**
 * Async try-catch wrapper that returns Result type
 * @param fn Async function to execute
 * @returns Promise of Result with success/error
 */
export const tryAsync = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(error as Error);
  }
};