import { DetailRelationKey, ResourceKey } from "../../../config/resources";

export interface DetailRelationDefinition {
  key: DetailRelationKey;
  label: string;
  field: string;
  route: ResourceKey;
}

export const DETAIL_RELATIONS: Record<
  ResourceKey.VOCABULARIES | ResourceKey.GRAMMARS | ResourceKey.SENTENCES,
  DetailRelationDefinition[]
> = {
  [ResourceKey.VOCABULARIES]: [
    {
      key: DetailRelationKey.GRAMMARS,
      label: "关联语法",
      field: "pattern",
      route: ResourceKey.GRAMMARS,
    },
    {
      key: DetailRelationKey.SENTENCES,
      label: "关联句子",
      field: "japanese",
      route: ResourceKey.SENTENCES,
    },
    {
      key: DetailRelationKey.RELATIONS,
      label: "关联词汇",
      field: "word",
      route: ResourceKey.VOCABULARIES,
    },
  ],
  [ResourceKey.GRAMMARS]: [
    {
      key: DetailRelationKey.VOCABULARIES,
      label: "关联词汇",
      field: "word",
      route: ResourceKey.VOCABULARIES,
    },
    {
      key: DetailRelationKey.SENTENCES,
      label: "关联句子",
      field: "japanese",
      route: ResourceKey.SENTENCES,
    },
  ],
  [ResourceKey.SENTENCES]: [
    {
      key: DetailRelationKey.VOCABULARIES,
      label: "关联词汇",
      field: "word",
      route: ResourceKey.VOCABULARIES,
    },
    {
      key: DetailRelationKey.GRAMMARS,
      label: "关联语法",
      field: "pattern",
      route: ResourceKey.GRAMMARS,
    },
  ],
};
