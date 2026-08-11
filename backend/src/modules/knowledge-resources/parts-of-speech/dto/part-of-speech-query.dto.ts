import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

/** 词性列表与详情允许的查询参数。 */
export class PartOfSpeechQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  partOfSpeechId?: number;
}
