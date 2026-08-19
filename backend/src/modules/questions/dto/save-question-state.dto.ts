import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class SaveQuestionStateDto {
  @IsInt() @Min(1) questionId: number;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsBoolean() isInErrorBook?: boolean;
}
