import { CollectionStudyPage } from "@/app/pages/collections/study";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CollectionStudyPage collectionId={Number((await params).id)} />;
}
