import type { QuestionBank } from '@/http/api/questions.api';

export const QUESTION_BANK_LIST = {
  pageNum: 1,
  pageSize: 20,
  searchDelayMs: 200,
} as const;

export const QUESTION_BANK_STATUS = {
  completed: 'completed',
} as const;

export function getQuestionBankActionLabel(bank: QuestionBank) {
  if (bank.status === QUESTION_BANK_STATUS.completed) return '已完成';
  if (Number(bank.answeredCount) > 0)
    return `继续第 ${bank.currentPosition} 题`;
  return '开始做题';
}
