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
import { deleteSentence, getSentence } from '@/http/api/sentences.api';
import type { ResourceItem } from '@/types/api.types';

const fields = [
  ['japanese', '日语句子'],
  ['reading', '注音'],
  ['translation', '翻译'],
  ['notes', '备注'],
] as const;

/** 句子详情独立页面，维护词汇和语法关联。 */
export function SentenceDetail() {
  const { id } = useParams();
  const sentenceId = Number(id);
  const navigate = useNavigate();
  const editor = useDisclosure();
  const vocabularyRelations = useDisclosure();
  const grammarRelations = useDisclosure();
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setItem(await getSentence(sentenceId));
    } finally {
      setBusy(false);
    }
  }, [sentenceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!window.confirm('确认逻辑删除这个句子吗？')) return;
    setBusy(true);
    try {
      await deleteSentence(sentenceId);
      navigate('/w/words/sentences');
    } finally {
      setBusy(false);
    }
  };

  const vocabularies = (item?.vocabularies as ResourceItem[] | undefined) || [];
  const grammars = (item?.grammars as ResourceItem[] | undefined) || [];
  const tags = (item?.tags as ResourceItem[] | undefined) || [];

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: '句子', path: '/w/words/sentences' },
          { label: String(item?.japanese || '详情') },
        ]}
      />
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'end' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Text color="slate.500">句子详情</Text>
          <Heading size="lg" mt={2}>
            {String(item?.japanese || '')}
          </Heading>
        </Box>
        <HStack>
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
                    templateColumns={{ base: '100px 1fr', md: '140px 1fr' }}
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
              title="关联词汇"
              resource="vocabularies"
              items={vocabularies}
              onManage={vocabularyRelations.onOpen}
            />
            <RelationCard
              title="关联语法"
              resource="grammars"
              items={grammars}
              onManage={grammarRelations.onOpen}
            />
          </SimpleGrid>
        </VStack>
        <VStack align="stretch" spacing={5}>
          <Card bg="white">
            <CardBody>
              <Heading size="md" mb={4}>
                标签
              </Heading>
              <HStack wrap="wrap">
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
        resource="sentences"
        initialValue={item}
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        onSaved={load}
      />
      <RelationManagerModal
        sourceResource="sentences"
        sourceId={sentenceId}
        targetResource="vocabularies"
        existing={vocabularies}
        isOpen={vocabularyRelations.isOpen}
        onClose={vocabularyRelations.onClose}
        onChanged={load}
      />
      <RelationManagerModal
        sourceResource="sentences"
        sourceId={sentenceId}
        targetResource="grammars"
        existing={grammars}
        isOpen={grammarRelations.isOpen}
        onClose={grammarRelations.onClose}
        onChanged={load}
      />
      <PageLoading visible={busy} />
    </VStack>
  );
}
