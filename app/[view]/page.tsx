import { notFound } from "next/navigation";
import KotobaApp from "../KotobaApp";

const routes = new Set([
  "learn",
  "quiz",
  "errors",
  "mastered",
  "words",
  "articles",
  "settings",
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
