import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QuestionGroupsQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  parentId?: number;
  @IsOptional() @IsIn(['provider', 'certification']) level?:
    'provider' | 'certification';
}
export class QuestionBanksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  groupId?: number;
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  subgroupId?: number;
}
export class BankIdQueryDto {
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) bankId: number;
}
export class CurrentQuestionQueryDto extends BankIdQueryDto {
  @IsIn(['sequential', 'error_review', 'favorite_review']) mode:
    'sequential' | 'error_review' | 'favorite_review' = 'sequential';
}
export class QuestionItemsQueryDto extends PaginationQueryDto {
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) bankId: number;
  @IsIn(['errors', 'favorites']) scope: 'errors' | 'favorites';
}
export class QuestionAttemptsQueryDto extends PaginationQueryDto {
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) bankId: number;
}
