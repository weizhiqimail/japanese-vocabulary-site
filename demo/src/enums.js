export const PART_OF_SPEECH = Object.freeze({
  NOUN: '名词',
  PROPER_NOUN: '专有名词',
  PRONOUN: '代词',
  NUMERAL: '数词',
  INTRANSITIVE_VERB: '自動詞',
  TRANSITIVE_VERB: '他動詞',
  SAHEN_VERB: 'サ变动词',
  I_ADJECTIVE: 'い形容词',
  NA_ADJECTIVE: 'な形容词',
  ADVERB: '副词',
  ADNOMINAL: '连体词',
  CONJUNCTION: '接续词',
  PARTICLE: '助词',
  AUXILIARY: '助动词',
  INTERJECTION: '感叹词',
  IDIOM: '惯用语',
  FIXED_EXPRESSION: '固定表达',
  OTHER: '其他',
});

export const VOCABULARY_TAG = Object.freeze({
  ONOMATOPOEIA: '拟声词',
  MIMETIC: '拟态词',
  WRITTEN: '书面语',
  SPOKEN: '口语',
  HONORIFIC: '敬语',
  CONFUSABLE: '易混淆',
  BUSINESS: '商务',
  LOANWORD: '外来语',
});

export const CONTENT_TYPE = Object.freeze({
  VOCABULARY: '词汇',
  COLLOCATION: '搭配',
  SENTENCE: '句子',
  GRAMMAR: '语法',
});

export const REVIEW_STATUS = Object.freeze({
  PENDING: '待审核',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  SKIPPED: '无需导入',
});

export const DUPLICATE_STATUS = Object.freeze({
  UNIQUE: '不重复',
  POSSIBLE: '疑似重复',
  EXISTS: '正式库已存在',
});

export const DISPLAY_FIELD = Object.freeze({
  WORD: 'word',
  READING: 'reading',
  TRANSLATION: 'translation',
  MEMORY: 'memory',
});

export const PAGE_SIZE_OPTIONS = Object.freeze([10, 20, 30, 50, 100]);
export const PART_OF_SPEECH_OPTIONS = Object.freeze(Object.values(PART_OF_SPEECH));
export const VOCABULARY_TAG_OPTIONS = Object.freeze(Object.values(VOCABULARY_TAG));
