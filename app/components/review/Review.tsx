"use client";
import { useEffect, useState } from "react";
import { useSearchParams, type useRouter } from "next/navigation";
import { ReviewSection } from "../../config/enums";
import { DEFAULT_PAGE_SIZE } from "../../config/resources";
import { Pagination } from "../pagination/Pagination";
import { Empty, Heading } from "../common";
import { go } from "../../utils/navigation";
import { getSettings } from "../../http/settings";
import {
  getCollectionTypeVocabularies,
  getLearnedVocabularies,
} from "../../http/review";
import type { Item } from "../../types/models";

const names: Record<ReviewSection, string> = {
  [ReviewSection.MASTERED]: "已掌握",
  [ReviewSection.ERRORS]: "错题集",
  [ReviewSection.FAVORITES]: "收藏本",
};
export function Review({
  section,
  router,
}: {
  section: ReviewSection;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <nav className="subnav">
        {Object.values(ReviewSection).map((value) => (
          <button
            className={value === section ? "active" : ""}
            key={value}
            onClick={() => go(router, `/review/${value}`)}
          >
            {names[value]}
          </button>
        ))}
      </nav>
      <Heading
        title={names[section]}
        subtitle="查看学习、错误与收藏记录。"
        crumbs={[
          { label: "复习", href: "/review/mastered" },
          { label: names[section] },
        ]}
      />
      <ReviewData section={section} router={router} />
    </>
  );
}
function ReviewData({
  section,
  router,
}: {
  section: ReviewSection;
  router: ReturnType<typeof useRouter>;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [defaultSize, setDefaultSize] = useState(DEFAULT_PAGE_SIZE);
  const searchParams = useSearchParams();
  const pageNum = Math.max(1, Number(searchParams.get("pageNum")) || 1);
  const pageSize = Math.max(
    1,
    Number(searchParams.get("pageSize")) || defaultSize,
  );
  useEffect(() => {
    const settingKey =
      section === ReviewSection.ERRORS
        ? "review_errors"
        : section === ReviewSection.FAVORITES
          ? "review_favorites"
          : "review_mastered";
    getSettings<{ pagination_defaults?: Record<string, number> }>().then(
      (response) =>
        setDefaultSize(
          response.pagination_defaults?.[settingKey] || DEFAULT_PAGE_SIZE,
        ),
    );
    const type =
      section === ReviewSection.ERRORS
        ? "error"
        : section === ReviewSection.FAVORITES
          ? "favorite"
          : "";
    if (!type) {
      getLearnedVocabularies().then(setItems);
      return;
    }
    getCollectionTypeVocabularies(type).then(setItems);
  }, [section]);
  const pageItems = items.slice((pageNum - 1) * pageSize, pageNum * pageSize);
  const update = (values: { pageNum?: number; pageSize?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageNum", String(values.pageNum ?? pageNum));
    params.set("pageSize", String(values.pageSize ?? pageSize));
    go(router, `/review/${section}?${params}`);
  };
  return items.length ? (
    <>
      <div className="entity-list">
        {pageItems.map((v, i) => (
          <article className="entity-row" key={`${v.id}-${i}`}>
            <button
              className="entity-title"
              onClick={() => go(router, `/vocabularies/${v.id}`)}
            >
              {v.word}
            </button>
            <div>{v.reading || "—"}</div>
            <div className="entity-extra">
              <span>{v.translation}</span>
              <small>错误 {v.error_count || 0} 次</small>
            </div>
          </article>
        ))}
      </div>
      <Pagination
        pagination={{ pageNum, pageSize, total: items.length }}
        onChange={update}
      />
    </>
  ) : (
    <Empty text="当前没有记录" />
  );
}
