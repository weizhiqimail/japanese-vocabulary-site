import type { ResourceDefinition } from '@/modules/knowledge-resources/shared/config/resource-definition.types';

/** 标签背景只允许使用这组浅色，搭配深色文字保证可读性。 */
export const TAG_COLORS = [
  '#FDE68A',
  '#FDBA74',
  '#FCA5A5',
  '#F9A8D4',
  '#C4B5FD',
  '#93C5FD',
  '#67E8F9',
  '#6EE7B7',
  '#BEF264',
  '#D1D5DB',
] as const;

export const TAG_COLOR_VALUES: readonly string[] = TAG_COLORS;

/** 标签模块数据库访问白名单。 */
export const TAG_RESOURCE = {
  alias: 't',
  order: 'updated_at',
  search: ['name'],
  softDelete: true,
  table: 'tags',
  writable: ['name', 'color', 'enabled'],
} as const satisfies ResourceDefinition;

export const TAG_RESOURCE_NAME = 'tags';
