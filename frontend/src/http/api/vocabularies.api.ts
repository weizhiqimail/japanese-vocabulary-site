import { request } from "@/http/request";
import { listQuery } from "@/http/api/api.utils";
import type {
  ListQuery,
  PaginatedData,
  RelationPayload,
  ResourceItem,
} from "@/types/api.types";

export interface SaveVocabularyInput {
  collectionIds: number[];
  grammarIds: number[];
  notes: string;
  posIds: number[];
  reading: string;
  sentenceIds: number[];
  tagIds: number[];
  translation: string;
  word: string;
  wordId?: number;
}

export function getVocabularies(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: "/words/vocabularies",
    params: listQuery(params),
  });
}

export function getVocabulary(wordId: number) {
  return request<ResourceItem>({
    url: "/words/vocabularies",
    params: { wordId },
  });
}

export function saveVocabulary(input: SaveVocabularyInput) {
  return request<ResourceItem>({
    method: "POST",
    url: "/words/vocabularies/save",
    data: {
      ...(input.wordId ? { wordId: input.wordId } : undefined),
      word: input.word,
      reading: input.reading,
      translation: input.translation,
      notes: input.notes,
      collectionIds: input.collectionIds,
      posIds: input.posIds,
      tagIds: input.tagIds,
      grammarIds: input.grammarIds,
      sentenceIds: input.sentenceIds,
    },
  });
}

export function deleteVocabulary(wordId: number) {
  return request({
    method: "POST",
    url: "/words/vocabularies/delete",
    data: { wordId },
  });
}

export function saveVocabularyRelation(
  wordId: number,
  relation: RelationPayload,
) {
  return request({
    method: "POST",
    url: "/words/vocabularies/relations/save",
    data: {
      wordId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}

export function deleteVocabularyRelation(
  wordId: number,
  relation: RelationPayload,
) {
  return request({
    method: "POST",
    url: "/words/vocabularies/relations/delete",
    data: {
      wordId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}
