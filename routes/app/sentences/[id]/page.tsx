import { SentenceDetailPage } from "@/app/pages/sentences/detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SentenceDetailPage id={Number((await params).id)} />;
}
