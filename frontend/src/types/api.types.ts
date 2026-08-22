export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
export interface Pagination {
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export type ResourceItem = Record<string, unknown> & { id: string | number };

export interface ListQuery {
  pageNum?: number;
  pageSize?: number;
  q?: string;
  tagId?: number;
  type?: string;
}

export type KnowledgeResource = 'vocabularies' | 'grammars' | 'sentences';

export interface RelationPayload {
  targetId: number;
  targetResource: KnowledgeResource;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
}
