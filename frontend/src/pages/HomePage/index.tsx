import {
  Card,
  CardBody,
  Grid,
  Heading,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { request } from "@/http/request";
interface Stats {
  vocabularies: number;
  collections: number;
  learned: number;
  errors: number;
}
export function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    request<Stats>({ url: "/dashboard" }).then(setStats);
  }, []);
  const cards = [
    { key: "vocabularies", label: "核心词汇" },
    { key: "collections", label: "词汇集合" },
    { key: "learned", label: "已学习" },
    { key: "errors", label: "待强化错题" },
  ] as const;
  return (
    <Grid gap={7}>
      <div>
        <Heading size="lg">学习首页</Heading>
        <Text mt={2} color="gray.600">
          从统一知识库继续学习、复习与整理。
        </Text>
      </div>
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
        {cards.map((card) => (
          <Card key={card.key} borderTopWidth="4px" borderTopColor="brand.400">
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">{card.label}</StatLabel>
                <Skeleton isLoaded={Boolean(stats)} mt={2}>
                  <StatNumber color="brand.600">
                    {stats?.[card.key] ?? 0}
                  </StatNumber>
                </Skeleton>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Grid>
  );
}
