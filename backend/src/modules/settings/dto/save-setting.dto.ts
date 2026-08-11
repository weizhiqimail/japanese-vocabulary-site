import { IsNotEmpty, IsObject, IsString, MaxLength } from 'class-validator';
export class SaveSettingDto {
  @IsString() @IsNotEmpty() @MaxLength(100) key: string;
  @IsObject() value: Record<string, unknown>;
}
