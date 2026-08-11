import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Heading,
  HStack,
  Progress,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "@/http/request";
import type { ResourceItem } from "@/types/api.types";
export function StudyPage({ testMode = false }: { testMode?: boolean }) {
  const { id } = useParams();
  const [items, setItems] = useState<ResourceItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const toast = useToast({ duration: 2000, position: "top" });
  useEffect(() => {
    request<ResourceItem[]>({ url: `/collections/${id}/members` }).then(
      setItems,
    );
  }, [id]);
  const item = items?.[index];
  const progress = useMemo(
    () => (items?.length ? ((index + 1) / items.length) * 100 : 0),
    [index, items],
  );
  const next = () => {
    setRevealed(false);
    setIndex((old) =>
      items?.length ? Math.min(old + 1, items.length - 1) : old,
    );
  };
  const record = async (action: "learn" | "review") => {
    if (!item) return;
    await request({
      method: "POST",
      url: `/vocabularies/${item.id}/${action}`,
    });
    toast({
      status: "success",
      title: action === "learn" ? "已记录学习" : "已记录复习",
    });
    next();
  };
  const answer = async (correct: boolean) => {
    if (!item) return;
    await request({
      method: "POST",
      url: "/test-answers",
      data: { vocabularyId: Number(item.id), correct },
    });
    toast({
      status: correct ? "success" : "warning",
      title: correct ? "回答正确" : "已加入错题强化",
    });
    next();
  };
  if (!items)
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  if (!item)
    return (
      <Center py={20}>
        <Text>集合中还没有词汇</Text>
      </Center>
    );
  return (
    <VStack maxW="760px" mx="auto" spacing={5} align="stretch">
      <Box>
        <HStack justify="space-between">
          <Heading size="md">{testMode ? "集合测试" : "集合学习"}</Heading>
          <Text>
            {index + 1} / {items.length}
          </Text>
        </HStack>
        <Progress mt={3} value={progress} colorScheme="blue" rounded="full" />
      </Box>
      <Card minH="390px" shadow="md">
        <CardBody display="grid" placeItems="center">
          <VStack spacing={5} textAlign="center">
            <Heading fontSize={{ base: "3xl", md: "5xl" }}>
              {String(item.word)}
            </Heading>
            {!testMode && (
              <Text fontSize="xl" color="gray.600">
                {String(item.reading || "")}
              </Text>
            )}
            {revealed ? (
              <Box>
                <Text fontSize="2xl">{String(item.translation)}</Text>
                {Boolean(item.notes) && (
                  <Text mt={3} color="gray.600">
                    {String(item.notes)}
                  </Text>
                )}
              </Box>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setRevealed(true)}
              >
                显示答案
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>
      {testMode ? (
        <HStack justify="center">
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => void answer(false)}
          >
            错误
          </Button>
          <Button colorScheme="green" onClick={() => void answer(true)}>
            正确
          </Button>
        </HStack>
      ) : (
        <HStack justify="center">
          <Button variant="outline" onClick={() => void record("learn")}>
            完成学习
          </Button>
          <Button onClick={() => void record("review")}>完成复习</Button>
          <Button variant="ghost" onClick={next}>
            跳过
          </Button>
        </HStack>
      )}
    </VStack>
  );
}
