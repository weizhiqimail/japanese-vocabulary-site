import { request } from "@/http/request";
import { listQuery } from "@/http/api/api.utils";
import type { ListQuery, PaginatedData, ResourceItem } from "@/types/api.types";

export type CollectionType = "source" | "custom" | "favorite" | "error";

export interface SaveCollectionInput {
  collectionId?: number;
  description: string;
  name: string;
  source: string;
  type: CollectionType;
}

export function getCollections(params: ListQuery = {}) {
  return request<PaginatedData<ResourceItem>>({
    url: "/collections",
    params: listQuery(params),
  });
}

export function getCollection(collectionId: number) {
  return request<ResourceItem>({
    url: "/collections",
    params: { collectionId },
  });
}

export function saveCollection(input: SaveCollectionInput) {
  return request<ResourceItem>({
    method: "POST",
    url: "/collections/save",
    data: {
      ...(input.collectionId
        ? { collectionId: input.collectionId }
        : undefined),
      name: input.name,
      type: input.type,
      source: input.source,
      description: input.description,
    },
  });
}

export function deleteCollection(collectionId: number) {
  return request({
    method: "POST",
    url: "/collections/delete",
    data: { collectionId },
  });
}
