"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ListPage } from "../../components/resources/ResourceList";
import type { ResourceKey } from "../../config/resources";
export function ResourcePage({ resource }: { resource: ResourceKey }) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return <ListPage resource={resource} router={useRouter()} notify={notify} />;
}
