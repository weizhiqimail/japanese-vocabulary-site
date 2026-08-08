export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
}

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  q?: string;
}
