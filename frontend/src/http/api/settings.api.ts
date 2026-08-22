import { request } from "@/http/request";

export function getSettings() {
  return request<Record<string, unknown>>({ url: "/settings" });
}

export interface PaginationDefaults {
  collections: number;
  grammars: number;
  sentences: number;
  tags: number;
  vocabularies: number;
}

export function saveSetting(
  key: "pagination_defaults",
  value: PaginationDefaults,
) {
  return request({
    method: "POST",
    url: "/settings/save",
    data: { key, value },
  });
}
