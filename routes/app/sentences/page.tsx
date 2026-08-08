import { ResourceKey } from "@/app/config/resources";
import { ResourcePage } from "@/app/pages/resources";
export default function Page() {
  return <ResourcePage resource={ResourceKey.SENTENCES} />;
}
