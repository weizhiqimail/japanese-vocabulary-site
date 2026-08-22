import { Heading, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import { PageLoading } from '@/components/common/PageLoading';
import { VocabularyStudyList } from '@/components/vocabulary/VocabularyStudyList';
import { getCollection } from '@/http/api/collections.api';
import { getCollectionMembers, recordStudy } from '@/http/api/study.api';
import type { ResourceItem } from '@/types/api.types';

/** 集合词汇学习独立页面。 */
export function CollectionStudy() {
  const { id } = useParams();
  const collectionId = Number(id);
  const [collection, setCollection] = useState<ResourceItem | null>(null);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const [detail, members] = await Promise.all([
        getCollection(collectionId),
        getCollectionMembers(collectionId),
      ]);
      setCollection(detail);
      setItems(members);
    } finally {
      setBusy(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const record = async (item: ResourceItem, eventType: 'learn' | 'review') => {
    setBusy(true);

    try {
      await recordStudy(Number(item.id), eventType);
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: '集合', path: '/w/words/collections' },
          { label: String(collection?.name || '学习') },
        ]}
      />
      <Heading size="xl">{String(collection?.name || '集合学习')}</Heading>
      <Text color="slate.500">
        {String(collection?.description || collection?.source || '')}
      </Text>
      {items.length ? (
        <VocabularyStudyList
          items={items}
          onRecord={(item, eventType) => void record(item, eventType)}
        />
      ) : (
        !busy && <Text>集合中还没有词汇。</Text>
      )}
      <PageLoading visible={busy} />
    </VStack>
  );
}
