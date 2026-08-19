import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import {
  getQuestionBanks,
  getQuestionGroups,
  type QuestionBank,
  type QuestionGroup,
} from "@/http/api/questions.api";

export function QuestionBanks() {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [subgroups, setSubgroups] = useState<QuestionGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [subgroupId, setSubgroupId] = useState("");
  const [q, setQ] = useState("");
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    void getQuestionGroups().then(setGroups);
  }, []);
  useEffect(() => {
    setSubgroupId("");
    if (!groupId) return setSubgroups([]);
    void getQuestionGroups(Number(groupId)).then(setSubgroups);
  }, [groupId]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusy(true);
      void getQuestionBanks({
        pageNum: 1,
        pageSize: 20,
        q: q || undefined,
        groupId: groupId ? Number(groupId) : undefined,
        subgroupId: subgroupId ? Number(subgroupId) : undefined,
      })
        .then((result) => setBanks(result.data))
        .finally(() => setBusy(false));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [groupId, subgroupId, q]);
  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb items={[{ label: "题库" }]} />
      <Heading size="xl">题库</Heading>
      <Text color="slate.500">按大组和小组查找固定题库，继续上次进度。</Text>
      <Stack direction={{ base: "column", md: "row" }}>
        <Select
          placeholder="全部大组"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <Select
          placeholder="全部小组"
          value={subgroupId}
          onChange={(e) => setSubgroupId(e.target.value)}
          isDisabled={!groupId}
        >
          {subgroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="搜索题库"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Stack>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {banks.map((bank) => {
          const answered = Number(bank.answeredCount);
          const total = Number(bank.questionCount);
          return (
            <Card key={bank.id} bg="white">
              <CardBody>
                <HStack justify="space-between">
                  <Badge>
                    {bank.groupName} / {bank.subgroupName}
                  </Badge>
                  <Text color="slate.500">
                    {answered} / {total}
                  </Text>
                </HStack>
                <Heading size="md" mt={4}>
                  {bank.name}
                </Heading>
                <Text mt={2} color="slate.500">
                  {bank.description}
                </Text>
                <Progress
                  mt={5}
                  value={total ? (answered / total) * 100 : 0}
                  rounded="full"
                />
                <SimpleGrid columns={3} mt={4} gap={3}>
                  <Box>
                    <Text fontSize="sm">正确</Text>
                    <Text fontWeight="700">{bank.correctCount}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm">错题</Text>
                    <Text fontWeight="700">{bank.errorCount}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm">收藏</Text>
                    <Text fontWeight="700">{bank.favoriteCount}</Text>
                  </Box>
                </SimpleGrid>
                <HStack mt={5}>
                  <Button as={Link} to={`/questions/banks/${bank.id}/practice`}>
                    {bank.status === "completed"
                      ? "已完成"
                      : answered
                        ? `继续第 ${bank.currentPosition} 题`
                        : "开始做题"}
                  </Button>
                  <Button
                    as={Link}
                    to={`/questions/banks/${bank.id}`}
                    variant="outline"
                  >
                    详情
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
      {!busy && !banks.length && <Text>没有符合条件的题库。</Text>}
      <PageLoading visible={busy} label="正在加载题库…" />
    </VStack>
  );
}
