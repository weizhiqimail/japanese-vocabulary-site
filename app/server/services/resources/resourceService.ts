import {
  detail,
  isResource,
  list,
  remove,
  save,
  type Resource,
} from "../../repositories/resources/repository";

export { isResource, type Resource };

export const resourceService = {
  list(resource: Resource, url: URL) {
    return list(resource, url);
  },
  detail(resource: Resource, id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("无效的资源 ID");
    return detail(resource, id);
  },
  save(resource: Resource, input: Record<string, unknown>) {
    return save(resource, input);
  },
  async remove(resource: Resource, id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("无效的资源 ID");
    await remove(resource, id);
    return { ok: true as const };
  },
};
