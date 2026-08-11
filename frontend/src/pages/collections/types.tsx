import type { ResourceItem } from "@/types/api.types";

export type CollectionItem = ResourceItem & {
  description?: string;
  learned_count?: number;
  member_count?: number;
  name: string;
  source?: string;
  type: "source" | "custom" | "favorite" | "error";
};
