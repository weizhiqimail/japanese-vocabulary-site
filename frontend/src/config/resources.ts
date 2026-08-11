export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
}
export interface ResourceConfig {
  title: string;
  singular: string;
  primary: string;
  secondary?: string;
  columns: { key: string; label: string }[];
  fields: FieldConfig[];
  editable?: boolean;
  creatable?: boolean;
}
export const RESOURCE_CONFIG: Record<string, ResourceConfig> = {
  vocabularies: {
    title: "核心词库",
    singular: "词汇",
    primary: "word",
    secondary: "reading",
    columns: [
      { key: "word", label: "词汇" },
      { key: "reading", label: "假名" },
      { key: "translation", label: "翻译" },
      { key: "part_of_speech_names", label: "词性" },
      { key: "review_count", label: "复习" },
    ],
    fields: [
      { key: "word", label: "词汇", required: true },
      { key: "reading", label: "假名" },
      {
        key: "translation",
        label: "中文翻译",
        type: "textarea",
        required: true,
      },
      { key: "notes", label: "备注", type: "textarea" },
    ],
  },
  collections: {
    title: "词汇集合",
    singular: "集合",
    primary: "name",
    secondary: "description",
    columns: [
      { key: "name", label: "名称" },
      { key: "type", label: "类型" },
      { key: "source", label: "来源" },
      { key: "member_count", label: "词数" },
      { key: "learned_count", label: "已学习" },
    ],
    fields: [
      { key: "name", label: "集合名", required: true },
      {
        key: "type",
        label: "类型",
        type: "select",
        options: [
          { value: "source", label: "来源单词书" },
          { value: "custom", label: "自建集合" },
          { value: "favorite", label: "收藏本" },
          { value: "error", label: "错题本" },
        ],
      },
      { key: "source", label: "来源" },
      { key: "description", label: "说明", type: "textarea" },
    ],
  },
  grammars: {
    title: "语法",
    singular: "语法",
    primary: "pattern",
    secondary: "reading",
    columns: [
      { key: "pattern", label: "语法形式" },
      { key: "reading", label: "读法" },
      { key: "meaning", label: "含义" },
      { key: "updated_at", label: "更新时间" },
    ],
    fields: [
      { key: "pattern", label: "语法形式", required: true },
      { key: "reading", label: "读法" },
      { key: "meaning", label: "中文含义", type: "textarea", required: true },
      { key: "notes", label: "备注", type: "textarea" },
    ],
  },
  sentences: {
    title: "句子",
    singular: "句子",
    primary: "japanese",
    secondary: "reading",
    columns: [
      { key: "japanese", label: "日语句子" },
      { key: "reading", label: "注音" },
      { key: "translation", label: "翻译" },
      { key: "updated_at", label: "更新时间" },
    ],
    fields: [
      { key: "japanese", label: "日语句子", type: "textarea", required: true },
      { key: "reading", label: "注音", type: "textarea" },
      {
        key: "translation",
        label: "中文翻译",
        type: "textarea",
        required: true,
      },
      { key: "notes", label: "备注", type: "textarea" },
    ],
  },
  tags: {
    title: "标签管理",
    singular: "标签",
    primary: "name",
    columns: [
      { key: "name", label: "名称" },
      { key: "color", label: "颜色" },
      { key: "enabled", label: "启用" },
    ],
    fields: [
      { key: "name", label: "名称", required: true },
      { key: "color", label: "颜色语义" },
      { key: "enabled", label: "启用", type: "checkbox" },
    ],
  },
  "parts-of-speech": {
    title: "词性管理",
    singular: "词性",
    primary: "name",
    secondary: "code",
    columns: [
      { key: "code", label: "代码" },
      { key: "name", label: "名称" },
      { key: "sort_order", label: "排序" },
      { key: "enabled", label: "启用" },
    ],
    fields: [
      { key: "name", label: "名称", required: true },
      { key: "sort_order", label: "排序", type: "number" },
      { key: "enabled", label: "启用", type: "checkbox" },
    ],
    creatable: false,
  },
  imports: {
    title: "导入审核",
    singular: "候选词",
    primary: "word",
    secondary: "reading",
    columns: [
      { key: "word", label: "候选词" },
      { key: "reading", label: "假名" },
      { key: "translation", label: "翻译" },
      { key: "status", label: "状态" },
    ],
    fields: [],
    editable: false,
  },
};
