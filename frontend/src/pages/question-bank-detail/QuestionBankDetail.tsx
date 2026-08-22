import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import { getQuestionBank, type QuestionBank } from '@/http/api/questions.api';
import { QUESTION_BANK_STATISTICS } from './config';

export function QuestionBankDetail() {
  const { id } = useParams();
  const [bank, setBank] = useState<QuestionBank | null>(null);

  useEffect(() => {
    void getQuestionBank(Number(id)).then(setBank);
  }, [id]);

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: '题库', path: '/q/questions' },
          { label: bank?.name || '详情' },
        ]}
      />
      {bank && (
        <>
          <HStack>
            <Badge>
              {bank.groupName} / {bank.subgroupName}
            </Badge>
          </HStack>
          <Heading size={{ base: 'lg', md: 'xl' }}>{bank.name}</Heading>
          <Text color="slate.600">{bank.description || '暂无说明'}</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {QUESTION_BANK_STATISTICS.map((statistic) => (
              <Card key={statistic.field}>
                <CardBody>
                  <Text color="slate.500">{statistic.label}</Text>
                  <Heading size="md" mt={2}>
                    {bank[statistic.field]}
                  </Heading>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
          <HStack flexWrap="wrap">
            <Button as={Link} to={`/q/questions/banks/${id}/practice`}>
              继续做题
            </Button>
            <Button
              as={Link}
              to={`/q/questions/banks/${id}/errors`}
              variant="outline"
            >
              错题练习
            </Button>
            <Button
              as={Link}
              to={`/q/questions/banks/${id}/favorites`}
              variant="outline"
            >
              收藏练习
            </Button>
          </HStack>
        </>
      )}
      <PageLoading visible={!bank} label="正在加载题库…" />
    </VStack>
  );
}
