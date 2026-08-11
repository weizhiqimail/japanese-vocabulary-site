import { IsIn } from 'class-validator';
export class ReviewImportDto {
  @IsIn(['approve', 'reject', 'not_needed']) decision:
    'approve' | 'reject' | 'not_needed';
}
