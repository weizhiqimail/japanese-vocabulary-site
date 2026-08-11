import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 词汇模块只允许通过此白名单访问表名、字段名和排序字段。 */
export const VOCABULARY_RESOURCE = {
  alias: 'v',
  order: 'updated_at',
  search: ['word', 'reading', 'translation'],
  softDelete: true,
  table: 'vocabularies',
  writable: ['word', 'reading', 'translation', 'notes'],
} as const satisfies ResourceDefinition;

export const VOCABULARY_RESOURCE_NAME = 'vocabularies';
