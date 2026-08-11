import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** 编辑固定词性时允许提交的字段。 */
export class SavePartOfSpeechDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  partOfSpeechId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
