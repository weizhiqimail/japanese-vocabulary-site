import { ResourceKey } from "../../config/resources";
import type { Item } from "../../types/models";
import { resourceApi } from "../resources/resourceApi";
import { getCollectionVocabularies } from "../study";

export async function getLearnedVocabularies() {
  const result = await resourceApi.list<{ data: Item[] }>(
    ResourceKey.VOCABULARIES,
    { pageSize: 100 },
  );
  return result.data.filter((item) => item.learned_at);
}
export async function getCollectionTypeVocabularies(type: string) {
  const result = await resourceApi.list<{ data: Item[] }>(
    ResourceKey.COLLECTIONS,
    { type, pageSize: 100 },
  );
  const groups = await Promise.all(
    result.data.map((collection) =>
      getCollectionVocabularies(Number(collection.id)),
    ),
  );
  return groups.flat();
}
