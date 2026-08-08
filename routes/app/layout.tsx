import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/app/assets/styles/global.scss";
import { AppShell } from "@/app/layout/AppShell";

export const metadata: Metadata = {
  title: "日本語言葉勉強",
  description: "个人日语词汇、语法与句子学习系统",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
