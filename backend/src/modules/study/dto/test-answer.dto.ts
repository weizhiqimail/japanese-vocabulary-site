import { IsBoolean, IsInt, Min } from 'class-validator';

export class TestAnswerDto {
  @IsInt() @Min(1) vocabularyId: number;

  @IsBoolean() correct: boolean;
}
