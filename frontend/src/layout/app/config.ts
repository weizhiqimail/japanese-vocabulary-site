export const NAV_ITEMS = [
  { label: "单词", path: "/words" },
  { label: "题库", path: "/questions" },
] as const;

export const WORD_ITEMS = [
  { label: "首页", path: "/words" },
  { label: "集合", path: "/words/collections" },
  { label: "词库", path: "/words/vocabularies" },
  { label: "语法", path: "/words/grammars" },
  { label: "句子", path: "/words/sentences" },
  { label: "复习", path: "/words/review/errors" },
  { label: "管理", path: "/words/manage/tags" },
] as const;

export const MANAGEMENT_ITEMS = [
  { label: "标签", path: "/words/manage/words/tags" },
  { label: "词性", path: "/words/manage/words/parts-of-speech" },
  { label: "设置", path: "/words/manage/words/settings" },
] as const;
