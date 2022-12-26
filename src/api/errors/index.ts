/* eslint-disable max-classes-per-file */
import i18n from '../../i18n';

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
    const defaultMessage = message || i18n.t(`notification.error.APIError.message`);
    const defaultTitle = title || i18n.t(`notification.error.APIError.title`, { statusCode });
    super(defaultMessage, defaultTitle);
    this.statusCode = statusCode;
  }
}

class UnhandledError extends BaseError {
  originalError: unknown;

  constructor(originalError: unknown, message?: string, title?: string) {
    const defaultMessage = message || i18n.t(`notification.error.UnhandledError.message`);
    const defaultTitle = title || i18n.t(`notification.error.UnhandledError.title`);
    super(defaultMessage, defaultTitle);
    this.originalError = originalError;
    if (originalError instanceof Error) {
      this.stack = originalError.stack || this.stack;
    }
  }
}

export { BaseError, APIError, UnhandledError };
