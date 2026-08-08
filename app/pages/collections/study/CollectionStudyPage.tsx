"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Study } from "../../../components/study/Study";
export function CollectionStudyPage({
  collectionId,
  test = false,
}: {
  collectionId: number;
  test?: boolean;
}) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return (
    <Study
      collectionId={collectionId}
      test={test}
      router={useRouter()}
      notify={notify}
    />
  );
}
