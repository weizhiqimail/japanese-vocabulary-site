import type { Item } from "../../../types/models";

export interface CheckboxOverlaySelectProps {
  label: string;
  options: Item[];
  selected: number[];
  onChange: (values: number[]) => void;
}
