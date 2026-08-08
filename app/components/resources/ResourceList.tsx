"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CollectionType } from "../../config/enums";
import { SearchBar } from "../forms/SearchBar";
import { CheckboxOverlaySelect } from "../forms/CheckboxOverlaySelect";
import { ResourceTable } from "./ResourceTable";
import { DEFAULT_PAGE_SIZE, ResourceKey } from "../../config/resources";
import { DeleteConfirmation, Modal } from "../feedback";
import { Pagination } from "../pagination/Pagination";
import { Empty, Heading, Loading } from "../common";
import { go } from "../../utils/navigation";
import { RESOURCE_LABELS as labels } from "../../config/labels";
import { resourceApi } from "../../http/resources/resourceApi";
import type { Item } from "../../types/models";
import type { PaginationState } from "../../types/common";

export function useList(resource: ResourceKey) {
  const search = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<{
    data: Item[];
    pagination: PaginationState;
  }>({
    data: [],
    pagination: {
      pageNum: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const query = search.toString();
  const load = useCallback(() => {
    setLoading(true);
    return resourceApi
      .list<{ data: Item[]; pagination: PaginationState }>(
        resource,
        Object.fromEntries(new URLSearchParams(query)),
      )
      .then(setState)
      .finally(() => setLoading(false));
  }, [resource, query]);
  useEffect(() => {
    void load();
  }, [load]);
  const update = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(query);
    Object.entries(values).forEach(([k, v]) => {
      if (String(v)) next.set(k, String(v));
      else next.delete(k);
    });
    router.push(`/${resource}?${next}`);
  };
  return {
    ...state,
    loading,
    load,
    update,
    q: search.get("q") || "",
    tagId: search.get("tagId") || "",
  };
}

export function ListPage({
  resource,
  router,
  notify,
}: {
  resource: ResourceKey;
  router: ReturnType<typeof useRouter>;
  notify: (s: string, d?: boolean) => void;
}) {
  const list = useList(resource);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [filterTags, setFilterTags] = useState<Item[]>([]);
  const meta = labels[resource];
  useEffect(() => {
    if (resource === ResourceKey.VOCABULARIES)
      resourceApi
        .list<{ data: Item[] }>(ResourceKey.TAGS, { pageSize: 100 })
        .then((result) => setFilterTags(result.data));
  }, [resource]);
  async function remove() {
    if (!deleting?.id) return;
    setDeleteBusy(true);
    try {
      await resourceApi.remove(resource, Number(deleting.id));
      notify("已逻辑删除");
      setDeleteComplete(true);
      await list.load();
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setDeleteBusy(false);
    }
  }
  return (
    <>
      <Heading title={meta.title} subtitle={meta.subtitle} />
      <div className="toolbar">
        <div className="vocabulary-filters">
          <SearchBar
            value={list.q}
            onSearch={(q) => list.update({ q, pageNum: 1 })}
          />
          {resource === ResourceKey.VOCABULARIES && (
            <select
              className="form-select tag-filter"
              value={list.tagId}
              onChange={(event) =>
                list.update({ tagId: event.target.value, pageNum: 1 })
              }
              aria-label="按标签查询"
            >
              <option value="">全部标签</option>
              {filterTags.map((tag) => (
                <option key={tag.id} value={Number(tag.id)}>
                  {tag.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <i className="bi bi-plus-lg" /> 新增{meta.singular}
        </button>
      </div>
      {list.loading ? (
        <Loading />
      ) : list.data.length ? (
        resource === ResourceKey.VOCABULARIES ? (
          <VocabularyList data={list.data} router={router} />
        ) : resource === ResourceKey.GRAMMARS ||
          resource === ResourceKey.SENTENCES ? (
          <ResourceTable
            resource={resource}
            data={list.data}
            router={router}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        ) : (
          <div
            className={
              resource === ResourceKey.COLLECTIONS
                ? "collection-grid"
                : "entity-list"
            }
          >
            {list.data.map((item) => (
              <ResourceCard
                key={item.id}
                resource={resource}
                item={item}
                router={router}
                edit={() => setEditing(item)}
                remove={() => setDeleting(item)}
              />
            ))}
          </div>
        )
      ) : (
        <Empty text="暂无数据" />
      )}
      <Pagination pagination={list.pagination} onChange={list.update} />
      {editing && (
        <Editor
          resource={resource}
          item={editing}
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            void list.load();
            notify(`${meta.singular}已保存`);
          }}
        />
      )}
      {deleting && (
        <DeleteConfirmation
          subject={String(
            deleting.name ||
              deleting.word ||
              deleting.pattern ||
              deleting.japanese ||
              meta.singular,
          )}
          busy={deleteBusy}
          close={() => {
            setDeleting(null);
            setDeleteComplete(false);
          }}
          confirm={remove}
          closeRequested={deleteComplete}
        />
      )}
    </>
  );
}

function VocabularyList({
  data,
  router,
}: {
  data: Item[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <div className="vocabulary-table-wrap">
        <table className="table table-hover align-middle mb-0 vocabulary-table">
          <thead>
            <tr>
              <th>词汇</th>
              <th>假名</th>
              <th>翻译</th>
              <th>词性</th>
              <th>标签</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <button
                    className="entity-title"
                    onClick={() => go(router, `/vocabularies/${item.id}`)}
                  >
                    {item.word}
                  </button>
                </td>
                <td>{item.reading || "—"}</td>
                <td>{item.translation}</td>
                <td>
                  <MetadataBadges
                    value={item.part_of_speech_names}
                    tone="primary"
                  />
                </td>
                <td>
                  <MetadataBadges value={item.tag_names} tone="success" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="vocabulary-mobile-list">
        {data.map((item) => (
          <ResourceCard
            key={item.id}
            resource={ResourceKey.VOCABULARIES}
            item={item}
            router={router}
            edit={() => {}}
            remove={() => {}}
          />
        ))}
      </div>
    </>
  );
}

function MetadataBadges({
  value,
  tone,
}: {
  value: unknown;
  tone: "primary" | "success";
}) {
  const values = String(value || "")
    .split("、")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!values.length) return <span className="text-secondary">—</span>;
  return (
    <span className="badge-list">
      {values.map((item) => (
        <span className={`badge text-bg-${tone}`} key={item}>
          {item}
        </span>
      ))}
    </span>
  );
}

function ResourceCard({
  resource,
  item,
  router,
  edit,
  remove,
}: {
  resource: ResourceKey;
  item: Item;
  router: ReturnType<typeof useRouter>;
  edit: () => void;
  remove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (resource === ResourceKey.COLLECTIONS)
    return (
      <article className="collection-card">
        <div className="collection-menu">
          <button
            className="btn btn-sm btn-light"
            aria-label="集合操作"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <i className="bi bi-three-dots" />
          </button>
          {menuOpen && (
            <div className="dropdown-menu show">
              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  edit();
                }}
              >
                <i className="bi bi-pencil me-2" />
                编辑
              </button>
              <button
                className="dropdown-item text-danger"
                onClick={() => {
                  setMenuOpen(false);
                  remove();
                }}
              >
                <i className="bi bi-trash me-2" />
                删除
              </button>
            </div>
          )}
        </div>
        <div className="collection-title-row">
          <h2>{item.name}</h2>
          <span
            className={`badge ${item.type === CollectionType.FAVORITE ? "text-bg-success" : "text-bg-primary"}`}
          >
            {item.type === CollectionType.SOURCE
              ? "来源集合"
              : item.type === CollectionType.FAVORITE
                ? "收藏本"
                : item.type === CollectionType.ERROR
                  ? "错题本"
                  : "自建集合"}
          </span>
        </div>
        <p>{item.description || "暂无说明"}</p>
        <div className="collection-stats">
          <span>{item.member_count || 0} 词汇</span>
          <span>{item.learned_count || 0} 已学习</span>
        </div>
        <div className="card-actions">
          <button
            className="btn btn-outline-primary"
            onClick={() => go(router, `/collections/${item.id}/study`)}
          >
            学习
          </button>
          <button
            className="btn btn-primary"
            onClick={() => go(router, `/collections/${item.id}/test`)}
          >
            测试
          </button>
        </div>
      </article>
    );
  const title =
    resource === ResourceKey.VOCABULARIES
      ? item.word
      : resource === ResourceKey.GRAMMARS
        ? item.pattern
        : item.japanese;
  const subtitle =
    resource === ResourceKey.VOCABULARIES
      ? item.reading
      : resource === ResourceKey.GRAMMARS
        ? item.meaning
        : item.translation;
  if (resource === ResourceKey.VOCABULARIES)
    return (
      <article className="vocabulary-mobile-card">
        <div className="vocabulary-mobile-content">
          <button
            className="entity-title"
            onClick={() => go(router, `/vocabularies/${item.id}`)}
          >
            {item.word}
          </button>
          <div className="entity-sub">{item.reading || "—"}</div>
          <div>{item.translation}</div>
        </div>
        <div className="vocabulary-mobile-metadata">
          <MetadataBadges value={item.part_of_speech_names} tone="primary" />
          <MetadataBadges value={item.tag_names} tone="success" />
        </div>
      </article>
    );
  return (
    <article className="entity-row">
      <button
        className="entity-title"
        onClick={() => go(router, `/${resource}/${item.id}`)}
      >
        {title}
      </button>
      <div className="entity-sub">{subtitle || "—"}</div>
      <div className="row-actions">
        <button onClick={edit} aria-label="编辑">
          <i className="bi bi-pencil" />
        </button>
        <button onClick={remove} aria-label="逻辑删除">
          <i className="bi bi-trash" />
        </button>
      </div>
    </article>
  );
}

export function Editor({
  resource,
  item,
  close,
  saved,
}: {
  resource: ResourceKey;
  item: Item;
  close: () => void;
  saved: () => void;
}) {
  const [form, setForm] = useState<Item>(item);
  const [busy, setBusy] = useState(false);
  const [savedPending, setSavedPending] = useState(false);
  const [partsOfSpeech, setPartsOfSpeech] = useState<Item[]>([]);
  const [tags, setTags] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Item[]>([]);
  useEffect(() => {
    if (!["vocabularies", "grammars", "sentences"].includes(resource)) return;
    Promise.all([
      resource === ResourceKey.VOCABULARIES
        ? resourceApi.list<{ data: Item[] }>(ResourceKey.PARTS_OF_SPEECH, {
            pageSize: 100,
          })
        : Promise.resolve({ data: [] }),
      resourceApi.list<{ data: Item[] }>(ResourceKey.TAGS, { pageSize: 100 }),
      resource === ResourceKey.VOCABULARIES
        ? resourceApi.list<{ data: Item[] }>(ResourceKey.COLLECTIONS, {
            pageSize: 100,
          })
        : Promise.resolve({ data: [] }),
      item.id
        ? resourceApi.detail<Item>(resource, Number(item.id))
        : Promise.resolve(null),
    ]).then(([posResult, tagResult, collectionResult, detail]) => {
      setPartsOfSpeech(posResult.data as Item[]);
      setTags(tagResult.data);
      setCollections(collectionResult.data as Item[]);
      if (detail) {
        const selectedPos = Array.isArray(detail.pos)
          ? (detail.pos as Item[]).map((value) => Number(value.id))
          : [];
        const selectedTags = Array.isArray(detail.tags)
          ? (detail.tags as Item[]).map((value) => Number(value.id))
          : [];
        const selectedCollections = Array.isArray(detail.collections)
          ? (detail.collections as Item[]).map((value) => Number(value.id))
          : [];
        setForm({
          ...detail,
          posIds: selectedPos,
          tagIds: selectedTags,
          collectionIds: selectedCollections,
        });
      }
    });
  }, [resource, item.id]);
  const fields =
    resource === ResourceKey.VOCABULARIES
      ? [
          ["word", "词汇"],
          ["reading", "假名"],
          ["translation", "翻译"],
          ["notes", "备注"],
        ]
      : resource === ResourceKey.GRAMMARS
        ? [
            ["pattern", "语法"],
            ["reading", "读法"],
            ["meaning", "含义"],
            ["notes", "备注"],
          ]
        : resource === ResourceKey.SENTENCES
          ? [
              ["japanese", "句子"],
              ["reading", "注音"],
              ["translation", "翻译"],
              ["notes", "备注"],
            ]
          : resource === ResourceKey.TAGS
            ? [["name", "标签名称"]]
            : resource === ResourceKey.PARTS_OF_SPEECH
              ? [
                  ["name", "词性名称"],
                  ["sort_order", "显示顺序"],
                ]
              : [
                  ["name", "集合名称"],
                  ["description", "说明"],
                  ["source", "来源"],
                ];
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (item.id) await resourceApi.update(resource, Number(item.id), form);
      else await resourceApi.create(resource, form);
      setSavedPending(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form id="resource-editor-form" onSubmit={submit}>
      <Modal
        title={`${item.id ? "编辑" : "新增"}${labels[resource].singular}`}
        close={() => (savedPending ? saved() : close())}
        closeRequested={savedPending}
        size="xl"
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
              form="resource-editor-form"
              className="btn btn-primary"
              disabled={busy}
            >
              {busy ? "保存中…" : "保存"}
            </button>
          </>
        }
      >
        {fields.map(([key, label]) => (
          <label className="inline-field" key={key}>
            <span>{label}</span>
            <input
              className="form-control"
              required={[
                "word",
                "translation",
                "pattern",
                "meaning",
                "japanese",
                "name",
              ].includes(key)}
              value={String(form[key] || "")}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        {resource === ResourceKey.COLLECTIONS && (
          <label className="inline-field">
            <span>集合类型</span>
            <select
              className="form-select"
              value={String(form.type || CollectionType.CUSTOM)}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value={CollectionType.CUSTOM}>自建集合</option>
              <option value={CollectionType.SOURCE}>来源集合</option>
              <option value={CollectionType.FAVORITE}>收藏本</option>
              <option value={CollectionType.ERROR}>错题本</option>
            </select>
          </label>
        )}
        {(resource === ResourceKey.TAGS ||
          resource === ResourceKey.PARTS_OF_SPEECH) && (
          <label className="inline-field">
            <span>状态</span>
            <select
              className="form-select"
              value={Number(form.enabled ?? 1)}
              onChange={(event) =>
                setForm({ ...form, enabled: Number(event.target.value) })
              }
            >
              <option value={1}>启用</option>
              <option value={0}>停用</option>
            </select>
          </label>
        )}
        {resource === ResourceKey.VOCABULARIES && (
          <>
            <CheckboxOverlaySelect
              label="词性"
              options={partsOfSpeech}
              selected={
                Array.isArray(form.posIds) ? (form.posIds as number[]) : []
              }
              onChange={(posIds) => setForm({ ...form, posIds })}
            />
            <CheckboxOverlaySelect
              label="所在集合"
              options={collections}
              selected={
                Array.isArray(form.collectionIds)
                  ? (form.collectionIds as number[])
                  : []
              }
              onChange={(collectionIds) => setForm({ ...form, collectionIds })}
            />
            <CheckboxOverlaySelect
              label="标签"
              options={tags}
              selected={
                Array.isArray(form.tagIds) ? (form.tagIds as number[]) : []
              }
              onChange={(tagIds) => setForm({ ...form, tagIds })}
            />
          </>
        )}
        {["grammars", "sentences"].includes(resource) && (
          <CheckboxOverlaySelect
            label="标签"
            options={tags}
            selected={
              Array.isArray(form.tagIds) ? (form.tagIds as number[]) : []
            }
            onChange={(tagIds) => setForm({ ...form, tagIds })}
          />
        )}
      </Modal>
    </form>
  );
}
