import { notFound } from "next/navigation";
import KotobaApp from "../../KotobaApp";

const routes: Record<string, Set<string>> = {
  review: new Set(["errors", "mastered", "favorites"]),
  management: new Set(["categories", "documents"]),
};

export default async function SubmodulePage({
  params,
}: {
  params: Promise<{ view: string; subview: string }>;
}) {
  const { view, subview } = await params;
  if (!routes[view]?.has(subview)) notFound();
  return <KotobaApp />;
}
