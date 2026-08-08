import { ReviewSection } from "@/app/config/enums";
import { ReviewPage } from "@/app/pages/review";
export default function Page() {
  return <ReviewPage section={ReviewSection.FAVORITES} />;
}
