import {
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "@/http/request";
import type { ResourceItem } from "@/types/api.types";
export function ReviewPage() {
  const { mode = "errors" } = useParams();
  const [items, setItems] = useState<ResourceItem[] | null>(null);
  useEffect(() => {
    request<ResourceItem[]>({ url: `/review/${mode}` }).then(setItems);
  }, [mode]);
  return (
    <VStack align="stretch" spacing={5}>
      <Heading size="lg">
        {mode === "errors"
          ? "错题强化"
          : mode === "favorites"
            ? "收藏本"
            : "掌握记录"}
      </Heading>
      {!items ? (
        <Spinner />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {items.map((item) => (
            <Card key={String(item.id)}>
              <CardBody>
                <Heading size="md">{String(item.word)}</Heading>
                <Text color="gray.600">{String(item.reading || "")}</Text>
                <Text mt={3}>{String(item.translation)}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}
