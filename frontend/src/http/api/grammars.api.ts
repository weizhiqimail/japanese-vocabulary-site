import { request } from "@/http/request";
import { listQuery } from "@/http/api/api.utils";
import type {
  ListQuery,
  PaginatedData,
  RelationPayload,
  ResourceItem,
} from "@/types/api.types";

export interface SaveGrammarInput {
  grammarId?: number;
  meaning: string;
  notes: string;
  pattern: string;
  reading: string;
  sentenceIds: number[];
  tagIds: number[];
  vocabularyIds: number[];
}

export function getGrammars(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: "/words/grammars",
    params: listQuery(params),
  });
}

export function getGrammar(grammarId: number) {
  return request<ResourceItem>({
    url: "/words/grammars",
    params: { grammarId },
  });
}

export function saveGrammar(input: SaveGrammarInput) {
  return request<ResourceItem>({
    method: "POST",
    url: "/words/grammars/save",
    data: {
      ...(input.grammarId ? { grammarId: input.grammarId } : undefined),
      pattern: input.pattern,
      reading: input.reading,
      meaning: input.meaning,
      notes: input.notes,
      tagIds: input.tagIds,
      vocabularyIds: input.vocabularyIds,
      sentenceIds: input.sentenceIds,
    },
  });
}

export function deleteGrammar(grammarId: number) {
  return request({
    method: "POST",
    url: "/words/grammars/delete",
    data: { grammarId },
  });
}

export function saveGrammarRelation(
  grammarId: number,
  relation: RelationPayload,
) {
  return request({
    method: "POST",
    url: "/words/grammars/relations/save",
    data: {
      grammarId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}

export function deleteGrammarRelation(
  grammarId: number,
  relation: RelationPayload,
) {
  return request({
    method: "POST",
    url: "/words/grammars/relations/delete",
    data: {
      grammarId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}
