import { IsIn, IsInt, Min } from 'class-validator';

export class ReviewImportDto {
  @IsInt()
  @Min(1)
  candidateId: number;

  @IsIn(['approve', 'reject', 'not_needed']) decision:
    'approve' | 'reject' | 'not_needed';
}
