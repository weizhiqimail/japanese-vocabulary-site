import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AnswerQuestionDto {
  @IsUUID() requestKey: string;
  @IsInt() @Min(1) bankId: number;
  @IsInt() @Min(1) questionId: number;
  @IsIn(['sequential', 'error_review', 'favorite_review']) mode:
    'sequential' | 'error_review' | 'favorite_review';
  @IsArray() @IsString({ each: true }) selectedOptionKeys: string[];
  @IsOptional() @IsInt() @Min(0) @Max(86_400_000) durationMs?: number;
}
