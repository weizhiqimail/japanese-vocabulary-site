import { useState } from "react";
import type { ResourceItem } from "@/types/api.types";
import type { VocabularyVisibility } from "./VocabularyVisibilityControls";

const initialVisibility: VocabularyVisibility = {
  memory: false,
  reading: true,
  translation: true,
  word: true,
};

/** 词库与集合学习共享同一套字段显示、默记和临时揭示规则。 */
export function useVocabularyVisibility() {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const value = (
    item: ResourceItem,
    key: "word" | "reading" | "translation",
  ) => {
    const marker = `${String(item.id)}:${key}`;
    const visible = visibility.memory
      ? key === "word" || revealed[marker]
      : visibility[key] || revealed[marker];

    return visible ? String(item[key] || "—") : "•••";
  };

  const toggle = (item: ResourceItem, key: string) => {
    const marker = `${String(item.id)}:${key}`;
    setRevealed((current) => ({ ...current, [marker]: !current[marker] }));
  };

  return { setVisibility, toggle, value, visibility };
}
