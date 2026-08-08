import { GrammarDetailPage } from "@/app/pages/grammars/detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <GrammarDetailPage id={Number((await params).id)} />;
}
