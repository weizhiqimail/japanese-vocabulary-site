import {
  CollectionEntity,
  GrammarEntity,
  ImportCandidateEntity,
  PartOfSpeechEntity,
  SentenceEntity,
  TagEntity,
  VocabularyEntity,
} from '@/entities';

export const RESOURCE_CONFIG = {
  vocabularies: {
    entity: VocabularyEntity,
    table: 'vocabularies',
    alias: 'v',
    search: ['word', 'reading', 'translation'],
    writable: ['word', 'reading', 'translation', 'notes'],
    softDelete: true,
    order: 'updated_at',
  },
  collections: {
    entity: CollectionEntity,
    table: 'collections',
    alias: 'c',
    search: ['name', 'description', 'source'],
    writable: ['name', 'type', 'source', 'description', 'is_default'],
    softDelete: true,
    order: 'updated_at',
  },
  grammars: {
    entity: GrammarEntity,
    table: 'grammars',
    alias: 'g',
    search: ['pattern', 'reading', 'meaning'],
    writable: ['pattern', 'reading', 'meaning', 'notes'],
    softDelete: true,
    order: 'updated_at',
  },
  sentences: {
    entity: SentenceEntity,
    table: 'sentences',
    alias: 's',
    search: ['japanese', 'reading', 'translation'],
    writable: ['japanese', 'reading', 'translation', 'notes'],
    softDelete: true,
    order: 'updated_at',
  },
  tags: {
    entity: TagEntity,
    table: 'tags',
    alias: 't',
    search: ['name'],
    writable: ['name', 'color', 'enabled'],
    softDelete: true,
    order: 'updated_at',
  },
  'parts-of-speech': {
    entity: PartOfSpeechEntity,
    table: 'parts_of_speech',
    alias: 'p',
    search: ['code', 'name'],
    writable: ['name', 'sort_order', 'enabled'],
    softDelete: false,
    order: 'sort_order',
  },
  imports: {
    entity: ImportCandidateEntity,
    table: 'import_candidates',
    alias: 'i',
    search: ['word', 'reading', 'translation'],
    writable: [],
    softDelete: false,
    order: 'created_at',
  },
} as const;
export type ResourceName = keyof typeof RESOURCE_CONFIG;
export const RESOURCE_PATHS = Object.keys(RESOURCE_CONFIG) as ResourceName[];
export function isResourceName(value: string): value is ResourceName {
  return value in RESOURCE_CONFIG;
}
