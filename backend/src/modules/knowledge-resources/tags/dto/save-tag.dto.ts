import {
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TAG_COLOR_VALUES } from '@/modules/knowledge-resources/tags/config/tag.config';

/** 新增或编辑标签时允许提交的字段。 */
export class SaveTagDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  tagId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsHexColor()
  @IsIn(TAG_COLOR_VALUES)
  color: string;
}
