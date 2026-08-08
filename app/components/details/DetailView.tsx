"use client";

import { FormEvent, useEffect, useState } from "react";
import type { useRouter } from "next/navigation";
import { DeleteConfirmation, Modal } from "../feedback";
import { Editor } from "../resources/ResourceList";
import { CheckboxOverlaySelect } from "../forms/CheckboxOverlaySelect";
import { ResourceKey } from "../../config/resources";
import { DETAIL_RELATIONS } from "./config";
import { Empty, Heading, Loading } from "../common";
import { go } from "../../utils/navigation";
import { RESOURCE_LABELS as labels } from "../../config/labels";
import {
  createGrammarSentence,
  createVocabularySentence,
  deleteDetail,
  getDetail,
  linkSentenceGrammar,
  linkVocabularyGrammar,
  listAvailableGrammars,
  listAvailableTags,
} from "../../http/details";
import type { Item } from "../../types/models";

type Notify = (message: string, danger?: boolean) => void;

export function DetailView({
  resource,
  id,
  router,
  notify,
}: {
  resource:
    ResourceKey.VOCABULARIES | ResourceKey.GRAMMARS | ResourceKey.SENTENCES;
  id: number;
  router: ReturnType<typeof useRouter>;
  notify: Notify;
}) {
  const [item, setItem] = useState<Item | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [grammarModal, setGrammarModal] = useState(false);
  const [sentenceModal, setSentenceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = () =>
    getDetail(resource, id)
      .then(setItem)
      .finally(() => setLoading(false));
  useEffect(() => {
    void load();
  }, [resource, id]);
  if (loading) return <Loading />;
  if (!item) return <Empty text="资料不存在" />;

  const title = String(
    resource === ResourceKey.VOCABULARIES
      ? item.word
      : resource === ResourceKey.GRAMMARS
        ? item.pattern
        : item.japanese,
  );
  const related = (key: string) =>
    Array.isArray(item[key]) ? (item[key] as Item[]) : [];

  async function remove() {
    setDeleteBusy(true);
    try {
      await deleteDetail(resource, id);
      notify("已逻辑删除");
      setDeleteComplete(true);
    } catch (error) {
      notify((error as Error).message, true);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <Heading
        title=""
        crumbs={[
          { label: labels[resource].title, href: `/${resource}` },
          { label: title },
        ]}
      />
      <header className="detail-header">
        <div className="detail-heading-copy">
          <div className="detail-kicker">{labels[resource].singular}详情</div>
          <div className="detail-title-line">
            <h1>{title}</h1>
            {item.reading && (
              <div className="detail-reading">{item.reading}</div>
            )}
          </div>
        </div>
        <div className="detail-actions">
          {resource === ResourceKey.VOCABULARIES && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setGrammarModal(true)}
              >
                <i className="bi bi-diagram-3 me-1" />
                关联语法
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setSentenceModal(true)}
              >
                <i className="bi bi-chat-square-text me-1" />
                造句
              </button>
            </>
          )}
          {resource === ResourceKey.GRAMMARS && (
            <button
              className="btn btn-primary"
              onClick={() => setSentenceModal(true)}
            >
              <i className="bi bi-chat-square-text me-1" />
              造句
            </button>
          )}
          {resource === ResourceKey.SENTENCES && (
            <button
              className="btn btn-primary"
              onClick={() => setGrammarModal(true)}
            >
              <i className="bi bi-diagram-3 me-1" />
              关联语法
            </button>
          )}
          <button
            className="btn btn-outline-secondary"
            onClick={() => setEditing(true)}
          >
            <i className="bi bi-pencil me-1" />
            编辑
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => setDeleting(true)}
          >
            <i className="bi bi-trash me-1" />
            删除
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-layout-left">
          <DetailSummary resource={resource} item={item} />
          <RelationGrid resource={resource} item={item} router={router} />
        </div>
        <div className="detail-layout-right">
          <Classification resource={resource} item={item} />
          <section className="detail-panel detail-maintenance-slot">
            <h2>维护信息</h2>
            <InfoRow label="创建时间" value={formatDate(item.created_at)} />
            <InfoRow label="更新时间" value={formatDate(item.updated_at)} />
          </section>
        </div>
      </div>

      {editing && (
        <Editor
          resource={resource}
          item={item}
          close={() => setEditing(false)}
          saved={() => {
            setEditing(false);
            void load();
            notify("资料已保存");
          }}
        />
      )}
      {deleting && (
        <DeleteConfirmation
          subject={title}
          busy={deleteBusy}
          close={() => {
            setDeleting(false);
            setDeleteComplete(false);
            if (deleteComplete) go(router, `/${resource}`);
          }}
          confirm={remove}
          closeRequested={deleteComplete}
        />
      )}
      {grammarModal && (
        <GrammarLinkModal
          ownerType={
            resource === ResourceKey.SENTENCES ? "sentence" : "vocabulary"
          }
          ownerId={id}
          existing={related("grammars")}
          notify={notify}
          close={() => setGrammarModal(false)}
          saved={() => {
            setGrammarModal(false);
            void load();
          }}
        />
      )}
      {sentenceModal && (
        <SentenceCreateModal
          ownerType={
            resource === ResourceKey.GRAMMARS ? "grammar" : "vocabulary"
          }
          ownerId={id}
          notify={notify}
          close={() => setSentenceModal(false)}
          saved={() => {
            setSentenceModal(false);
            void load();
          }}
        />
      )}
    </>
  );
}

