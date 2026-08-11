export function getPagination(pageNum: number, pageSize: number) {
  return { pageNum, pageSize, skip: (pageNum - 1) * pageSize, take: pageSize };
}
