"use client";
import { usePathname, useRouter } from "next/navigation";
import { MANAGEMENT_NAVIGATION_ITEMS } from "./config";

export function ManagementNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="subnav" aria-label="管理导航">
      {MANAGEMENT_NAVIGATION_ITEMS.map((item) => (
        <button
          className={
            pathname.startsWith(item.href.replace("/pagination", ""))
              ? "active"
              : ""
          }
          key={item.href}
          onClick={() => router.push(item.href)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
