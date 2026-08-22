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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoading } from '@/components/common/PageLoading';
import {
  getQuestionBanks,
  getQuestionGroups,
  type QuestionBank,
  type QuestionGroup,
} from '@/http/api/questions.api';
import { getQuestionBankActionLabel, QUESTION_BANK_LIST } from './config';

export function QuestionBanks() {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [subgroups, setSubgroups] = useState<QuestionGroup[]>([]);
  const [groupId, setGroupId] = useState('');
  const [subgroupId, setSubgroupId] = useState('');
  const [q, setQ] = useState('');
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    void getQuestionGroups().then(setGroups);
  }, []);

  useEffect(() => {
    setSubgroupId('');
    if (!groupId) {
      setSubgroups([]);
      return;
    }
    void getQuestionGroups(Number(groupId)).then(setSubgroups);
  }, [groupId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusy(true);
      void getQuestionBanks({
        pageNum: QUESTION_BANK_LIST.pageNum,
        pageSize: QUESTION_BANK_LIST.pageSize,
        q: q || undefined,
        groupId: groupId ? Number(groupId) : undefined,
        subgroupId: subgroupId ? Number(subgroupId) : undefined,
      })
        .then((result) => setBanks(result.data))
        .finally(() => setBusy(false));
    }, QUESTION_BANK_LIST.searchDelayMs);
    return () => window.clearTimeout(timer);
  }, [groupId, subgroupId, q]);

  return (
    <VStack align="stretch" spacing={{ base: 5, md: 7 }}>
      <Box>
        <Heading size={{ base: 'lg', md: 'xl' }}>题库</Heading>
        <Text color="slate.500" mt={2}>
          按分组查找题库，继续上次的做题进度。
        </Text>
      </Box>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
        <Select
          placeholder="全部大组"
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          bg="white"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <Select
          placeholder="全部小组"
          value={subgroupId}
          onChange={(event) => setSubgroupId(event.target.value)}
          isDisabled={!groupId}
          bg="white"
        >
          {subgroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="搜索题库"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          bg="white"
        />
      </Stack>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {banks.map((bank) => {
          const answered = Number(bank.answeredCount);
          const total = Number(bank.questionCount);
          return (
            <Card key={bank.id} bg="white">
              <CardBody p={{ base: 5, md: 6 }}>
                <HStack justify="space-between" align="start">
                  <Badge whiteSpace="normal">
                    {bank.groupName} / {bank.subgroupName}
                  </Badge>
                  <Text color="slate.500" flexShrink={0}>
                    {answered} / {total}
                  </Text>
                </HStack>
                <Heading size="md" mt={4}>
                  {bank.name}
                </Heading>
                <Text mt={2} color="slate.500">
                  {bank.description || '暂无说明'}
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
                <HStack mt={5} flexWrap="wrap">
                  <Button
                    as={Link}
                    to={`/q/questions/banks/${bank.id}/practice`}
                  >
                    {getQuestionBankActionLabel(bank)}
                  </Button>
                  <Button
                    as={Link}
                    to={`/q/questions/banks/${bank.id}`}
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
      {!busy && !banks.length && (
        <Text textAlign="center" py={12}>
          没有符合条件的题库。
        </Text>
      )}
      <PageLoading visible={busy} label="正在加载题库…" />
    </VStack>
  );
}
