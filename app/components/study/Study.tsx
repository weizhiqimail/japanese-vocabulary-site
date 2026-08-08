"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, type useRouter } from "next/navigation";
import { Pagination } from "../pagination/Pagination";
import { RevealValue } from "./RevealValue";
import { StudyActions } from "./StudyActions";
import { Empty, Heading, Loading } from "../common";
import { go } from "../../utils/navigation";
import { getSettings } from "../../http/settings";
import {
  getCollectionVocabularies,
  getStudyCollection,
  recordVocabularyLearning,
  recordVocabularyReview,
  submitTestAnswer,
} from "../../http/study";
import type { Item } from "../../types/models";

const DEFAULT_PAGE_SIZE = 20;

export function Study({
  collectionId,
  test,
  router,
  notify,
}: {
  collectionId: number;
  test: boolean;
  router: ReturnType<typeof useRouter>;
  notify: (s: string, d?: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const [collection, setCollection] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState(false);
  const [visible, setVisible] = useState({
    word: true,
    reading: true,
    translation: true,
  });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const fieldVisible = (itemId: unknown, field: keyof typeof visible) =>
    (field === "word" && memory) ||
    (!memory && visible[field]) ||
    Boolean(revealed[`${itemId}:${field}`]);
  const toggleField = (itemId: unknown, field: keyof typeof visible) => {
    const key = `${itemId}:${field}`;
    setRevealed((current) => ({
      ...current,
      [key]: !fieldVisible(itemId, field),
    }));
  };
  const pageNum = Math.max(1, Number(searchParams.get("pageNum")) || 1);
  const pageSize = Math.max(
    1,
    Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE,
  );

  useEffect(() => {
    Promise.all([
      getStudyCollection(collectionId),
      getCollectionVocabularies(collectionId),
      getSettings<{ test_defaults?: { size?: number } }>(),
    ])
      .then(([result, members, settings]) => {
        setCollection(result);
        setItems(
          test
            ? members.slice(
                0,
                settings.test_defaults?.size || DEFAULT_PAGE_SIZE,
              )
            : members,
        );
      })
      .catch((error) => notify((error as Error).message, true))
      .finally(() => setLoading(false));
  }, [collectionId, notify, test]);

  const current = items[index];
  const pageItems = useMemo(
    () => items.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    [items, pageNum, pageSize],
  );
  const options = useMemo(
    () =>
      current
        ? [
            current.translation,
            ...items
              .filter((item) => item.id !== current.id)
              .slice(0, 3)
              .map((item) => item.translation),
          ].sort(() => Math.random() - 0.5)
        : [],
    [current, items],
  );

  if (loading) return <Loading />;
  if (!collection) return <Empty text="集合不存在" />;

  async function mark(item: Item, action: "learn" | "review") {
    if (action === "learn") await recordVocabularyLearning(Number(item.id));
    else await recordVocabularyReview(Number(item.id));
    notify(action === "learn" ? "已记录学习" : "已记录复习");
  }

  async function answer(value: unknown) {
    const correct = value === current.translation;
    await submitTestAnswer(Number(current.id), correct);
    notify(
      correct ? "回答正确" : `回答错误，正确答案：${current.translation}`,
      !correct,
    );
    setIndex((value) => value + 1);
  }

  function changePage(values: { pageNum?: number; pageSize?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageNum", String(values.pageNum ?? pageNum));
    params.set("pageSize", String(values.pageSize ?? pageSize));
    go(router, `/collections/${collectionId}/study?${params.toString()}`);
  }

  const controls = (
    <section className="study-display-controls" aria-label="显示设置">
      {(
        [
          ["word", "词汇"],
          ["reading", "假名"],
          ["translation", "翻译"],
        ] as const
      ).map(([key, label]) => (
        <label className="form-check" key={key}>
          <input
            className="form-check-input"
            type="checkbox"
            checked={visible[key]}
            disabled={memory}
            onChange={(event) =>
              setVisible({ ...visible, [key]: event.target.checked })
            }
          />
          <span className="form-check-label">{label}</span>
        </label>
      ))}
      <span className="study-control-divider" />
      <label className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={memory}
          onChange={(event) => setMemory(event.target.checked)}
        />
        <span className="form-check-label">默记模式</span>
      </label>
    </section>
  );

  return (
    <>
      <Heading
        title={String(collection.name)}
        subtitle={String(collection.description || "")}
        crumbs={[
          { label: "词汇集合", href: "/collections" },
          {
            label: String(collection.name),
            href: `/collections/${collectionId}/study`,
          },
        ]}
      />
      {test ? (
        !current ? (
          items.length ? (
            <section className="study-completion">
              <h2>本轮已经完成</h2>
              <p className="text-secondary">再浏览一次本轮词汇，巩固记忆。</p>
              <div className="vocabulary-table-wrap">
                <table className="table table-hover align-middle mb-0 vocabulary-table">
                  <thead>
                    <tr>
                      <th>词汇</th>
                      <th>假名</th>
                      <th>翻译</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button
                            className="entity-title"
                            onClick={() =>
                              go(router, `/vocabularies/${item.id}`)
                            }
                          >
                            {item.word}
                          </button>
                        </td>
                        <td>{item.reading || "—"}</td>
                        <td>{item.translation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="vocabulary-mobile-list">
                {items.map((item) => (
                  <article className="vocabulary-mobile-card" key={item.id}>
                    <div className="vocabulary-mobile-content">
                      <button
                        className="entity-title"
                        onClick={() => go(router, `/vocabularies/${item.id}`)}
                      >
                        {item.word}
                      </button>
                      <div>{item.reading || "—"}</div>
                      <div>{item.translation}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <Empty text="集合中暂无词汇" />
          )
        ) : (
          <section className="test-card">
            <div className="progress mb-3">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.round((index / items.length) * 100)}%`,
                }}
              />
            </div>
            <h2>{current.word}</h2>
            <p>{current.reading || "—"}</p>
            <div className="option-grid">
              {options.map(String).map((option) => (
                <button
                  className="btn btn-outline-primary"
                  key={option}
                  onClick={() => answer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        )
      ) : (
        <>
          {controls}
          {!items.length ? (
            <Empty text="集合中暂无词汇" />
          ) : (
            <>
              <div className="study-table-wrap">
                <table className="table table-hover align-middle mb-0 study-table">
                  <thead>
                    <tr>
                      <th>词汇</th>
                      <th>假名</th>
                      <th>翻译</th>
                      <th className="text-end">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {fieldVisible(item.id, "word") ? (
                            <button
                              className="entity-title"
                              onClick={() =>
                                go(router, `/vocabularies/${item.id}`)
                              }
                            >
                              {item.word}
                            </button>
                          ) : (
                            <RevealValue
                              value={item.word}
                              visible={false}
                              onToggle={() => toggleField(item.id, "word")}
                            />
                          )}
                        </td>
                        <td>
                          <RevealValue
                            value={item.reading}
                            visible={fieldVisible(item.id, "reading")}
                            onToggle={() => toggleField(item.id, "reading")}
                          />
                        </td>
                        <td>
                          <RevealValue
                            value={item.translation}
                            visible={fieldVisible(item.id, "translation")}
                            onToggle={() => toggleField(item.id, "translation")}
                          />
                        </td>
                        <td>
                          <StudyActions item={item} mark={mark} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="study-mobile-list">
                {pageItems.map((item) => (
                  <article className="study-mobile-card" key={item.id}>
                    <div>
                      {fieldVisible(item.id, "word") ? (
                        <button
                          className="entity-title"
                          onClick={() => go(router, `/vocabularies/${item.id}`)}
                        >
                          {item.word}
                        </button>
                      ) : (
                        <RevealValue
                          value={item.word}
                          visible={false}
                          onToggle={() => toggleField(item.id, "word")}
                        />
                      )}
                      <div>
                        <RevealValue
                          value={item.reading}
                          visible={fieldVisible(item.id, "reading")}
                          onToggle={() => toggleField(item.id, "reading")}
                        />
                      </div>
                      <div>
                        <RevealValue
                          value={item.translation}
                          visible={fieldVisible(item.id, "translation")}
                          onToggle={() => toggleField(item.id, "translation")}
                        />
                      </div>
                    </div>
                    <StudyActions item={item} mark={mark} />
                  </article>
                ))}
              </div>
              <Pagination
                pagination={{ pageNum, pageSize, total: items.length }}
                onChange={changePage}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
