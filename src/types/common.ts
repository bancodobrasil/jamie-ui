export enum EnumInputAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum FormAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export type GraphQLData<T> = T & { __typename: string };

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}
