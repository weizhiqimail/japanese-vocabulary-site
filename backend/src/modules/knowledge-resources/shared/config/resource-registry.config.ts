import {
  COLLECTION_RESOURCE,
  COLLECTION_RESOURCE_NAME,
} from '@/modules/knowledge-resources/collections/config/collection.config';
import {
  GRAMMAR_RESOURCE,
  GRAMMAR_RESOURCE_NAME,
} from '@/modules/knowledge-resources/grammars/config/grammar.config';
import {
  PART_OF_SPEECH_RESOURCE,
  PART_OF_SPEECH_RESOURCE_NAME,
} from '@/modules/knowledge-resources/parts-of-speech/config/part-of-speech.config';
import {
  SENTENCE_RESOURCE,
  SENTENCE_RESOURCE_NAME,
} from '@/modules/knowledge-resources/sentences/config/sentence.config';
import {
  TAG_RESOURCE,
  TAG_RESOURCE_NAME,
} from '@/modules/knowledge-resources/tags/config/tag.config';
import {
  VOCABULARY_RESOURCE,
  VOCABULARY_RESOURCE_NAME,
} from '@/modules/knowledge-resources/vocabularies/config/vocabulary.config';
import {
  IMPORT_RESOURCE,
  IMPORT_RESOURCE_NAME,
} from '@/modules/imports/config/import-resource.config';

/** 汇总独立子模块配置，仅供共享 CRUD 基础层按固定名称查找。 */
export const RESOURCE_REGISTRY = {
  [COLLECTION_RESOURCE_NAME]: COLLECTION_RESOURCE,
  [GRAMMAR_RESOURCE_NAME]: GRAMMAR_RESOURCE,
  [IMPORT_RESOURCE_NAME]: IMPORT_RESOURCE,
  [PART_OF_SPEECH_RESOURCE_NAME]: PART_OF_SPEECH_RESOURCE,
  [SENTENCE_RESOURCE_NAME]: SENTENCE_RESOURCE,
  [TAG_RESOURCE_NAME]: TAG_RESOURCE,
  [VOCABULARY_RESOURCE_NAME]: VOCABULARY_RESOURCE,
} as const;

export type ResourceName = keyof typeof RESOURCE_REGISTRY;

export function isResourceName(value: string): value is ResourceName {
  return value in RESOURCE_REGISTRY;
}
