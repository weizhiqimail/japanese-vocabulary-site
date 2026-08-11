import type { TestQuestion } from "@/http/api/study.api";

export interface TestResult {
  correct: boolean;
  question: TestQuestion;
  selected: string;
}
