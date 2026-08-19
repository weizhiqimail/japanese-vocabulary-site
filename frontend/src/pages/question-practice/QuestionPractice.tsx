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
  Checkbox,
  Heading,
  HStack,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import {
  getCurrentQuestion,
  saveQuestionState,
  submitQuestionAnswer,
  type AnswerResult,
  type PracticeMode,
  type PracticeQuestion,
  type LocalizedText,
} from "@/http/api/questions.api";

const LANGUAGE_LABELS = { en: "English", zh: "中文", ja: "日本語" } as const;
function LocalizedContent({ texts }: { texts: LocalizedText }) {
  const entries = (["en", "zh", "ja"] as const).filter((language) =>
    texts[language]?.trim(),
  );
  return (
    <Stack spacing={3} w="full">
      {entries.map((language) => (
        <Box key={language}>
          <Text fontSize="xs" color="slate.500" fontWeight="700">
            {LANGUAGE_LABELS[language]}
          </Text>
          <Text whiteSpace="pre-wrap" lineHeight="tall">
            {texts[language]}
          </Text>
        </Box>
      ))}
    </Stack>
  );
}

const modeOf = (pathname: string): PracticeMode =>
  pathname.endsWith("/errors")
    ? "error_review"
    : pathname.endsWith("/favorites")
      ? "favorite_review"
      : "sequential";
export function QuestionPractice() {
  const { id } = useParams();
  const bankId = Number(id);
  const location = useLocation();
  const mode = modeOf(location.pathname);
  const toast = useToast({ duration: 2000, position: "top-right" });
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
  const multiple = question?.questionType === "multiple_choice";
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const toggle = (key: string) =>
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  const submit = async () => {
    if (!question?.id || !selected.length) return;
    setBusy(true);
    try {
      const answer = await submitQuestionAnswer({
        requestKey: crypto.randomUUID(),
        bankId,
        questionId: Number(question.id),
        mode,
        selectedOptionKeys: selected,
        durationMs: Date.now() - startedAt,
      });
      setResult(answer);
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
    toast({ status: "success", title: next ? "已收藏" : "已取消收藏" });
  };
  const resolveError = async () => {
    if (!question) return;
    await saveQuestionState({
      questionId: Number(question.id),
      isInErrorBook: false,
    });
    toast({ status: "success", title: "已移出错题" });
    await load();
  };
  if (question?.completed)
    return (
      <VStack spacing={6}>
        <Heading>
          {mode === "sequential" ? "题库已完成" : "当前没有可练习的题目"}
        </Heading>
        <Button as={Link} to={`/questions/banks/${id}`}>
          返回题库
        </Button>
      </VStack>
    );
  return (
    <VStack align="stretch" spacing={5} maxW="1100px" mx="auto">
      <PageBreadcrumb
        items={[{ label: "题库", path: "/questions" }, { label: "做题" }]}
      />
      <HStack justify="space-between">
        <HStack>
          <Badge>
            {mode === "sequential"
              ? "顺序做题"
              : mode === "error_review"
                ? "错题练习"
                : "收藏练习"}
          </Badge>
          {question && <Text>第 {question.position} 题</Text>}
        </HStack>
      </HStack>
      {question && (
        <Card bg="white">
          <CardBody p={{ base: 5, md: 8 }}>
            <Progress
              value={
                (question.position / Math.max(question.questionCount, 1)) * 100
              }
              mb={6}
            />
            <Box>
              <Heading size="sm" mb={4}>
                题目
              </Heading>
              <LocalizedContent texts={question.questionTexts} />
            </Box>
            <Stack mt={7} spacing={3}>
              {multiple ? (
                question.options.map((option) => (
                  <Checkbox
                    key={option.key}
                    size="lg"
                    isChecked={selectedSet.has(option.key)}
                    isDisabled={Boolean(result)}
                    onChange={() => toggle(option.key)}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                  >
                    <HStack align="start" spacing={3} w="full">
                      <Text fontWeight="800">{option.key}.</Text>
                      <LocalizedContent texts={option.contentTexts} />
                    </HStack>
                  </Checkbox>
                ))
              ) : (
                <RadioGroup
                  value={selected[0] || ""}
                  onChange={(value) => setSelected([value])}
                  isDisabled={Boolean(result)}
                >
                  <Stack spacing={3}>
                    {question.options.map((option) => (
                      <Radio
                        key={option.key}
                        value={option.key}
                        size="lg"
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                      >
                        <HStack align="start" spacing={3} w="full">
                          <Text fontWeight="800">{option.key}.</Text>
                          <LocalizedContent texts={option.contentTexts} />
                        </HStack>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Stack>
            {result ? (
              <Alert
                status={result.correct ? "success" : "error"}
                mt={7}
                alignItems="start"
              >
                <AlertIcon />
                <Stack>
                  <AlertTitle>
                    {result.correct ? "回答正确" : "回答错误"}
                  </AlertTitle>
                  <AlertDescription>
                    正确答案：{result.correctOptionKeys.join("、")}
                  </AlertDescription>
                  {Object.values(result.explanationTexts || {}).some(
                    Boolean,
                  ) ? (
                    <LocalizedContent texts={result.explanationTexts} />
                  ) : (
                    <Text>暂无解析</Text>
                  )}
                </Stack>
              </Alert>
            ) : null}
            <HStack mt={7} flexWrap="wrap">
              <Button
                onClick={result ? () => void load() : () => void submit()}
                isDisabled={!result && !selected.length}
              >
                {result ? "下一题" : "提交答案"}
              </Button>
              <Button variant="outline" onClick={() => void favorite()}>
                {question.state.isFavorite ? "取消收藏" : "收藏"}
              </Button>
              {result && !result.correct && mode === "error_review" && (
                <Button variant="outline" onClick={() => void resolveError()}>
                  标记已掌握
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>
      )}
      <PageLoading visible={busy} label="正在处理题目…" />
    </VStack>
  );
}
