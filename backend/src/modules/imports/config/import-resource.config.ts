import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 导入审核查询白名单；审核项不能通过通用 CRUD 修改。 */
export const IMPORT_RESOURCE = {
  alias: 'i',
  order: 'created_at',
  search: ['word', 'reading', 'translation'],
  softDelete: false,
  table: 'import_candidates',
  writable: [],
} as const satisfies ResourceDefinition;

export const IMPORT_RESOURCE_NAME = 'imports';
