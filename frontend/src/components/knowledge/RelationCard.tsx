import {
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { knowledgeName } from "@/components/common/format";
import type { KnowledgeResource, ResourceItem } from "@/types/api.types";

export function RelationCard({
  items,
  onManage,
  resource,
  title,
}: {
  items: ResourceItem[];
  onManage(): void;
  resource: KnowledgeResource;
  title: string;
}) {
  return (
    <Card bg="white">
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">{title}</Heading>
          <Button size="sm" variant="outline" onClick={onManage}>
            管理关联
          </Button>
        </Flex>
        <Stack spacing={2}>
          {items.length ? (
            items.map((item) => (
              <Text
                key={String(item.id)}
                as={Link}
                to={`/${resource}/${item.id}`}
                bg="brand.50"
                borderRadius="md"
                px={3}
                py={2}
                color="brand.800"
                fontWeight="600"
              >
                {knowledgeName(item)}
              </Text>
            ))
          ) : (
            <Text color="slate.500">暂无关联</Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
