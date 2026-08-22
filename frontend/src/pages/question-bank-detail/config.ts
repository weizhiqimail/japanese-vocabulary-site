import type { QuestionBank } from '@/http/api/questions.api';

export const QUESTION_BANK_STATISTICS: Array<{
  label: string;
  field: keyof QuestionBank;
}> = [
  { label: '总题数', field: 'questionCount' },
  { label: '已完成', field: 'answeredCount' },
  { label: '错题', field: 'errorCount' },
  { label: '收藏', field: 'favoriteCount' },
];
