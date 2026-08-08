"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DetailView } from "../../../components/details/DetailView";
import { ResourceKey } from "../../../config/resources";
import type { SentenceDetailPageProps } from "./types";
export function SentenceDetailPage({ id }: SentenceDetailPageProps) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return (
    <DetailView
      resource={ResourceKey.SENTENCES}
      id={id}
      router={useRouter()}
      notify={notify}
    />
  );
}
