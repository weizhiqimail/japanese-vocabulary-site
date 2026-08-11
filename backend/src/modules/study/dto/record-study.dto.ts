import { IsIn, IsInt, Min } from 'class-validator';

/** 学习与复习操作使用明确动作字段，不依赖 URL 动词。 */
export class RecordStudyDto {
  @IsInt()
  @Min(1)
  vocabularyId: number;

  @IsIn(['learn', 'review'])
  eventType: 'learn' | 'review';
}
