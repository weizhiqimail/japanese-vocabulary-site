import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
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
  SimpleGrid,
  Stack,
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
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { InlineField } from '@/components/common/InlineField';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLoading } from '@/components/common/PageLoading';
import { TagBadge } from '@/components/common/TagBadge';
import {
  deleteTag,
  getTags,
  saveTag,
  TAG_COLORS,
  type SaveTagInput,
} from '@/http/api/tags.api';
import type { ResourceItem } from '@/types/api.types';

/** 标签管理独立页面，颜色只能从固定十色中选择。 */
export function Tags() {
  const modal = useDisclosure();
  const [mobile] = useMediaQuery('(max-width: 767px)');
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState<SaveTagInput>({
    name: '',
    color: TAG_COLORS[0],
  });
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setItems((await getTags({ pageNum: 1, pageSize: 100 })).data);
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
            tagId: Number(item.id),
            name: String(item.name || ''),
            color: TAG_COLORS.includes(
              item.color as (typeof TAG_COLORS)[number],
            )
              ? (item.color as (typeof TAG_COLORS)[number])
              : TAG_COLORS[0],
          }
        : { name: '', color: TAG_COLORS[0] },
    );
    modal.onOpen();
  };

  const save = async () => {
    setBusy(true);
    try {
      await saveTag(form);
      modal.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: ResourceItem) => {
    if (!window.confirm(`确认逻辑删除标签“${String(item.name)}”吗？`)) return;
    setBusy(true);
    try {
      await deleteTag(Number(item.id));
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: '管理', path: '/w/words/manage/tags' },
          { label: '标签' },
        ]}
      />
      <PageHeader
        title="标签"
        description="标签颜色使用固定浅色背景，应用于词汇、语法和句子。"
        actionLabel="新增标签"
        onAction={() => open()}
      />
      {mobile ? (
        <SimpleGrid columns={1} spacing={3}>
          {items.map((item) => (
            <Card key={String(item.id)} bg="white">
              <CardBody>
                <Flex justify="space-between">
                  <TagBadge color={item.color}>{String(item.name)}</TagBadge>
                  <Badge colorScheme={item.enabled ? 'green' : 'gray'}>
                    {item.enabled ? '启用' : '停用'}
                  </Badge>
                </Flex>
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
                <Th>颜色</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={String(item.id)}>
                  <Td>
                    <TagBadge color={item.color}>{String(item.name)}</TagBadge>
                  </Td>
                  <Td>
                    <HStack>
                      <Box
                        w="28px"
                        h="28px"
                        bg={String(item.color)}
                        borderRadius="md"
                        borderWidth="1px"
                      />
                      <Text>{String(item.color)}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={item.enabled ? 'green' : 'gray'}>
                      {item.enabled ? '启用' : '停用'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => open(item)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => void remove(item)}
                      >
                        删除
                      </Button>
                    </HStack>
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
          <ModalHeader>{form.tagId ? '编辑标签' : '新增标签'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <InlineField label="名称" isRequired>
                <Input
                  value={String(form.name || '')}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </InlineField>
              <InlineField label="颜色">
                <Menu>
                  <MenuButton as={Button} variant="outline" w="full">
                    <HStack>
                      <Box
                        w="22px"
                        h="22px"
                        borderRadius="md"
                        bg={String(form.color)}
                      />
                      <Text>{String(form.color)}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <SimpleGrid columns={5} gap={2} p={2}>
                      {TAG_COLORS.map((color) => (
                        <MenuItem
                          key={color}
                          p={1}
                          onClick={() =>
                            setForm((current) => ({ ...current, color }))
                          }
                        >
                          <Box
                            w="36px"
                            h="36px"
                            bg={color}
                            borderRadius="md"
                            borderWidth="1px"
                          />
                        </MenuItem>
                      ))}
                    </SimpleGrid>
                  </MenuList>
                </Menu>
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
