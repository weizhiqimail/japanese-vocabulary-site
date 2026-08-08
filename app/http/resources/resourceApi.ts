import { RESOURCE_PATHS, type ResourceKey } from "../../config/resources";
import { request } from "../request";
import type { PageQuery } from "../types";

export const resourceApi = {
  list<T>(resource: ResourceKey, params: PageQuery & Record<string, unknown>) {
    return request<T>({ method: "GET", url: RESOURCE_PATHS[resource], params });
  },
  detail<T>(resource: ResourceKey, id: number) {
    return request<T>({
      method: "GET",
      url: `${RESOURCE_PATHS[resource]}/${id}`,
    });
  },
  create<T>(resource: ResourceKey, data: unknown) {
    return request<T>({ method: "POST", url: RESOURCE_PATHS[resource], data });
  },
  update<T>(resource: ResourceKey, id: number, data: unknown) {
    return request<T>({
      method: "PUT",
      url: `${RESOURCE_PATHS[resource]}/${id}`,
      data,
    });
  },
  remove<T>(resource: ResourceKey, id: number) {
    return request<T>({
      method: "DELETE",
      url: `${RESOURCE_PATHS[resource]}/${id}`,
    });
  },
};
