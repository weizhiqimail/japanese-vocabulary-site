import { request } from "@/http/request";
import { listQuery } from "@/http/api/api.utils";
import type { ListQuery, PaginatedData, ResourceItem } from "@/types/api.types";

export const TAG_COLORS = [
  "#FDE68A",
  "#FDBA74",
  "#FCA5A5",
  "#F9A8D4",
  "#C4B5FD",
  "#93C5FD",
  "#67E8F9",
  "#6EE7B7",
  "#BEF264",
  "#D1D5DB",
] as const;

export interface SaveTagInput {
  color: (typeof TAG_COLORS)[number];
  name: string;
  tagId?: number;
}

export function getTags(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: "/tags",
    params: listQuery(params),
  });
}

export function saveTag(input: SaveTagInput) {
  return request<ResourceItem>({
    method: "POST",
    url: "/tags/save",
    data: {
      ...(input.tagId ? { tagId: input.tagId } : undefined),
      name: input.name,
      color: input.color,
    },
  });
}

export function deleteTag(tagId: number) {
  return request({ method: "POST", url: "/tags/delete", data: { tagId } });
}
