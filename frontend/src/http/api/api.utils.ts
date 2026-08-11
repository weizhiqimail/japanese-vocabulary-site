import type { ListQuery } from "@/types/api.types";

/** 查询接口也只发送调用方明确支持的分页和筛选字段。 */
export function listQuery(query: ListQuery) {
  return {
    ...(query.pageNum !== undefined ? { pageNum: query.pageNum } : undefined),
    ...(query.pageSize !== undefined
      ? { pageSize: query.pageSize }
      : undefined),
    ...(query.q !== undefined ? { q: query.q } : undefined),
    ...(query.tagId !== undefined ? { tagId: query.tagId } : undefined),
    ...(query.type !== undefined ? { type: query.type } : undefined),
  };
}
