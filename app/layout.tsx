import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ことば帳｜BJT 商务日语背词",
  description: "从个人学习笔记整理的轻量日语背词与四选一测试工具。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
