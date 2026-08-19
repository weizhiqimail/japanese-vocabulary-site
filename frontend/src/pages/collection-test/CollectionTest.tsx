import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import { getCollection } from "@/http/api/collections.api";
import {
  getTestQuestions,
  submitTestAnswer,
  type TestQuestion,
} from "@/http/api/study.api";
import type { ResourceItem } from "@/types/api.types";
import type { TestResult } from "./types";

/** 每组固定请求十个词汇，完成后展示整组结果和错题归集状态。 */
export function CollectionTest() {
  const { id } = useParams();
  const collectionId = Number(id);
  const navigate = useNavigate();
  const [collection, setCollection] = useState<ResourceItem | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const [detail, group] = await Promise.all([
        getCollection(collectionId),
        getTestQuestions(collectionId),
      ]);
      setCollection(detail);
      setQuestions(group);
      setResults([]);
      setIndex(0);
    } finally {
      setBusy(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const question = questions[index];
  const complete = questions.length > 0 && results.length === questions.length;

  const answer = async (selected: string) => {
    if (!question || busy) {
      return;
    }

    const correct = selected === question.translation;
    setBusy(true);

    try {
      await submitTestAnswer(Number(question.id), correct);
      setResults((current) => [...current, { correct, question, selected }]);
      setIndex((current) => current + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: "集合", path: "/words/collections" },
          { label: String(collection?.name || "测试") },
        ]}
      />
      <Heading size="xl">{String(collection?.name || "集合测试")}</Heading>
      {complete ? (
        <Card bg="white">
          <CardBody p={{ base: 5, md: 8 }}>
            <Heading size="lg" mb={5}>
              本组测试结果
            </Heading>
            <Stack spacing={3}>
              {results.map((result, resultIndex) => (
                <HStack
                  key={`${String(result.question.id)}-${resultIndex}`}
                  justify="space-between"
                  align="start"
                  borderBottomWidth="1px"
                  borderColor="brand.100"
                  pb={3}
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="700">
                      {result.question.word}　{result.question.reading || ""}
                    </Text>
                    <Text color="slate.500">
                      正确答案：{result.question.translation}
                    </Text>
                    {!result.correct && (
                      <Text color="red.600">你的答案：{result.selected}</Text>
                    )}
                  </VStack>
                  <Badge colorScheme={result.correct ? "green" : "red"}>
                    {result.correct ? "正确" : "已加入错题本"}
                  </Badge>
                </HStack>
              ))}
            </Stack>
            <HStack mt={7}>
              <Button onClick={() => void load()}>再来一组</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                返回
              </Button>
            </HStack>
          </CardBody>
        </Card>
      ) : question ? (
        <Card maxW="1000px" w="full" mx="auto" bg="white">
          <CardBody p={{ base: 5, md: 9 }}>
            <Progress
              value={(results.length / Math.max(questions.length, 1)) * 100}
              colorScheme="orange"
              rounded="full"
            />
            <VStack spacing={7} py={{ base: 8, md: 12 }}>
              <Text color="slate.500">
                第 {index + 1} / {questions.length} 题
              </Text>
              <Heading fontSize={{ base: "3xl", md: "5xl" }}>
                {question.word}
              </Heading>
              <Text color="slate.500">{question.reading || "—"}</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    minH="72px"
                    h="auto"
                    whiteSpace="normal"
                    variant="outline"
                    onClick={() => void answer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      ) : !busy ? (
        <Text>集合中没有可测试的词汇。</Text>
      ) : null}
      <PageLoading visible={busy} label="正在准备测试…" />
    </VStack>
  );
}
