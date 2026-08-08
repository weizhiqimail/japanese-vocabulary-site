export const COLLECTIONS_RESOURCE = "collections";
export const VOCABULARIES_RESOURCE = "vocabularies";
export const GRAMMARS_RESOURCE = "grammars";
export const SENTENCES_RESOURCE = "sentences";
export const TAGS_RESOURCE = "tags";
export const PARTS_OF_SPEECH_RESOURCE = "parts-of-speech";
export const IMPORTS_RESOURCE = "imports";
export const KNOWLEDGE_RESOURCES = [
  VOCABULARIES_RESOURCE,
  GRAMMARS_RESOURCE,
  SENTENCES_RESOURCE,
] as const;
