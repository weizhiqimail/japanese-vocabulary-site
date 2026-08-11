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

/** 新增或编辑词汇时允许提交的字段。 */
export class SaveVocabularyDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  wordId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  word: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reading?: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  @Min(1, { each: true })
  collectionIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  posIds?: number[];

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
  grammarIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sentenceIds?: number[];
}
