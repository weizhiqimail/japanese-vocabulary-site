import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaginationDefaultsDto {
  @IsInt()
  @IsIn([10, 20, 30, 50, 100])
  vocabularies: number;

  @IsInt()
  @IsIn([10, 20, 30, 50, 100])
  collections: number;

  @IsInt()
  @IsIn([10, 20, 30, 50, 100])
  grammars: number;

  @IsInt()
  @IsIn([10, 20, 30, 50, 100])
  sentences: number;

  @IsInt()
  @IsIn([10, 20, 30, 50, 100])
  tags: number;
}

export class SaveSettingDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pagination_defaults'])
  key: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PaginationDefaultsDto)
  value: PaginationDefaultsDto;
}
