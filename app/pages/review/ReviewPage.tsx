"use client";
import { useRouter } from "next/navigation";
import { Review } from "../../components/review/Review";
import type { ReviewSection } from "../../config/enums";
export function ReviewPage({ section }: { section: ReviewSection }) {
  return <Review section={section} router={useRouter()} />;
}
