import { ResourceKey } from "../../config/resources";
import type { Item } from "../../types/models";
import { request } from "../request";
import { resourceApi } from "../resources/resourceApi";

const GRAMMAR_ENDPOINT = "/api/grammars";
const SENTENCE_ENDPOINT = "/api/sentences";
const VOCABULARY_ENDPOINT = "/api/vocabularies";

export const getDetail = (resource: ResourceKey, id: number) =>
  resourceApi.detail<Item>(resource, id);
export const deleteDetail = (resource: ResourceKey, id: number) =>
  resourceApi.remove(resource, id);
export async function listAvailableGrammars() {
  return (
    await resourceApi.list<{ data: Item[] }>(ResourceKey.GRAMMARS, {
      pageSize: 100,
    })
  ).data;
}
export async function listAvailableTags() {
  return (
    await resourceApi.list<{ data: Item[] }>(ResourceKey.TAGS, {
      pageNum: 1,
      pageSize: 100,
    })
  ).data;
}
export function linkVocabularyGrammar(vocabularyId: number, grammarId: number) {
  return request<void>({
    method: "POST",
    url: `${VOCABULARY_ENDPOINT}/${vocabularyId}/grammars`,
    data: { grammarId },
  });
}
export function linkSentenceGrammar(sentenceId: number, grammarId: number) {
  return request<void>({
    method: "POST",
    url: `${SENTENCE_ENDPOINT}/${sentenceId}/grammars`,
    data: { grammarId },
  });
}
export function createVocabularySentence(vocabularyId: number, data: Item) {
  return request<void>({
    method: "POST",
    url: `${VOCABULARY_ENDPOINT}/${vocabularyId}/sentences`,
    data,
  });
}
export function createGrammarSentence(grammarId: number, data: Item) {
  return request<void>({
    method: "POST",
    url: `${GRAMMAR_ENDPOINT}/${grammarId}/sentences`,
    data,
  });
}
