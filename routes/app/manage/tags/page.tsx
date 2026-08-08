import { ManageSection } from "@/app/config/enums";
import { ManagementPage } from "@/app/pages/management";
export default function Page() {
  return <ManagementPage section={ManageSection.TAGS} />;
}
