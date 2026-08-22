import {
  Button,
  Card,
  CardBody,
  HStack,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { ResourceItem } from "@/types/api.types";
import { VocabularyVisibilityControls } from "./VocabularyVisibilityControls";
import { useVocabularyVisibility } from "./useVocabularyVisibility";

interface VocabularyStudyListProps {
  items: ResourceItem[];
  onRecord(item: ResourceItem, eventType: "learn" | "review"): void;
}

/** 集合学习和词库学习共用的显示/默记规则。 */
export function VocabularyStudyList({
  items,
  onRecord,
}: VocabularyStudyListProps) {
  const [mobile] = useMediaQuery("(max-width: 767px)");
  const {
    setVisibility,
    toggle: reveal,
    value,
    visibility,
  } = useVocabularyVisibility();

  return (
    <VStack align="stretch" spacing={4}>
      <VocabularyVisibilityControls
        value={visibility}
        onChange={setVisibility}
      />
      {mobile ? (
        <SimpleGrid columns={1} spacing={3}>
          {items.map((item) => (
            <Card key={String(item.id)} bg="white">
              <CardBody>
                <Text
                  as={Link}
                  to={`/vocabularies/${item.id}`}
                  color="brand.800"
                  fontWeight="700"
                  fontSize="lg"
                >
                  {value(item, "word")}
                </Text>
                <Text mt={1} onClick={() => reveal(item, "reading")}>
                  {value(item, "reading")}
                </Text>
                <Text mt={2} onClick={() => reveal(item, "translation")}>
                  {value(item, "translation")}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <TableContainer
          bg="white"
          borderWidth="1px"
          borderColor="brand.100"
          borderRadius="xl"
        >
          <Table>
            <Thead bg="brand.50">
              <Tr>
                <Th>词汇</Th>
                <Th>假名</Th>
                <Th>翻译</Th>
                <Th textAlign="right">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={String(item.id)}>
                  <Td onClick={() => reveal(item, "word")} cursor="pointer">
                    {value(item, "word") === "•••" ? (
                      <Text as="span" color="brand.800" fontWeight="700">
                        •••
                      </Text>
                    ) : (
                      <Text
                        as={Link}
                        to={`/vocabularies/${item.id}`}
                        color="brand.800"
                        fontWeight="700"
                      >
                        {value(item, "word")}
                      </Text>
                    )}
                  </Td>
                  <Td onClick={() => reveal(item, "reading")} cursor="pointer">
                    {value(item, "reading")}
                  </Td>
                  <Td
                    onClick={() => reveal(item, "translation")}
                    cursor="pointer"
                  >
                    {value(item, "translation")}
                  </Td>
                  <Td>
                    <HStack justify="flex-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRecord(item, "review")}
                      >
                        复习
                      </Button>
                      <Button size="sm" onClick={() => onRecord(item, "learn")}>
                        已学习
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </VStack>
  );
}
