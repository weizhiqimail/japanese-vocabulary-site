import { notFound } from "next/navigation";
import KotobaApp from "../KotobaApp";

const routes = new Set([
  "learn",
  "quiz",
  "review",
  "words",
  "articles",
  "management",
]);

export default async function ModulePage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!routes.has(view)) notFound();
  return <KotobaApp />;
}
