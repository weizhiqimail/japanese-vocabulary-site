export interface PaginationState {
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface ToastMessage {
  id: number;
  text: string;
  danger?: boolean;
}

export type ApiEntity = Record<string, unknown> & { id?: number };
