import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { knowledgeName } from '@/components/common/format';
import { PageLoading } from '@/components/common/PageLoading';
import {
  deleteGrammarRelation,
  getGrammars,
  saveGrammarRelation,
} from '@/http/api/grammars.api';
import {
  deleteSentenceRelation,
  getSentences,
  saveSentenceRelation,
} from '@/http/api/sentences.api';
import {
  deleteVocabularyRelation,
  getVocabularies,
  saveVocabularyRelation,
} from '@/http/api/vocabularies.api';
import type { KnowledgeResource, ResourceItem } from '@/types/api.types';

interface RelationManagerModalProps {
  existing: ResourceItem[];
  isOpen: boolean;
  onChanged(): void | Promise<void>;
  onClose(): void;
  sourceId: number;
  sourceResource: KnowledgeResource;
  targetResource: KnowledgeResource;
}

const labels: Record<KnowledgeResource, string> = {
  vocabularies: '词汇',
  grammars: '语法',
  sentences: '句子',
};

async function loadCandidates(resource: KnowledgeResource) {
  const result =
    resource === 'vocabularies'
      ? await getVocabularies({ pageNum: 1, pageSize: 100 })
      : resource === 'grammars'
        ? await getGrammars({ pageNum: 1, pageSize: 100 })
        : await getSentences({ pageNum: 1, pageSize: 100 });

  return result.data;
}

/** 关联关系只在浮层中新增和移除，关闭后详情页直接展示结果。 */
export function RelationManagerModal({
  existing,
  isOpen,
  onChanged,
  onClose,
  sourceId,
  sourceResource,
  targetResource,
}: RelationManagerModalProps) {
  const [candidates, setCandidates] = useState<ResourceItem[]>([]);
  const [targetId, setTargetId] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setBusy(true);
    void loadCandidates(targetResource)
      .then(setCandidates)
      .finally(() => setBusy(false));
  }, [isOpen, targetResource]);

  const save = async () => {
    if (!targetId) {
      return;
    }

    setBusy(true);

    try {
      const payload = { targetId, targetResource };

      if (sourceResource === 'vocabularies') {
        await saveVocabularyRelation(sourceId, payload);
      } else if (sourceResource === 'grammars') {
        await saveGrammarRelation(sourceId, payload);
      } else {
        await saveSentenceRelation(sourceId, payload);
      }

      setTargetId(0);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);

    try {
      const payload = { targetId: id, targetResource };

      if (sourceResource === 'vocabularies') {
        await deleteVocabularyRelation(sourceId, payload);
      } else if (sourceResource === 'grammars') {
        await deleteGrammarRelation(sourceId, payload);
      } else {
        await deleteSentenceRelation(sourceId, payload);
      }

      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const available = candidates.filter(
    (candidate) =>
      !existing.some((item) => String(item.id) === String(candidate.id)),
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={busy ? () => undefined : onClose}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>关联{labels[targetResource]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={3} mb={5} direction={{ base: 'column', md: 'row' }}>
              <Select
                value={targetId || ''}
                onChange={(event) => setTargetId(Number(event.target.value))}
                placeholder={`输入或选择${labels[targetResource]}`}
              >
                {available.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {knowledgeName(item)}
                  </option>
                ))}
              </Select>
              <Button
                onClick={() => void save()}
                isDisabled={!targetId || busy}
              >
                添加关联
              </Button>
            </Flex>
            <Stack spacing={2}>
              {existing.length ? (
                existing.map((item) => (
                  <Flex
                    key={String(item.id)}
                    justify="space-between"
                    align="center"
                    bg="brand.50"
                    borderRadius="lg"
                    px={4}
                    py={3}
                    gap={3}
                  >
                    <Text fontWeight="600">{knowledgeName(item)}</Text>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => void remove(Number(item.id))}
                    >
                      移除
                    </Button>
                  </Flex>
                ))
              ) : (
                <Text color="slate.500">暂无关联内容</Text>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PageLoading visible={busy} label="正在更新关联…" />
    </>
  );
}