function DetailSummary({ resource, item }: { resource: string; item: Item }) {
  return (
    <section className="detail-panel detail-summary detail-summary-slot">
      <h2>基本资料</h2>
      {resource === ResourceKey.VOCABULARIES && (
        <>
          <InfoRow label="词汇" value={item.word} />
          <InfoRow label="假名" value={item.reading} />
          <InfoRow label="翻译" value={item.translation} />
        </>
      )}
      {resource === ResourceKey.GRAMMARS && (
        <>
          <InfoRow label="语法" value={item.pattern} />
          <InfoRow label="假名" value={item.reading} />
          <InfoRow label="含义" value={item.meaning} />
        </>
      )}
      {resource === ResourceKey.SENTENCES && (
        <>
          <InfoRow label="句子" value={item.japanese} />
          <InfoRow label="假名" value={item.reading} />
          <InfoRow label="翻译" value={item.translation} />
        </>
      )}
      <InfoRow label="备注" value={item.notes} />
    </section>
  );
}

function Classification({ resource, item }: { resource: string; item: Item }) {
  const pos = Array.isArray(item.pos) ? (item.pos as Item[]) : [];
  const tags = Array.isArray(item.tags) ? (item.tags as Item[]) : [];
  const collections = Array.isArray(item.collections)
    ? (item.collections as Item[])
    : [];
  return (
    <section className="detail-panel detail-classification-slot">
      <h2>分类信息</h2>
      {resource === ResourceKey.VOCABULARIES && (
        <div className="metadata-group info-row">
          <span>词性</span>
          <BadgeList values={pos} tone="primary" />
        </div>
      )}
      <div className="metadata-group info-row">
        <span>标签</span>
        <BadgeList values={tags} tone="success" />
      </div>
      {resource === ResourceKey.VOCABULARIES && (
        <div className="metadata-group info-row">
          <span>集合</span>
          <BadgeList values={collections} tone="info" />
        </div>
      )}
    </section>
  );
}

function BadgeList({
  values,
  tone,
}: {
  values: Item[];
  tone: "primary" | "success" | "info";
}) {
  return (
    <div className="badge-list">
      {values.length ? (
        values.map((value) => (
          <span className={`badge text-bg-${tone}`} key={value.id}>
            {value.name}
          </span>
        ))
      ) : (
        <em>未设置</em>
      )}
    </div>
  );
}

