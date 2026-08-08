export enum ResourceKey {
  COLLECTIONS = "collections",
  VOCABULARIES = "vocabularies",
  GRAMMARS = "grammars",
  SENTENCES = "sentences",
  TAGS = "tags",
  PARTS_OF_SPEECH = "parts-of-speech",
  IMPORTS = "imports",
}

export enum DetailRelationKey {
  VOCABULARIES = "vocabularies",
  GRAMMARS = "grammars",
  SENTENCES = "sentences",
  RELATIONS = "relations",
}

export const RESOURCE_PATHS: Record<ResourceKey, string> = {
  [ResourceKey.COLLECTIONS]: "/api/collections",
  [ResourceKey.VOCABULARIES]: "/api/vocabularies",
  [ResourceKey.GRAMMARS]: "/api/grammars",
  [ResourceKey.SENTENCES]: "/api/sentences",
  [ResourceKey.TAGS]: "/api/tags",
  [ResourceKey.PARTS_OF_SPEECH]: "/api/parts-of-speech",
  [ResourceKey.IMPORTS]: "/api/imports",
};

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const KNOWLEDGE_RESOURCES: ResourceKey[] = [
  ResourceKey.VOCABULARIES,
  ResourceKey.GRAMMARS,
  ResourceKey.SENTENCES,
];
