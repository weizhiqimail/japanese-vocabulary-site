export const NAV_ITEMS = [
  { label: "首页", path: "/" },
  { label: "集合", path: "/collections" },
  { label: "词库", path: "/vocabularies" },
  { label: "语法", path: "/grammars" },
  { label: "句子", path: "/sentences" },
  { label: "复习", path: "/review/errors" },
  { label: "管理", path: "/manage/tags" },
] as const;

export const MANAGEMENT_ITEMS = [
  { label: "标签", path: "/manage/tags" },
  { label: "词性", path: "/manage/parts-of-speech" },
  { label: "设置", path: "/manage/settings" },
] as const;
