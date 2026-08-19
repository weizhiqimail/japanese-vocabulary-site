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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import { getQuestionBank, type QuestionBank } from "@/http/api/questions.api";
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
          { label: "题库", path: "/questions" },
          { label: bank?.name || "详情" },
        ]}
      />
      {bank && (
        <>
          <HStack>
            <Badge>
              {bank.groupName} / {bank.subgroupName}
            </Badge>
          </HStack>
          <Heading>{bank.name}</Heading>
          <Text>{bank.description}</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {[
              ["总题数", bank.questionCount],
              ["已完成", bank.answeredCount],
              ["错题", bank.errorCount],
              ["收藏", bank.favoriteCount],
            ].map(([label, value]) => (
              <Card key={String(label)}>
                <CardBody>
                  <Text color="slate.500">{label}</Text>
                  <Heading size="md">{value}</Heading>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
          <HStack flexWrap="wrap">
            <Button as={Link} to={`/questions/banks/${id}/practice`}>
              继续做题
            </Button>
            <Button
              as={Link}
              to={`/questions/banks/${id}/errors`}
              variant="outline"
            >
              错题练习
            </Button>
            <Button
              as={Link}
              to={`/questions/banks/${id}/favorites`}
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
