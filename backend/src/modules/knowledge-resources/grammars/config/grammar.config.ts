import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 语法模块数据库访问白名单。 */
export const GRAMMAR_RESOURCE = {
  alias: 'g',
  order: 'updated_at',
  search: ['pattern', 'reading', 'meaning'],
  softDelete: true,
  table: 'grammars',
  writable: ['pattern', 'reading', 'meaning', 'notes'],
} as const satisfies ResourceDefinition;

export const GRAMMAR_RESOURCE_NAME = 'grammars';
