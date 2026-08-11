export interface ResourceDefinition {
  alias: string;
  order: string;
  orderDirection?: 'ASC' | 'DESC';
  search: readonly string[];
  softDelete: boolean;
  table: string;
  writable: readonly string[];
}
