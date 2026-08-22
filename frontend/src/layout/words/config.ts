export const WORD_ITEMS = [
  { label: '首页', path: '/w/words' },
  { label: '集合', path: '/w/words/collections' },
  { label: '词库', path: '/w/words/vocabularies' },
  { label: '语法', path: '/w/words/grammars' },
  { label: '句子', path: '/w/words/sentences' },
  { label: '复习', path: '/w/words/review/errors' },
  { label: '管理', path: '/w/words/manage/tags' },
] as const;

export const MANAGEMENT_ITEMS = [
  { label: '标签', path: '/w/words/manage/tags' },
  { label: '词性', path: '/w/words/manage/parts-of-speech' },
  { label: '设置', path: '/w/words/manage/settings' },
] as const;
