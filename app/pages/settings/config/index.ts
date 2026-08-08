import { ResourceKey } from "../../../config/resources";
export const PAGINATION_SETTING_KEY = "pagination_defaults";
export const TEST_SETTING_KEY = "test_defaults";
export const PAGINATION_ITEMS = [
  { key: ResourceKey.COLLECTIONS, label: "集合" },
  { key: ResourceKey.VOCABULARIES, label: "词库" },
  { key: ResourceKey.GRAMMARS, label: "语法" },
  { key: ResourceKey.SENTENCES, label: "句子" },
  { key: "review_errors", label: "错题" },
  { key: "review_favorites", label: "收藏" },
  { key: "review_mastered", label: "已掌握" },
  { key: ResourceKey.TAGS, label: "标签" },
  { key: ResourceKey.PARTS_OF_SPEECH, label: "词性" },
  { key: ResourceKey.IMPORTS, label: "导入审核" },
] as const;
