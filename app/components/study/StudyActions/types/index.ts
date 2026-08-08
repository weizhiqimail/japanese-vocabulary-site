import type { Item } from "../../../../types/models";
export interface StudyActionsProps {
  item: Item;
  mark: (item: Item, action: "learn" | "review") => Promise<void>;
}
