/* eslint-disable max-classes-per-file */
import { GraphQLError } from 'graphql';
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

class GraphQLClientError extends BaseError {
  constructor(error: GraphQLError) {
    let message = i18n.t(`notification.error.UnhandledError.message`);
    let title = i18n.t(`notification.error.UnhandledError.title`);
    if (error.extensions?.code) {
      if (error.extensions.code === 'ENTITY_NOT_FOUND') {
        const { id } = error.extensions;
        let entity = i18n.t('common.entity');
        switch (error.extensions.entity) {
          case 'Menu':
            entity = i18n.t('menu.title', { count: 1 });
            break;
          case 'MenuItem':
            entity = i18n.t('menuItem.title', { count: 1 });
            break;
          case 'MenuRevision':
            entity = i18n.t('menuRevision.title', { count: 1 });
            break;
        }
        message = i18n.t('notification.error.GraphQLClientError.code.ENTITY_NOT_FOUND.message', {
          id,
          entity,
        });
        title = i18n.t('notification.error.GraphQLClientError.code.ENTITY_NOT_FOUND.title', {
          id,
          entity,
        });
      } else {
        message = i18n.t(
          [
            `notification.error.GraphQLClientError.code.${error.extensions.code}.message`,
            'notification.error.GraphQLClientError.code.UNKNOWN.message',
          ],
          { code: error.extensions.code },
        );
        title = i18n.t(
          [
            `notification.error.GraphQLClientError.code.${error.extensions.code}.title`,
            'notification.error.GraphQLClientError.code.UNKNOWN.title',
          ],
          { code: error.extensions.code },
        );
      }
    }
    super(message, title);
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

export { BaseError, APIError, GraphQLClientError, UnhandledError };
