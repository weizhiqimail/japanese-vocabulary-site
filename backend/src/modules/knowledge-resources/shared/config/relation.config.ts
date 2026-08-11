/** 允许创建的跨知识对象关系，表名和列名全部由服务端白名单控制。 */
export const KNOWLEDGE_RELATIONS = {
  'grammars:sentences': {
    sourceColumn: 'grammar_id',
    table: 'grammar_sentences',
    targetColumn: 'sentence_id',
  },
  'grammars:vocabularies': {
    sourceColumn: 'grammar_id',
    table: 'vocabulary_grammars',
    targetColumn: 'vocabulary_id',
  },
  'sentences:grammars': {
    sourceColumn: 'sentence_id',
    table: 'grammar_sentences',
    targetColumn: 'grammar_id',
  },
  'sentences:vocabularies': {
    sourceColumn: 'sentence_id',
    table: 'vocabulary_sentences',
    targetColumn: 'vocabulary_id',
  },
  'vocabularies:grammars': {
    sourceColumn: 'vocabulary_id',
    table: 'vocabulary_grammars',
    targetColumn: 'grammar_id',
  },
  'vocabularies:sentences': {
    sourceColumn: 'vocabulary_id',
    table: 'vocabulary_sentences',
    targetColumn: 'sentence_id',
  },
} as const;

/** 带标签知识对象对应的中间表。 */
export const TAG_RELATIONS = {
  grammars: ['grammar_tags', 'grammar_id'],
  sentences: ['sentence_tags', 'sentence_id'],
  vocabularies: ['vocabulary_tags', 'vocabulary_id'],
} as const;

/** 详情页需要加载的只读关系。 */
export const DETAIL_RELATIONS = {
  grammars: {
    sentences: {
      alias: 's',
      joinTable: 'grammar_sentences',
      softDelete: true,
      sourceColumn: 'grammar_id',
      targetColumn: 'sentence_id',
      targetTable: 'sentences',
    },
    tags: {
      alias: 't',
      joinTable: 'grammar_tags',
      softDelete: true,
      sourceColumn: 'grammar_id',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
    vocabularies: {
      alias: 'v',
      joinTable: 'vocabulary_grammars',
      softDelete: true,
      sourceColumn: 'grammar_id',
      targetColumn: 'vocabulary_id',
      targetTable: 'vocabularies',
    },
  },
  sentences: {
    grammars: {
      alias: 'g',
      joinTable: 'grammar_sentences',
      softDelete: true,
      sourceColumn: 'sentence_id',
      targetColumn: 'grammar_id',
      targetTable: 'grammars',
    },
    tags: {
      alias: 't',
      joinTable: 'sentence_tags',
      softDelete: true,
      sourceColumn: 'sentence_id',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
    vocabularies: {
      alias: 'v',
      joinTable: 'vocabulary_sentences',
      softDelete: true,
      sourceColumn: 'sentence_id',
      targetColumn: 'vocabulary_id',
      targetTable: 'vocabularies',
    },
  },
  vocabularies: {
    collections: {
      alias: 'c',
      joinTable: 'collection_vocabularies',
      softDelete: true,
      sourceColumn: 'vocabulary_id',
      targetColumn: 'collection_id',
      targetTable: 'collections',
    },
    grammars: {
      alias: 'g',
      joinTable: 'vocabulary_grammars',
      softDelete: true,
      sourceColumn: 'vocabulary_id',
      targetColumn: 'grammar_id',
      targetTable: 'grammars',
    },
    partsOfSpeech: {
      alias: 'p',
      joinTable: 'vocabulary_parts_of_speech',
      softDelete: false,
      sourceColumn: 'vocabulary_id',
      targetColumn: 'part_of_speech_id',
      targetTable: 'parts_of_speech',
    },
    sentences: {
      alias: 's',
      joinTable: 'vocabulary_sentences',
      softDelete: true,
      sourceColumn: 'vocabulary_id',
      targetColumn: 'sentence_id',
      targetTable: 'sentences',
    },
    tags: {
      alias: 't',
      joinTable: 'vocabulary_tags',
      softDelete: true,
      sourceColumn: 'vocabulary_id',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
  },
} as const;

/** 保存表单元数据时，字段名到关系表的固定映射。 */
export const METADATA_RELATIONS = {
  grammars: {
    sentenceIds: {
      ownerColumn: 'grammar_id',
      softDelete: true,
      table: 'grammar_sentences',
      targetColumn: 'sentence_id',
      targetTable: 'sentences',
    },
    tagIds: {
      ownerColumn: 'grammar_id',
      softDelete: true,
      table: 'grammar_tags',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
    vocabularyIds: {
      ownerColumn: 'grammar_id',
      softDelete: true,
      table: 'vocabulary_grammars',
      targetColumn: 'vocabulary_id',
      targetTable: 'vocabularies',
    },
  },
  sentences: {
    grammarIds: {
      ownerColumn: 'sentence_id',
      softDelete: true,
      table: 'grammar_sentences',
      targetColumn: 'grammar_id',
      targetTable: 'grammars',
    },
    tagIds: {
      ownerColumn: 'sentence_id',
      softDelete: true,
      table: 'sentence_tags',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
    vocabularyIds: {
      ownerColumn: 'sentence_id',
      softDelete: true,
      table: 'vocabulary_sentences',
      targetColumn: 'vocabulary_id',
      targetTable: 'vocabularies',
    },
  },
  vocabularies: {
    collectionIds: {
      ownerColumn: 'vocabulary_id',
      softDelete: true,
      table: 'collection_vocabularies',
      targetColumn: 'collection_id',
      targetTable: 'collections',
    },
    posIds: {
      ownerColumn: 'vocabulary_id',
      softDelete: false,
      table: 'vocabulary_parts_of_speech',
      targetColumn: 'part_of_speech_id',
      targetTable: 'parts_of_speech',
    },
    grammarIds: {
      ownerColumn: 'vocabulary_id',
      softDelete: true,
      table: 'vocabulary_grammars',
      targetColumn: 'grammar_id',
      targetTable: 'grammars',
    },
    sentenceIds: {
      ownerColumn: 'vocabulary_id',
      softDelete: true,
      table: 'vocabulary_sentences',
      targetColumn: 'sentence_id',
      targetTable: 'sentences',
    },
    tagIds: {
      ownerColumn: 'vocabulary_id',
      softDelete: true,
      table: 'vocabulary_tags',
      targetColumn: 'tag_id',
      targetTable: 'tags',
    },
  },
} as const;
