import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  SimpleGrid,
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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { displayValue, formatDateTime } from '@/components/common/format';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import { TagBadge } from '@/components/common/TagBadge';
import { KnowledgeEditorModal } from '@/components/knowledge/KnowledgeEditorModal';
import { VocabularyVisibilityControls } from '@/components/vocabulary/VocabularyVisibilityControls';
import { useVocabularyVisibility } from '@/components/vocabulary/useVocabularyVisibility';
import { PageHeader } from '@/components/common/PageHeader';
import { KNOWLEDGE_CONFIG } from '@/config/resources';
import {
  deleteGrammar,
  getGrammar,
  getGrammars,
} from '@/http/api/grammars.api';
import {
  deleteSentence,
  getSentence,
  getSentences,
} from '@/http/api/sentences.api';
import {
  deleteVocabulary,
  getVocabulary,
  getVocabularies,
} from '@/http/api/vocabularies.api';
import type {
  KnowledgeResource,
  PaginatedData,
  ResourceItem,
} from '@/types/api.types';

const pageSizes = [10, 20, 30, 50, 100];

async function loadResource(
  resource: KnowledgeResource,
  params: { pageNum: number; pageSize: number; q: string },
) {
  return resource === 'vocabularies'
    ? getVocabularies(params)
    : resource === 'grammars'
      ? getGrammars(params)
      : getSentences(params);
}

async function loadDetail(resource: KnowledgeResource, id: number) {
  return resource === 'vocabularies'
    ? getVocabulary(id)
    : resource === 'grammars'
      ? getGrammar(id)
      : getSentence(id);
}

async function removeResource(resource: KnowledgeResource, id: number) {
  return resource === 'vocabularies'
    ? deleteVocabulary(id)
    : resource === 'grammars'
      ? deleteGrammar(id)
      : deleteSentence(id);
}

function valueForColumn(item: ResourceItem, key: string) {
  return key.endsWith('_at')
    ? formatDateTime(item[key])
    : displayValue(item[key]);
}

function tagBadges(value: unknown) {
  return String(value || '')
    .split(';;')
    .filter(Boolean)
    .map((entry) => {
      const [name, color] = entry.split('|');
      return (
        <TagBadge key={entry} color={color}>
          {name}
        </TagBadge>
      );
    });
}

