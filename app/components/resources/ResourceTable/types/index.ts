import type { useRouter } from "next/navigation";
import type { Item } from "../../../../types/models";
import type { ResourceKey } from "../../../../config/resources";
export interface ResourceTableProps {
  resource: ResourceKey.GRAMMARS | ResourceKey.SENTENCES;
  data: Item[];
  router: ReturnType<typeof useRouter>;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}
