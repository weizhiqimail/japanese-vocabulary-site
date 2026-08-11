import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** 新增或编辑语法时允许提交的字段。 */
export class SaveGrammarDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  grammarId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  pattern: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reading?: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  @Min(1, { each: true })
  vocabularyIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sentenceIds?: number[];
}
