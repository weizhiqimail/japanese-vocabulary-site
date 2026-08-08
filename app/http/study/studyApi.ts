import { request } from "../request";
import type { Item } from "../../types/models";

const COLLECTION_ENDPOINT = "/api/collections";
const VOCABULARY_ENDPOINT = "/api/vocabularies";
const TEST_ANSWER_ENDPOINT = "/api/test-answers";

export function getStudyCollection(collectionId: number) {
  return request<Item>({
    method: "GET",
    url: `${COLLECTION_ENDPOINT}/${collectionId}`,
  });
}

export function getCollectionVocabularies(collectionId: number) {
  return request<Item[]>({
    method: "GET",
    url: `${COLLECTION_ENDPOINT}/${collectionId}/members`,
  });
}

export function recordVocabularyLearning(vocabularyId: number) {
  return request<void>({
    method: "POST",
    url: `${VOCABULARY_ENDPOINT}/${vocabularyId}/learn`,
  });
}

export function recordVocabularyReview(vocabularyId: number) {
  return request<void>({
    method: "POST",
    url: `${VOCABULARY_ENDPOINT}/${vocabularyId}/review`,
  });
}

export function submitTestAnswer(vocabularyId: number, correct: boolean) {
  return request<void>({
    method: "POST",
    url: TEST_ANSWER_ENDPOINT,
    data: { vocabularyId, correct },
  });
}
