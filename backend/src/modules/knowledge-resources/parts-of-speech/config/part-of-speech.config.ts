import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 词性模块数据库访问白名单。 */
export const PART_OF_SPEECH_RESOURCE = {
  alias: 'p',
  order: 'sort_order',
  orderDirection: 'ASC',
  search: ['code', 'name'],
  softDelete: false,
  table: 'parts_of_speech',
  writable: ['code', 'name', 'sort_order', 'enabled'],
} as const satisfies ResourceDefinition;

export const PART_OF_SPEECH_RESOURCE_NAME = 'parts-of-speech';
