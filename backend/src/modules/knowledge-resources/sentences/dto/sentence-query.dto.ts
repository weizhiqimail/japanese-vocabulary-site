import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

/** 句子列表与详情允许的查询参数。 */
export class SentenceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  sentenceId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  tagId?: number;
}
