import { redirect } from "next/navigation";
import { AppRoute } from "../../config/routes";
export function SettingsHomePage() {
  redirect(AppRoute.MANAGE_SETTINGS_PAGINATION);
}
