import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/** 新增或编辑句子时允许提交的字段。 */
export class SaveSentenceDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sentenceId?: number;

  @IsString()
  @IsNotEmpty()
  japanese: string;

  @IsOptional()
  @IsString()
  reading?: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

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
  grammarIds?: number[];
}
