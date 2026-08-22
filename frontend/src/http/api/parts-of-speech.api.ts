import { request } from "@/http/request";
import { listQuery } from "@/http/api/api.utils";
import type { ListQuery, PaginatedData, ResourceItem } from "@/types/api.types";

export interface SavePartOfSpeechInput {
  code?: string;
  enabled: boolean;
  name: string;
  partOfSpeechId?: number;
}

export function getPartsOfSpeech(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: "/parts-of-speech",
    params: listQuery(params),
  });
}

export function savePartOfSpeech(input: SavePartOfSpeechInput) {
  return request<ResourceItem>({
    method: "POST",
    url: "/parts-of-speech/save",
    data: {
      ...(input.partOfSpeechId
        ? { partOfSpeechId: input.partOfSpeechId }
        : undefined),
      ...(input.code ? { code: input.code } : undefined),
      name: input.name,
      enabled: input.enabled,
    },
  });
}
