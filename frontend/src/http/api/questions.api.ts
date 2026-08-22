import { request } from '@/http/request';
import type { PaginatedData } from '@/types/api.types';

export type PracticeMode = 'sequential' | 'error_review' | 'favorite_review';
export type QuestionLanguage = 'zh' | 'en' | 'ja';
export type LocalizedText = Partial<Record<QuestionLanguage, string>>;

export interface QuestionGroup {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  groupLevel: string;
}

export interface QuestionBank {
  id: string;
  code: string;
  name: string;
  description: string | null;
  questionCount: number;
  groupName: string;
  subgroupName: string;
  status: string;
  answeredCount: number;
  correctCount: number;
  currentPosition: number;
  errorCount: number;
  favoriteCount: number;
}

export interface PracticeQuestion {
  completed?: boolean;
  id: string;
  bankId: string;
  externalKey: string;
  position: number;
  questionCount: number;
  questionType: 'single_choice' | 'multiple_choice';
  questionTexts: LocalizedText;
  options: Array<{ key: string; contentTexts: LocalizedText }>;
  state: { isFavorite: boolean; isInErrorBook: boolean; wrongCount: number };
}

export interface AnswerResult {
  requestKey: string;
  correct: boolean;
  correctOptionKeys: string[];
  explanationTexts: LocalizedText;
  state: PracticeQuestion['state'];
}

export const getQuestionGroups = (parentId?: number) =>
  request<QuestionGroup[]>({
    url: '/questions/groups',
    params: parentId ? { parentId } : { level: 'provider' },
  });

export const getQuestionBanks = (
  params: {
    pageNum?: number;
    pageSize?: number;
    q?: string;
    groupId?: number;
    subgroupId?: number;
  } = {},
) => request<PaginatedData<QuestionBank>>({ url: '/questions/banks', params });

export const getQuestionBank = (bankId: number) =>
  request<QuestionBank>({ url: '/questions/banks/detail', params: { bankId } });

export const getCurrentQuestion = (bankId: number, mode: PracticeMode) =>
  request<PracticeQuestion>({
    url: '/questions/practice/current',
    params: { bankId, mode },
  });

export const submitQuestionAnswer = (data: {
  requestKey: string;
  bankId: number;
  questionId: number;
  mode: PracticeMode;
  selectedOptionKeys: string[];
  durationMs?: number;
}) =>
  request<AnswerResult>({
    method: 'POST',
    url: '/questions/attempts/answer',
    data,
  });

export const saveQuestionState = (data: {
  questionId: number;
  isFavorite?: boolean;
  isInErrorBook?: boolean;
}) => request({ method: 'POST', url: '/questions/states/save', data });
