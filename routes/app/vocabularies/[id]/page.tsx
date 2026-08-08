import { VocabularyDetailPage } from "@/app/pages/vocabularies/detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <VocabularyDetailPage id={Number((await params).id)} />;
}