/** 各知识列表页面复用的数据视图；路由入口仍由独立页面级组件承接。 */
export function KnowledgeResourceList({
  resource,
}: {
  resource: KnowledgeResource;
}) {
  const config = KNOWLEDGE_CONFIG[resource];
  const [search, setSearch] = useSearchParams();
  const [mobile] = useMediaQuery('(max-width: 767px)');
  const [result, setResult] = useState<PaginatedData<ResourceItem> | null>(
    null,
  );
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [removing, setRemoving] = useState<ResourceItem | null>(null);
  const {
    setVisibility,
    toggle: toggleReveal,
    value: showVocabularyValue,
    visibility,
  } = useVocabularyVisibility();
  const editor = useDisclosure();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const pageNum = Number(search.get('pageNum') || 1);
  const pageSize = Number(search.get('pageSize') || 20);
  const q = search.get('q') || '';

  const load = useCallback(async () => {
    setBusy(true);

    try {
      setResult(await loadResource(resource, { pageNum, pageSize, q }));
    } finally {
      setBusy(false);
    }
  }, [pageNum, pageSize, q, resource]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSearch = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(search);
    Object.entries(values).forEach(([key, value]) =>
      value === '' ? next.delete(key) : next.set(key, String(value)),
    );
    setSearch(next);
  };

  const openEditor = async (item?: ResourceItem) => {
    setBusy(true);

    try {
      setEditing(item ? await loadDetail(resource, Number(item.id)) : null);
      editor.onOpen();
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
      await removeResource(resource, Number(removing.id));
      confirm.onClose();
      setRemoving(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil((result?.pagination.total || 0) / pageSize),
  );

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[{ label: '首页', path: '/' }, { label: config.title }]}
      />
      <PageHeader
        title={config.title}
        description={config.description}
        actionLabel={`新增${config.singular}`}
        onAction={() => void openEditor()}
      />
      {resource === 'vocabularies' && (
        <VocabularyVisibilityControls
          value={visibility}
          onChange={setVisibility}
        />
      )}
      <Box
        as="form"
        onSubmit={(event: FormEvent<HTMLDivElement>) => {
          event.preventDefault();
          const element = event.currentTarget as unknown as HTMLFormElement;
          updateSearch({
            q: (element.elements.namedItem('q') as HTMLInputElement).value,
            pageNum: 1,
          });
        }}
      >
        <Flex gap={3} direction={{ base: 'column', md: 'row' }}>
          <Input
            name="q"
            defaultValue={q}
            bg="white"
            placeholder="输入关键词"
            size="lg"
          />
          <Button type="submit" size="lg" minW="110px">
            查询
          </Button>
        </Flex>
      </Box>
      {mobile ? (
        <SimpleGrid columns={1} spacing={3}>
          {result?.data.map((item) => (
            <Card
              key={String(item.id)}
              as={Link}
              to={`/${resource}/${item.id}`}
              bg="white"
              _hover={{ borderColor: 'brand.300' }}
            >
              <CardBody>
                <Text fontWeight="700" fontSize="lg" color="brand.800">
                  {displayValue(item[config.primary])}
                </Text>
                {config.secondary && (
                  <Text mt={1} color="slate.500">
                    {displayValue(item[config.secondary])}
                  </Text>
                )}
                <Text mt={3}>
                  {displayValue(item.translation || item.meaning)}
                </Text>
                <HStack mt={3} wrap="wrap">
                  {tagBadges(item.tag_badges)}
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
                {config.columns.map((column) => (
                  <Th key={column.key}>{column.label}</Th>
                ))}
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {result?.data.map((item) => (
                <Tr key={String(item.id)} _hover={{ bg: 'brand.50' }}>
                  {config.columns.map((column) => {
                    const vocabularyField =
                      resource === 'vocabularies' &&
                      ['word', 'reading', 'translation'].includes(column.key);
                    const content = vocabularyField ? (
                      showVocabularyValue(
                        item,
                        column.key as 'word' | 'reading' | 'translation',
                      )
                    ) : column.key === 'tag_names' ? (
                      <HStack wrap="wrap">{tagBadges(item.tag_badges)}</HStack>
                    ) : (
                      valueForColumn(item, column.key)
                    );

                    return (
                      <Td
                        key={column.key}
                        maxW="360px"
                        whiteSpace="normal"
                        onClick={() =>
                          vocabularyField && toggleReveal(item, column.key)
                        }
                        cursor={vocabularyField ? 'pointer' : undefined}
                      >
                        {column.key === config.primary && content !== '•••' ? (
                          <Text
                            as={Link}
                            to={`/${resource}/${item.id}`}
                            color="brand.800"
                            fontWeight="700"
                          >
                            {content}
                          </Text>
                        ) : (
                          content
                        )}
                      </Td>
                    );
                  })}
                  <Td>
                    <HStack>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => void openEditor(item)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setRemoving(item);
                          confirm.onOpen();
                        }}
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
      <Flex justify="center" align="center" gap={4} wrap="wrap">
        <Button
          isDisabled={pageNum <= 1}
          onClick={() => updateSearch({ pageNum: pageNum - 1 })}
        >
          上一页
        </Button>
        <Text>
          {pageNum} / {totalPages}
        </Text>
        <Button
          isDisabled={pageNum >= totalPages}
          onClick={() => updateSearch({ pageNum: pageNum + 1 })}
        >
          下一页
        </Button>
        <select
          value={pageSize}
          onChange={(event) =>
            updateSearch({ pageSize: event.target.value, pageNum: 1 })
          }
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size} 条
            </option>
          ))}
        </select>
      </Flex>
      <KnowledgeEditorModal
        resource={resource}
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        initialValue={editing}
        onSaved={load}
      />
      <AlertDialog
        isOpen={confirm.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={confirm.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>确认删除</AlertDialogHeader>
            <AlertDialogBody>
              该操作为逻辑删除，历史数据仍会保留。
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
