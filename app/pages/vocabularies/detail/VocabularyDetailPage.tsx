"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DetailView } from "../../../components/details/DetailView";
import { ResourceKey } from "../../../config/resources";
import type { VocabularyDetailPageProps } from "./types";
export function VocabularyDetailPage({ id }: VocabularyDetailPageProps) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return (
    <DetailView
      resource={ResourceKey.VOCABULARIES}
      id={id}
      router={useRouter()}
      notify={notify}
    />
  );
}
