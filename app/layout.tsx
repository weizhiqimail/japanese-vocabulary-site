import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kotoba-bjt-notebook.daziiiiiiiiiiii.chatgpt.site"),
  title: "ことば帳｜BJT・N1 日语词汇学习",
  description: "BJT、N1 与 BJT 外来语在线词库，支持随机学习、四选一测试、错题复习和词库管理。",
  openGraph: {
    title: "ことば帳｜日语词汇学习",
    description: "BJT · N1 · BJT-外来语，随机学习，稳步记住。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ことば帳日语词汇学习" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ことば帳｜日语词汇学习",
    description: "BJT · N1 · BJT-外来语，随机学习，稳步记住。",
    images: ["/og.png"],
  },
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
