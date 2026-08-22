import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { displayValue, formatDateTime } from '@/components/common/format';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import { TagBadge } from '@/components/common/TagBadge';
import { KnowledgeEditorModal } from '@/components/knowledge/KnowledgeEditorModal';
import { RelationCard } from '@/components/knowledge/RelationCard';
import { RelationManagerModal } from '@/components/knowledge/RelationManagerModal';
import { deleteVocabulary, getVocabulary } from '@/http/api/vocabularies.api';
import type { ResourceItem } from '@/types/api.types';

const fields = [
  ['word', '词汇'],
  ['reading', '假名'],
  ['translation', '翻译'],
  ['notes', '备注'],
] as const;

/** 词汇详情独立页面，包含编辑、造句及语法/句子关联。 */
export function VocabularyDetail() {
  const { id } = useParams();
  const wordId = Number(id);
  const navigate = useNavigate();
  const editor = useDisclosure();
  const sentenceCreator = useDisclosure();
  const grammarRelations = useDisclosure();
  const sentenceRelations = useDisclosure();
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setItem(await getVocabulary(wordId));
    } finally {
      setBusy(false);
    }
  }, [wordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!window.confirm('确认逻辑删除这个词汇吗？')) return;
    setBusy(true);
    try {
      await deleteVocabulary(wordId);
      navigate('/w/words/vocabularies');
    } finally {
      setBusy(false);
    }
  };

  if (!item && !busy) return <Text>词汇不存在。</Text>;

  const grammars = (item?.grammars as ResourceItem[] | undefined) || [];
  const sentences = (item?.sentences as ResourceItem[] | undefined) || [];
  const tags = (item?.tags as ResourceItem[] | undefined) || [];
  const parts = (item?.partsOfSpeech as ResourceItem[] | undefined) || [];
  const collections = (item?.collections as ResourceItem[] | undefined) || [];

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: '词库', path: '/w/words/vocabularies' },
          { label: String(item?.word || '详情') },
        ]}
      />
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'end' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Text color="slate.500">词汇详情</Text>
          <Heading size="xl" mt={2}>
            {String(item?.word || '')}
          </Heading>
        </Box>
        <HStack wrap="wrap">
          <Button onClick={sentenceCreator.onOpen}>造句</Button>
          <Button variant="outline" onClick={editor.onOpen}>
            编辑
          </Button>
          <Button
            colorScheme="red"
            variant="ghost"
            onClick={() => void remove()}
          >
            删除
          </Button>
        </HStack>
      </Flex>
      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 360px' }}
        gap={5}
        alignItems="start"
      >
        <VStack align="stretch" spacing={5}>
          <Card bg="white">
            <CardBody>
              <Heading size="md" mb={4}>
                基本资料
              </Heading>
              {fields.map(([key, label], index) => (
                <Box key={key}>
                  {index > 0 && <Divider />}
                  <Grid
                    templateColumns={{ base: '90px 1fr', md: '140px 1fr' }}
                    gap={4}
                    py={4}
                  >
                    <Text color="slate.500">{label}</Text>
                    <Text whiteSpace="pre-wrap">
                      {displayValue(item?.[key])}
                    </Text>
                  </Grid>
                </Box>
              ))}
            </CardBody>
          </Card>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
            <RelationCard
              title="关联语法"
              resource="grammars"
              items={grammars}
              onManage={grammarRelations.onOpen}
            />
            <RelationCard
              title="关联句子"
              resource="sentences"
              items={sentences}
              onManage={sentenceRelations.onOpen}
            />
          </SimpleGrid>
        </VStack>
        <VStack align="stretch" spacing={5}>
          <Card bg="white">
            <CardBody>
              <Heading size="md" mb={4}>
                分类信息
              </Heading>
              <Text color="slate.500" mb={2}>
                标签
              </Text>
              <HStack wrap="wrap" mb={4}>
                {tags.length ? (
                  tags.map((tag) => (
                    <TagBadge key={String(tag.id)} color={tag.color}>
                      {String(tag.name)}
                    </TagBadge>
                  ))
                ) : (
                  <Text>—</Text>
                )}
              </HStack>
              <Text color="slate.500" mb={2}>
                词性
              </Text>
              <Text mb={4}>
                {parts.map((part) => part.name).join('、') || '—'}
              </Text>
              <Text color="slate.500" mb={2}>
                所属集合
              </Text>
              <Text>
                {collections.map((collection) => collection.name).join('、') ||
                  '—'}
              </Text>
            </CardBody>
          </Card>
          <Card bg="white">
            <CardBody>
              <Heading size="md" mb={4}>
                维护信息
              </Heading>
              <Text>创建：{formatDateTime(item?.created_at)}</Text>
              <Text mt={2}>更新：{formatDateTime(item?.updated_at)}</Text>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
      <KnowledgeEditorModal
        resource="vocabularies"
        initialValue={item}
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        onSaved={load}
      />
      <KnowledgeEditorModal
        resource="sentences"
        preset={{ vocabularyIds: [wordId] }}
        isOpen={sentenceCreator.isOpen}
        onClose={sentenceCreator.onClose}
        onSaved={load}
      />
      <RelationManagerModal
        sourceResource="vocabularies"
        sourceId={wordId}
        targetResource="grammars"
        existing={grammars}
        isOpen={grammarRelations.isOpen}
        onClose={grammarRelations.onClose}
        onChanged={load}
      />
      <RelationManagerModal
        sourceResource="vocabularies"
        sourceId={wordId}
        targetResource="sentences"
        existing={sentences}
        isOpen={sentenceRelations.isOpen}
        onClose={sentenceRelations.onClose}
        onChanged={load}
      />
      <PageLoading visible={busy} />
    </VStack>
  );
}
