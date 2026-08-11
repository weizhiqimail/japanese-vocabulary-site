import { IsIn } from 'class-validator';

/** 复习页只允许三个明确的业务模式。 */
export class ReviewQueryDto {
  @IsIn(['errors', 'mastered', 'favorites'])
  mode: 'errors' | 'mastered' | 'favorites';
}
