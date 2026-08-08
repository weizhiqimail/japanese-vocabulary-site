"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DetailView } from "../../../components/details/DetailView";
import { ResourceKey } from "../../../config/resources";
import type { GrammarDetailPageProps } from "./types";
export function GrammarDetailPage({ id }: GrammarDetailPageProps) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return (
    <DetailView
      resource={ResourceKey.GRAMMARS}
      id={id}
      router={useRouter()}
      notify={notify}
    />
  );
}
