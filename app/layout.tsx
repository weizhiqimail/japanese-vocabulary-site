import type { Metadata } from "next";
import SelectionLookup from "./components/SelectionLookup";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kotoba-bjt-notebook.daziiiiiiiiiiii.chatgpt.site"),
  title: "日本語言葉勉強｜日语词汇学习",
  description: "支持动态多标签分类、随机学习、四选一测试、错题复习和词库管理的日语学习工具。",
  openGraph: {
    title: "日本語言葉勉強｜日语词汇学习",
    description: "动态多标签词库，随机学习，稳步记住。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ことば帳日语词汇学习" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "日本語言葉勉強｜日语词汇学习",
    description: "动态多标签词库，随机学习，稳步记住。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <SelectionLookup />
      </body>
    </html>
  );
}
