import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 句子模块数据库访问白名单。 */
export const SENTENCE_RESOURCE = {
  alias: 's',
  order: 'updated_at',
  search: ['japanese', 'reading', 'translation'],
  softDelete: true,
  table: 'sentences',
  writable: ['japanese', 'reading', 'translation', 'notes'],
} as const satisfies ResourceDefinition;

export const SENTENCE_RESOURCE_NAME = 'sentences';