function RelationGrid({
  resource,
  item,
  router,
}: {
  resource: string;
  item: Item;
  router: ReturnType<typeof useRouter>;
}) {
  const definitions =
    DETAIL_RELATIONS[resource as keyof typeof DETAIL_RELATIONS];
  return (
    <div className="detail-relations detail-relations-slot">
      {definitions.map(({ key, label, field, route }) => {
        const values = Array.isArray(item[key]) ? (item[key] as Item[]) : [];
        return (
          <section className="detail-panel" key={key}>
            <div className="panel-title">
              <h2>{label}</h2>
              <span>{values.length}</span>
            </div>
            {values.length ? (
              <div className="relation-list">
                {values.map((value) => {
                  return (
                    <button
                      key={value.id}
                      onClick={() => go(router, `/${route}/${value.id}`)}
                    >
                      <strong>{String(value[field] || "—")}</strong>
                      <small>
                        {String(
                          value.translation ||
                            value.meaning ||
                            value.reading ||
                            "",
                        )}
                      </small>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="detail-empty">无</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{String(value)}</dd>
    </div>
  );
}
function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function GrammarLinkModal({
  ownerType,
  ownerId,
  existing,
  notify,
  close,
  saved,
}: {
  ownerType: "vocabulary" | "sentence";
  ownerId: number;
  existing: Item[];
  notify: Notify;
  close: () => void;
  saved: () => void;
}) {
  const [grammars, setGrammars] = useState<Item[]>([]);
  const [grammarId, setGrammarId] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    listAvailableGrammars().then((response) =>
      setGrammars(
        response.filter(
          (value) => !existing.some((current) => current.id === value.id),
        ),
      ),
    );
  }, []);
  const visibleGrammars = grammars.filter((grammar) =>
    `${grammar.pattern || ""} ${grammar.reading || ""} ${grammar.meaning || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (ownerType === "sentence")
        await linkSentenceGrammar(ownerId, Number(grammarId));
      else await linkVocabularyGrammar(ownerId, Number(grammarId));
      notify("语法关联已保存");
      setDone(true);
    } catch (error) {
      notify((error as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form id="grammar-link-form" onSubmit={submit}>
      <Modal
        title="关联语法"
        close={() => (done ? saved() : close())}
        closeRequested={done}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={close}
            >
              取消
            </button>
            <button
              form="grammar-link-form"
              className="btn btn-primary"
              disabled={busy || !grammarId}
            >
              {busy ? "保存中…" : "保存关联"}
            </button>
          </>
        }
      >
        <label className="form-label" htmlFor="grammar-search">
          搜索语法
        </label>
        <input
          id="grammar-search"
          className="form-control mb-3"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入语法形式、读法或含义"
          autoFocus
        />
        <label className="form-label" htmlFor="grammar-select">
          选择语法
        </label>
        <select
          id="grammar-select"
          className="form-select"
          value={grammarId}
          onChange={(event) => setGrammarId(event.target.value)}
          required
        >
          <option value="">请选择（{visibleGrammars.length} 条）</option>
          {visibleGrammars.map((grammar) => (
            <option value={Number(grammar.id)} key={grammar.id}>
              {grammar.pattern} — {grammar.meaning}
            </option>
          ))}
        </select>
        {!visibleGrammars.length && (
          <p className="text-secondary small mt-2 mb-0">
            没有可继续关联的语法。
          </p>
        )}
      </Modal>
    </form>
  );
}

function SentenceCreateModal({
  ownerType,
  ownerId,
  notify,
  close,
  saved,
}: {
  ownerType: "vocabulary" | "grammar";
  ownerId: number;
  notify: Notify;
  close: () => void;
  saved: () => void;
}) {
  const [form, setForm] = useState<Item>({});
  const [tags, setTags] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    listAvailableTags()
      .then(setTags)
      .catch((error) => notify((error as Error).message, true));
  }, [notify]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (ownerType === "grammar") await createGrammarSentence(ownerId, form);
      else await createVocabularySentence(ownerId, form);
      notify("句子已创建并关联");
      setDone(true);
    } catch (error) {
      notify((error as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  const field = (key: string, label: string, required = false) => (
    <label className="inline-field">
      <span>{label}</span>
      <textarea
        className="form-control"
        required={required}
        value={String(form[key] || "")}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      />
    </label>
  );
  return (
    <form id="sentence-create-form" onSubmit={submit}>
      <Modal
        title={ownerType === "grammar" ? "使用这个语法造句" : "使用这个词造句"}
        size="xl"
        close={() => (done ? saved() : close())}
        closeRequested={done}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={close}
            >
              取消
            </button>
            <button
              form="sentence-create-form"
              className="btn btn-primary"
              disabled={busy}
            >
              {busy ? "保存中…" : "创建并关联"}
            </button>
          </>
        }
      >
        {field("japanese", "日语句子", true)}
        {field("reading", "注音")}
        {field("translation", "中文翻译", true)}
        {field("notes", "备注")}
        <CheckboxOverlaySelect
          label="标签"
          options={tags}
          selected={Array.isArray(form.tagIds) ? form.tagIds.map(Number) : []}
          onChange={(tagIds) => setForm({ ...form, tagIds })}
        />
      </Modal>
    </form>
  );
}
