import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class ImportCandidateDto {
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
}

export class CreateImportBatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => ImportCandidateDto)
  candidates: ImportCandidateDto[];
}
