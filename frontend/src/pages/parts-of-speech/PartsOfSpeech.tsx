import {
  Badge,
  Button,
  Card,
  CardBody,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { InlineField } from "@/components/common/InlineField";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoading } from "@/components/common/PageLoading";
import {
  getPartsOfSpeech,
  savePartOfSpeech,
  type SavePartOfSpeechInput,
} from "@/http/api/parts-of-speech.api";
import type { ResourceItem } from "@/types/api.types";

/** 词性独立页面：服务端按序号升序，序号只读且新增时自动最大值加十。 */
export function PartsOfSpeech() {
  const modal = useDisclosure();
  const [mobile] = useMediaQuery("(max-width: 767px)");
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState<SavePartOfSpeechInput>({
    name: "",
    code: "",
    enabled: true,
  });
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setItems((await getPartsOfSpeech({ pageNum: 1, pageSize: 100 })).data);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (item?: ResourceItem) => {
    setForm(
      item
        ? {
            partOfSpeechId: Number(item.id),
            name: String(item.name || ""),
            code: String(item.code || ""),
            enabled: Boolean(item.enabled),
          }
        : { name: "", code: "", enabled: true },
    );
    modal.onOpen();
  };

  const save = async () => {
    setBusy(true);
    try {
      await savePartOfSpeech(form);
      modal.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: "管理", path: "/words/manage/words/tags" },
          { label: "词性" },
        ]}
      />
      <PageHeader
        title="词性"
        description="固定词性按序号从小到大排列。"
        actionLabel="新增词性"
        onAction={() => open()}
      />
      {mobile ? (
        <SimpleGrid columns={1} spacing={3}>
          {items.map((item) => (
            <Card key={String(item.id)} bg="white">
              <CardBody>
                <Text fontWeight="700">{String(item.name)}</Text>
                <Text color="slate.500" mt={1}>
                  {String(item.code)}
                </Text>
                <HStack mt={3}>
                  <Badge>序号 {String(item.sort_order)}</Badge>
                  <Badge colorScheme={item.enabled ? "green" : "gray"}>
                    {item.enabled ? "启用" : "停用"}
                  </Badge>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <TableContainer
          bg="white"
          borderWidth="1px"
          borderColor="brand.100"
          rounded="xl"
        >
          <Table>
            <Thead bg="brand.50">
              <Tr>
                <Th>名称</Th>
                <Th>代码</Th>
                <Th>序号</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={String(item.id)}>
                  <Td fontWeight="700">{String(item.name)}</Td>
                  <Td>{String(item.code)}</Td>
                  <Td>{String(item.sort_order)}</Td>
                  <Td>
                    <Badge colorScheme={item.enabled ? "green" : "gray"}>
                      {item.enabled ? "启用" : "停用"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => open(item)}
                    >
                      编辑
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {form.partOfSpeechId ? "编辑词性" : "新增词性"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InlineField label="名称" isRequired>
                <Input
                  value={String(form.name || "")}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </InlineField>
              <InlineField label="代码" isRequired={!form.partOfSpeechId}>
                <Input
                  value={String(form.code || "")}
                  isReadOnly={Boolean(form.partOfSpeechId)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                />
              </InlineField>
              <InlineField label="序号">
                <Input
                  value={
                    form.partOfSpeechId
                      ? String(
                          items.find(
                            (item) => Number(item.id) === form.partOfSpeechId,
                          )?.sort_order || "—",
                        )
                      : "保存时自动生成"
                  }
                  isReadOnly
                />
              </InlineField>
              <InlineField label="状态">
                <Switch
                  isChecked={Boolean(form.enabled)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      enabled: event.target.checked,
                    }))
                  }
                >
                  启用
                </Switch>
              </InlineField>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={modal.onClose}>
              取消
            </Button>
            <Button onClick={() => void save()}>保存</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PageLoading visible={busy} />
    </VStack>
  );
}
