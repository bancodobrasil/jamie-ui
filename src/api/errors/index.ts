/* eslint-disable max-classes-per-file */

class BaseError extends Error {
  title: string;

  constructor(message: string, title: string) {
    super(message);
    this.title = title;
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class APIError extends BaseError {
  statusCode: number;

  constructor(statusCode: number, message?: string, title?: string) {
    super(message, title);
    this.statusCode = statusCode;
  }
}

class UnhandledError extends BaseError {
  originalError: unknown;

  constructor(originalError: unknown, message?: string, title?: string) {
    super(message, title);
    this.originalError = originalError;
    if (originalError instanceof Error) {
      this.stack = originalError.stack || this.stack;
    }
  }
}

export { BaseError, APIError, UnhandledError };
