"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAVIGATION_ITEMS, AppRoute } from "../../config/routes";
import type { AppShellProps } from "./types";
import "./style.scss";

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isActive = (href: AppRoute) =>
    href === AppRoute.HOME
      ? pathname === AppRoute.HOME
      : pathname.startsWith(`/${href.split("/")[1]}`);
  return (
    <>
      <header className="topbar">
        <div className="container nav-shell">
          <button className="brand" onClick={() => router.push(AppRoute.HOME)}>
            日本語言葉勉強
          </button>
          <button
            className="nav-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label="切换导航"
          >
            <i className="bi bi-list" />
          </button>
          <nav className={open ? "main-nav open" : "main-nav"}>
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="container app-main">{children}</main>
    </>
  );
}
