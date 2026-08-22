import {
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import {
  getDashboardStatistics,
  type DashboardStatistics,
} from '@/http/api/dashboard.api';

const cards = [
  { key: 'vocabularies', label: '词汇', path: '/vocabularies' },
  { key: 'collections', label: '集合', path: '/collections' },
  { key: 'grammars', label: '语法', path: '/grammars' },
  { key: 'sentences', label: '句子', path: '/sentences' },
] as const;

/** 首页独立页面级组件。 */
export function Home() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(
    null,
  );

  useEffect(() => {
    void getDashboardStatistics().then(setStatistics);
  }, []);

  return (
    <VStack align="stretch" spacing={7}>
      <PageBreadcrumb items={[{ label: '首页' }]} />
      <Heading size="xl">首页</Heading>
      <Text color="slate.500" fontSize="lg">
        整理词汇、语法和句子，并从集合开始学习。
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={5}>
        {cards.map((card) => (
          <Card key={card.key} as={Link} to={card.path} bg="white">
            <CardBody>
              <Text color="slate.500">{card.label}</Text>
              <Heading mt={3} color="brand.800">
                {statistics?.[card.key] ?? 0}
              </Heading>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
      <Card bg="brand.100">
        <CardBody>
          <Heading size="md">从一个集合开始</Heading>
          <Text mt={2} color="slate.600">
            学习、测试并把错误词汇自动加入错题本。
          </Text>
          <Button as={Link} to="/collections" mt={5}>
            查看集合
          </Button>
        </CardBody>
      </Card>
      <PageLoading visible={!statistics} label="正在加载首页…" />
    </VStack>
  );
}
