"use client";
import { usePathname, useRouter } from "next/navigation";
import { AppRoute } from "../../config/routes";
import { ManagementNavigation } from "../../components/navigation/ManagementNavigation";
export function SettingsNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <ManagementNavigation />
      <nav className="subnav settings-third-nav" aria-label="设置导航">
        <button
          className={
            pathname === AppRoute.MANAGE_SETTINGS_PAGINATION ? "active" : ""
          }
          onClick={() => router.push(AppRoute.MANAGE_SETTINGS_PAGINATION)}
        >
          分页设置
        </button>
        <button
          className={
            pathname === AppRoute.MANAGE_SETTINGS_OTHER ? "active" : ""
          }
          onClick={() => router.push(AppRoute.MANAGE_SETTINGS_OTHER)}
        >
          其他设置
        </button>
      </nav>
    </>
  );
}
