import { request } from "@/http/request";
import type { ResourceItem } from "@/types/api.types";

export interface TestQuestion extends ResourceItem {
  options: string[];
  reading: string | null;
  translation: string;
  word: string;
}

export function getCollectionMembers(collectionId: number) {
  return request<ResourceItem[]>({
    url: "/words/study/collection-members",
    params: { collectionId },
  });
}

export function getTestQuestions(collectionId: number) {
  return request<TestQuestion[]>({
    url: "/words/study/test",
    params: { collectionId },
  });
}

export function recordStudy(
  vocabularyId: number,
  eventType: "learn" | "review",
) {
  return request({
    method: "POST",
    url: "/words/study/record",
    data: { vocabularyId, eventType },
  });
}

export function submitTestAnswer(vocabularyId: number, correct: boolean) {
  return request({
    method: "POST",
    url: "/words/study/test-answer",
    data: { vocabularyId, correct },
  });
}

export function getReviewList(mode: string) {
  return request<ResourceItem[]>({
    url: "/words/study/words/review",
    params: { mode },
  });
}
