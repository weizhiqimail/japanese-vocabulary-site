import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  ALLOWED_PAGE_SIZES,
  DEFAULT_PAGE_SIZE,
} from '@/common/constants/pagination.constants';

export class PaginationQueryDto {
  @Transform(({ value }) => Number(value || 1)) @IsInt() @Min(1) pageNum = 1;

  @Transform(({ value }) => Number(value || DEFAULT_PAGE_SIZE))
  @IsIn(ALLOWED_PAGE_SIZES)
  pageSize = DEFAULT_PAGE_SIZE;

  @IsOptional() @IsString() q?: string;
}
