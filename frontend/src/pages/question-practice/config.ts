import type { SystemStyleObject } from '@chakra-ui/react';
import type { PracticeMode, QuestionLanguage } from '@/http/api/questions.api';

export const QUESTION_LANGUAGES: QuestionLanguage[] = ['en', 'zh', 'ja'];

export const LANGUAGE_LABELS: Record<QuestionLanguage, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

export const LANGUAGE_LABEL_WIDTH = '64px';

export const PRACTICE_MODES = {
  sequential: 'sequential',
  errorReview: 'error_review',
  favoriteReview: 'favorite_review',
} as const;

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  sequential: '顺序做题',
  error_review: '错题练习',
  favorite_review: '收藏练习',
};

export const PRACTICE_PATH_SUFFIXES = {
  errors: '/errors',
  favorites: '/favorites',
} as const;

export const QUESTION_TYPES = {
  multipleChoice: 'multiple_choice',
} as const;

export const PRACTICE_TEXT = {
  bankCompleted: '题库已完成',
  noQuestions: '当前没有可练习的题目',
  answerCorrect: '回答正确',
  answerWrong: '回答错误',
  noExplanation: '暂无解析',
  favoriteAdded: '已收藏',
  favoriteRemoved: '已取消收藏',
  errorRemoved: '已移出错题',
} as const;

export const OPTION_APPEARANCE = {
  default: { borderColor: 'brand.100', background: 'white' },
  selected: { borderColor: 'brand.400', background: 'brand.50' },
  correct: { borderColor: 'green.400', background: 'green.50' },
  wrong: { borderColor: 'red.400', background: 'red.50' },
} as const;

export const OPTION_HOVER: SystemStyleObject = {
  background: 'blue.50',
  borderColor: 'brand.300',
};

export function getPracticeMode(pathname: string): PracticeMode {
  if (pathname.endsWith(PRACTICE_PATH_SUFFIXES.errors)) {
    return PRACTICE_MODES.errorReview;
  }
  if (pathname.endsWith(PRACTICE_PATH_SUFFIXES.favorites)) {
    return PRACTICE_MODES.favoriteReview;
  }
  return PRACTICE_MODES.sequential;
}

export function getOptionAppearance(
  isSelected: boolean,
  isCorrect: boolean,
  isWrongSelection: boolean,
) {
  if (isCorrect) return OPTION_APPEARANCE.correct;
  if (isWrongSelection) return OPTION_APPEARANCE.wrong;
  if (isSelected) return OPTION_APPEARANCE.selected;
  return OPTION_APPEARANCE.default;
}

export function getOptionHover(isDisabled: boolean, isSelected: boolean) {
  if (isDisabled || isSelected) return undefined;
  return OPTION_HOVER;
}
