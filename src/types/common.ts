export interface IGraphQLQuery {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IFieldError {
  [field: string]: string;
}
