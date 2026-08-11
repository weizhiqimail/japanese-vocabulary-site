import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

/** 集合列表与详情只接受集合自身需要的查询参数。 */
export class CollectionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  collectionId?: number;

  @IsOptional()
  @IsIn(['source', 'custom', 'favorite', 'error'])
  type?: string;
}
