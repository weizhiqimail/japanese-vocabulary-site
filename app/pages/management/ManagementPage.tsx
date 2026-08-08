"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Manage } from "../../components/management/Manage";
import type { ManageSection } from "../../config/enums";
export function ManagementPage({ section }: { section: ManageSection }) {
  const notify = useCallback((message: string, danger = false) => {
    if (danger) console.error(message);
  }, []);
  return <Manage section={section} router={useRouter()} notify={notify} />;
}
