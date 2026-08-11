import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InlineField } from "@/components/common/InlineField";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoading } from "@/components/common/PageLoading";
import {
  deleteCollection,
  getCollection,
  getCollections,
  saveCollection,
  type CollectionType,
  type SaveCollectionInput,
} from "@/http/api/collections.api";
import type { ResourceItem } from "@/types/api.types";
import { COLLECTION_TYPES } from "./config";

const emptyForm: SaveCollectionInput = {
  name: "",
  type: "custom",
  source: "",
  description: "",
};

function collectionType(value: unknown): CollectionType {
  return ["source", "custom", "favorite", "error"].includes(String(value))
    ? (value as CollectionType)
    : "custom";
}

/** 词汇集合独立页面，卡片菜单负责编辑和逻辑删除。 */
export function Collections() {
  const navigate = useNavigate();
  const editor = useDisclosure();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState<SaveCollectionInput>(emptyForm);
  const [removing, setRemoving] = useState<ResourceItem | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      setItems((await getCollections({ pageNum: 1, pageSize: 100 })).data);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openEditor = async (item?: ResourceItem) => {
    setBusy(true);

    try {
      const detail = item ? await getCollection(Number(item.id)) : null;
      setForm(
        detail
          ? {
              collectionId: Number(detail.id),
              name: String(detail.name || ""),
              type: collectionType(detail.type),
              source: String(detail.source || ""),
              description: String(detail.description || ""),
            }
          : emptyForm,
      );
      editor.onOpen();
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);

    try {
      await saveCollection(form);
      editor.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!removing) {
      return;
    }

    setBusy(true);

    try {
      await deleteCollection(Number(removing.id));
      confirm.onClose();
      setRemoving(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const update = <Key extends keyof SaveCollectionInput>(
    key: Key,
    value: SaveCollectionInput[Key],
  ) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[{ label: "首页", path: "/" }, { label: "集合" }]}
      />
      <PageHeader
        title="词汇集合"
        description="从来源集合或自建集合开始学习和测试。"
        actionLabel="新增集合"
        onAction={() => void openEditor()}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
        {items.map((item) => {
          const type =
            COLLECTION_TYPES.find((entry) => entry.value === item.type) ||
            COLLECTION_TYPES[0];

          return (
            <Card key={String(item.id)} bg="white">
              <CardBody p={6}>
                <Flex justify="space-between" align="start" gap={3}>
                  <Box minW={0}>
                    <HStack wrap="wrap">
                      <Text fontWeight="700" fontSize="xl">
                        {String(item.name)}
                      </Text>
                      <Badge colorScheme={type.scheme}>{type.label}</Badge>
                    </HStack>
                    <Text mt={3} color="slate.500" minH="48px">
                      {String(item.description || item.source || "—")}
                    </Text>
                  </Box>
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={IconButton}
                      aria-label="集合操作"
                      icon={<Text fontWeight="900">•••</Text>}
                      size="sm"
                      variant="ghost"
                    />
                    <MenuList minW="130px">
                      <MenuItem onClick={() => void openEditor(item)}>
                        编辑
                      </MenuItem>
                      <MenuItem
                        color="red.600"
                        onClick={() => {
                          setRemoving(item);
                          confirm.onOpen();
                        }}
                      >
                        删除
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
                <Divider my={4} />
                <HStack color="slate.500" mb={4}>
                  <Text>{String(item.member_count || 0)} 词汇</Text>
                  <Text>{String(item.learned_count || 0)} 已学习</Text>
                </HStack>
                <HStack>
                  <Button
                    flex="1"
                    variant="outline"
                    onClick={() => navigate(`/collections/${item.id}/study`)}
                  >
                    学习
                  </Button>
                  <Button
                    flex="1"
                    onClick={() => navigate(`/collections/${item.id}/test`)}
                  >
                    测试
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
      <Modal isOpen={editor.isOpen} onClose={editor.onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {form.collectionId ? "编辑集合" : "新增集合"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InlineField label="集合名称" isRequired>
                <Input
                  value={String(form.name || "")}
                  onChange={(event) => update("name", event.target.value)}
                />
              </InlineField>
              <InlineField label="集合类型">
                <Select
                  value={String(form.type || "custom")}
                  onChange={(event) =>
                    update("type", collectionType(event.target.value))
                  }
                >
                  {COLLECTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </InlineField>
              <InlineField label="来源">
                <Input
                  value={String(form.source || "")}
                  onChange={(event) => update("source", event.target.value)}
                />
              </InlineField>
              <InlineField label="说明">
                <Textarea
                  value={String(form.description || "")}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                />
              </InlineField>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editor.onClose}>
              取消
            </Button>
            <Button onClick={() => void save()}>保存</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={confirm.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={confirm.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>确认删除集合</AlertDialogHeader>
            <AlertDialogBody>
              集合将被逻辑删除，成员与历史记录不会物理移除。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={confirm.onClose}>
                取消
              </Button>
              <Button colorScheme="red" ml={3} onClick={() => void remove()}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <PageLoading visible={busy} />
    </VStack>
  );
}
