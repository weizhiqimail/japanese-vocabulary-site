import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Progress,
  Stack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import {
  getCurrentQuestion,
  saveQuestionState,
  submitQuestionAnswer,
  type AnswerResult,
  type PracticeQuestion,
} from '@/http/api/questions.api';
import {
  getOptionAppearance,
  getOptionHover,
  getPracticeMode,
  PRACTICE_MODE_LABELS,
  PRACTICE_MODES,
  PRACTICE_TEXT,
  QUESTION_TYPES,
} from './config';
import { LocalizedContent } from './LocalizedContent';

export function QuestionPractice() {
  const { id } = useParams();
  const bankId = Number(id);
  const location = useLocation();
  const mode = getPracticeMode(location.pathname);
  const toast = useToast({ duration: 2000, position: 'top-right' });
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(true);
  const [startedAt, setStartedAt] = useState(Date.now());

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setQuestion(await getCurrentQuestion(bankId, mode));
      setSelected([]);
      setResult(null);
      setStartedAt(Date.now());
    } finally {
      setBusy(false);
    }
  }, [bankId, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const multiple = question?.questionType === QUESTION_TYPES.multipleChoice;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const selectOption = (key: string) => {
    if (result) return;
    setSelected((current) => {
      if (!multiple) return [key];
      return current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
    });
  };

  const submit = async () => {
    if (!question?.id || !selected.length) return;
    setBusy(true);
    try {
      setResult(
        await submitQuestionAnswer({
          requestKey: crypto.randomUUID(),
          bankId,
          questionId: Number(question.id),
          mode,
          selectedOptionKeys: selected,
          durationMs: Date.now() - startedAt,
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const favorite = async () => {
    if (!question) return;
    const next = !question.state.isFavorite;
    await saveQuestionState({
      questionId: Number(question.id),
      isFavorite: next,
    });
    setQuestion({
      ...question,
      state: { ...question.state, isFavorite: next },
    });
    toast({
      status: 'success',
      title: next ? PRACTICE_TEXT.favoriteAdded : PRACTICE_TEXT.favoriteRemoved,
    });
  };

  const resolveError = async () => {
    if (!question) return;
    await saveQuestionState({
      questionId: Number(question.id),
      isInErrorBook: false,
    });
    toast({ status: 'success', title: PRACTICE_TEXT.errorRemoved });
    await load();
  };

  if (question?.completed) {
    return (
      <VStack spacing={6} py={{ base: 16, md: 24 }}>
        <Heading size={{ base: 'lg', md: 'xl' }} textAlign="center">
          {mode === PRACTICE_MODES.sequential
            ? PRACTICE_TEXT.bankCompleted
            : PRACTICE_TEXT.noQuestions}
        </Heading>
        <Button as={Link} to={`/q/questions/banks/${id}`}>
          返回题库
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={5} maxW="1000px" mx="auto">
      <PageBreadcrumb
        items={[{ label: '题库', path: '/q/questions' }, { label: '做题' }]}
      />
      <HStack justify="space-between" align="start" flexWrap="wrap">
        <HStack>
          <Badge>{PRACTICE_MODE_LABELS[mode]}</Badge>
          {question && (
            <Text color="slate.600">
              第 {question.position} / {question.questionCount} 题
            </Text>
          )}
        </HStack>
        {multiple && (
          <Text fontSize="sm" color="slate.500">
            本题可选择多个答案
          </Text>
        )}
      </HStack>
      {question && (
        <Card bg="white">
          <CardBody p={{ base: 4, sm: 5, md: 8 }}>
            <Progress
              value={
                (question.position / Math.max(question.questionCount, 1)) * 100
              }
              mb={{ base: 5, md: 7 }}
              rounded="full"
            />
            <Heading size="sm" mb={4}>
              题目
            </Heading>
            <LocalizedContent texts={question.questionTexts} />
            <Stack mt={{ base: 6, md: 8 }} spacing={3}>
              {question.options.map((option) => {
                const isSelected = selectedSet.has(option.key);
                const isCorrect = Boolean(
                  result?.correctOptionKeys.includes(option.key),
                );
                const isWrongSelection = Boolean(
                  result && isSelected && !isCorrect,
                );
                const appearance = getOptionAppearance(
                  isSelected,
                  isCorrect,
                  isWrongSelection,
                );
                const hover = getOptionHover(Boolean(result), isSelected);
                return (
                  <Box
                    key={option.key}
                    as="button"
                    type="button"
                    textAlign="left"
                    width="full"
                    p={{ base: 4, md: 5 }}
                    borderWidth="1px"
                    borderColor={appearance.borderColor}
                    bg={appearance.background}
                    borderRadius="xl"
                    cursor={result ? 'default' : 'pointer'}
                    transition="background-color 0.15s ease, border-color 0.15s ease"
                    _hover={hover}
                    _focusVisible={{
                      outline: '2px solid',
                      outlineColor: 'brand.400',
                      outlineOffset: '2px',
                    }}
                    onClick={() => selectOption(option.key)}
                    aria-pressed={isSelected}
                  >
                    <HStack
                      align="start"
                      spacing={{ base: 3, md: 4 }}
                      minWidth={0}
                    >
                      <Text
                        fontWeight="800"
                        color={isSelected ? 'brand.700' : 'slate.700'}
                        flexShrink={0}
                      >
                        {option.key}.
                      </Text>
                      <LocalizedContent texts={option.contentTexts} />
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
            {result && (
              <Alert
                status={result.correct ? 'success' : 'error'}
                mt={7}
                alignItems="start"
                borderRadius="lg"
              >
                <AlertIcon />
                <Stack>
                  <AlertTitle>
                    {result.correct
                      ? PRACTICE_TEXT.answerCorrect
                      : PRACTICE_TEXT.answerWrong}
                  </AlertTitle>
                  <AlertDescription>
                    正确答案：{result.correctOptionKeys.join('、')}
                  </AlertDescription>
                  {Object.values(result.explanationTexts || {}).some(
                    Boolean,
                  ) ? (
                    <LocalizedContent texts={result.explanationTexts} />
                  ) : (
                    <Text>{PRACTICE_TEXT.noExplanation}</Text>
                  )}
                </Stack>
              </Alert>
            )}
            <Stack direction={{ base: 'column', sm: 'row' }} mt={7} spacing={3}>
              <Button
                onClick={result ? () => void load() : () => void submit()}
                isDisabled={!result && !selected.length}
                w={{ base: 'full', sm: 'auto' }}
              >
                {result ? '下一题' : '提交答案'}
              </Button>
              <Button
                variant="outline"
                onClick={() => void favorite()}
                w={{ base: 'full', sm: 'auto' }}
              >
                {question.state.isFavorite ? '取消收藏' : '收藏'}
              </Button>
              {result &&
                !result.correct &&
                mode === PRACTICE_MODES.errorReview && (
                  <Button
                    variant="outline"
                    onClick={() => void resolveError()}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    标记已掌握
                  </Button>
                )}
            </Stack>
          </CardBody>
        </Card>
      )}
      <PageLoading visible={busy} label="正在处理题目…" />
    </VStack>
  );
}
