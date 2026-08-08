import { ResourceKey } from "./resources";
export const RESOURCE_LABELS: Record<
  ResourceKey,
  { title: string; subtitle: string; singular: string }
> = {
  [ResourceKey.VOCABULARIES]: {
    title: "词库",
    subtitle: "查询并维护正式词汇资料。",
    singular: "词汇",
  },
  [ResourceKey.GRAMMARS]: {
    title: "语法",
    subtitle: "整理语法含义以及关联句子。",
    singular: "语法",
  },
  [ResourceKey.SENTENCES]: {
    title: "句子",
    subtitle: "维护例句、翻译及知识关联。",
    singular: "句子",
  },
  [ResourceKey.COLLECTIONS]: {
    title: "词汇集合",
    subtitle: "从来源集合或自建集合开始学习和测试。",
    singular: "集合",
  },
  [ResourceKey.TAGS]: {
    title: "标签",
    subtitle: "维护知识属性标签。",
    singular: "标签",
  },
  [ResourceKey.PARTS_OF_SPEECH]: {
    title: "词性",
    subtitle: "维护词性及显示顺序。",
    singular: "词性",
  },
  [ResourceKey.IMPORTS]: {
    title: "导入审核",
    subtitle: "审核待导入词汇。",
    singular: "导入记录",
  },
};
