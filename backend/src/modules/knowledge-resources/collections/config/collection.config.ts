import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 集合模块数据库访问白名单。 */
export const COLLECTION_RESOURCE = {
  alias: 'c',
  order: 'updated_at',
  search: ['name', 'description', 'source'],
  softDelete: true,
  table: 'collections',
  writable: ['name', 'type', 'source', 'description', 'is_default'],
} as const satisfies ResourceDefinition;

export const COLLECTION_RESOURCE_NAME = 'collections';
