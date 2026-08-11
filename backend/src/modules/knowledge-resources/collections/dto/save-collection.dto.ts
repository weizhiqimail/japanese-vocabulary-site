import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** 新增或编辑词汇集合时允许提交的字段。 */
export class SaveCollectionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  collectionId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsIn(['source', 'custom', 'favorite', 'error'])
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  source?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
