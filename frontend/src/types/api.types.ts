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
export interface User {
  id: string;
  username: string;
  displayName: string;
}
