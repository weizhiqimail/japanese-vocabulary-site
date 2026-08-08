"use client";
import { useEffect, useState } from "react";
import type { useRouter } from "next/navigation";
import { Heading } from "../common";
import { go } from "../../utils/navigation";
import { getDashboardStats, type DashboardStats } from "../../http/dashboard";

export function Dashboard({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  const [data, setData] = useState<DashboardStats>({
    vocabularies: 0,
    collections: 0,
    learned: 0,
    errors: 0,
  });
  useEffect(() => {
    getDashboardStats()
      .then(setData)
      .catch(() => {});
  }, []);
  const cards: Array<[string, string, number, string]> = [
    ["bi-journal-text", "正式词汇", data.vocabularies || 0, "/vocabularies"],
    ["bi-collection", "词汇集合", data.collections || 0, "/collections"],
    ["bi-check2-circle", "已学习", data.learned || 0, "/review/mastered"],
    ["bi-exclamation-diamond", "错题", data.errors || 0, "/review/errors"],
  ];
  return (
    <>
      <Heading
        title="首页"
        subtitle="从词库、集合和复习记录继续今天的日语学习。"
      />
      <div className="metric-grid">
        {cards.map(([icon, title, n, href]) => (
          <button
            className="metric-card"
            key={String(title)}
            onClick={() => go(router, String(href))}
          >
            <i className={`bi ${icon}`} />
            <span>{title}</span>
            <strong>{n}</strong>
          </button>
        ))}
      </div>
      <section className="welcome">
        <div>
          <h2>从一个集合开始</h2>
          <p>集合把正式词汇组织成可学习、可测试的范围，进度会逐词保存。</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => go(router, "/collections")}
        >
          <i className="bi bi-arrow-right-circle" /> 查看集合
        </button>
      </section>
    </>
  );
}
