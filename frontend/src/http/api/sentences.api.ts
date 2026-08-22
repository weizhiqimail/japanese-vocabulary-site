import { request } from '@/http/request';
import { listQuery } from '@/http/api/api.utils';
import type {
  ListQuery,
  PaginatedData,
  RelationPayload,
  ResourceItem,
} from '@/types/api.types';

export interface SaveSentenceInput {
  grammarIds: number[];
  japanese: string;
  notes: string;
  reading: string;
  sentenceId?: number;
  tagIds: number[];
  translation: string;
  vocabularyIds: number[];
}

export function getSentences(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: '/sentences',
    params: listQuery(params),
  });
}

export function getSentence(sentenceId: number) {
  return request<ResourceItem>({ url: '/sentences', params: { sentenceId } });
}

export function saveSentence(input: SaveSentenceInput) {
  return request<ResourceItem>({
    method: 'POST',
    url: '/sentences/save',
    data: {
      ...(input.sentenceId ? { sentenceId: input.sentenceId } : undefined),
      japanese: input.japanese,
      reading: input.reading,
      translation: input.translation,
      notes: input.notes,
      tagIds: input.tagIds,
      vocabularyIds: input.vocabularyIds,
      grammarIds: input.grammarIds,
    },
  });
}

export function deleteSentence(sentenceId: number) {
  return request({
    method: 'POST',
    url: '/sentences/delete',
    data: { sentenceId },
  });
}

export function saveSentenceRelation(
  sentenceId: number,
  relation: RelationPayload,
) {
  return request({
    method: 'POST',
    url: '/sentences/relations/save',
    data: {
      sentenceId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}

export function deleteSentenceRelation(
  sentenceId: number,
  relation: RelationPayload,
) {
  return request({
    method: 'POST',
    url: '/sentences/relations/delete',
    data: {
      sentenceId,
      targetResource: relation.targetResource,
      targetId: relation.targetId,
    },
  });
}
