import { getPagination } from '@/helpers/pagination.helper';

describe('getPagination', () => {
  it('converts page numbers to skip and take', () => {
    expect(getPagination(3, 20)).toEqual({
      pageNum: 3,
      pageSize: 20,
      skip: 40,
      take: 20,
    });
  });
});
