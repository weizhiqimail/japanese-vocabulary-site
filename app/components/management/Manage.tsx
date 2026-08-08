"use client";
import { FormEvent, useEffect, useState } from "react";
import type { useRouter } from "next/navigation";
import { ManageSection } from "../../config/enums";
import { ResourceKey } from "../../config/resources";
import { Pagination } from "../pagination/Pagination";
import { Editor, useList } from "../resources/ResourceList";
import { Empty, Heading } from "../common";
import { go } from "../../utils/navigation";
import { createImport, reviewImport } from "../../http/imports";
import { getSettings, updateSetting } from "../../http/settings";
import type { Item } from "../../types/models";

const titles: Record<ManageSection, [string, string]> = {
  [ManageSection.IMPORTS]: [
    "导入审核",
    "CSV 先进入非正式审核池，批准后才进入词库。",
  ],
  [ManageSection.TAGS]: ["标签", "维护统一的词汇属性标签。"],
  [ManageSection.PARTS_OF_SPEECH]: ["词性", "查看系统固定词性。"],
  [ManageSection.SETTINGS]: ["设置", "维护学习和测试默认设置。"],
};
export function Manage({
  section,
  router,
  notify,
}: {
  section: ManageSection;
  router: ReturnType<typeof useRouter>;
  notify: (s: string, d?: boolean) => void;
}) {
  const [title, subtitle] = titles[section];
  return (
    <>
      <nav className="subnav">
        {Object.values(ManageSection).map((value) => (
          <button
            className={value === section ? "active" : ""}
            key={value}
            onClick={() => go(router, `/manage/${value}`)}
          >
            {titles[value][0]}
          </button>
        ))}
      </nav>
      <Heading
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: "管理", href: "/manage/imports" }, { label: title }]}
      />
      {section === ManageSection.IMPORTS ? (
        <ImportPanel notify={notify} />
      ) : section === ManageSection.SETTINGS ? (
        <Settings notify={notify} />
      ) : (
        <ManageList resource={section} notify={notify} />
      )}
    </>
  );
}
function ManageList({
  resource,
  notify,
}: {
  resource: string;
  notify: (s: string, d?: boolean) => void;
}) {
  const list = useList(resource as ResourceKey);
  const [editing, setEditing] = useState<Item | null>(null);
  return (
    <>
      {resource === ResourceKey.TAGS && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => setEditing({ color: "info" })}
        >
          新增标签
        </button>
      )}
      {list.data.length ? (
        <div className="entity-list">
          {list.data.map((item) => (
            <article className="entity-row management-row" key={item.id}>
              <div className="management-name">
                <strong>{item.name}</strong>
                <small>{item.code || ""}</small>
              </div>
              <span
                className={`badge ${item.enabled ? "text-bg-success" : "text-bg-secondary"}`}
              >
                {item.enabled ? "启用" : "停用"}
              </span>
              {(resource === ResourceKey.TAGS ||
                resource === ResourceKey.PARTS_OF_SPEECH) && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setEditing(item)}
                >
                  编辑
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty text="暂无数据" />
      )}
      <Pagination pagination={list.pagination} onChange={list.update} />
      {editing && (
        <Editor
          resource={resource as ResourceKey}
          item={editing}
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            void list.load();
            notify("标签已保存");
          }}
        />
      )}
    </>
  );
}
function ImportPanel({ notify }: { notify: (s: string, d?: boolean) => void }) {
  const list = useList(ResourceKey.IMPORTS);
  const [busy, setBusy] = useState(false);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const rows = parseCsv(await file.text());
      const [head, ...body] = rows;
      const candidates = body.map((row) =>
        Object.fromEntries(head.map((key, i) => [key.trim(), row[i] || ""])),
      );
      await createImport(file.name, candidates);
      notify("CSV 已进入审核池");
      await list.load();
    } catch (error) {
      notify((error as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  async function review(id: number, decision: string) {
    await reviewImport(id, decision);
    notify("审核状态已更新");
    await list.load();
  }
  return (
    <>
      <label className="btn btn-primary mb-3">
        {busy ? "导入中…" : "选择 CSV"}
        <input
          type="file"
          accept=".csv,text/csv"
          hidden
          disabled={busy}
          onChange={upload}
        />
      </label>
      <div className="entity-list">
        {list.data.map((item) => (
          <article className="entity-row" key={item.id}>
            <strong>{item.word}</strong>
            <div>{item.reading || "—"}</div>
            <div>{item.translation}</div>
            {item.status === "pending" && (
              <div className="row-actions">
                <button onClick={() => review(Number(item.id), "approve")}>
                  批准
                </button>
                <button onClick={() => review(Number(item.id), "reject")}>
                  拒绝
                </button>
                <button onClick={() => review(Number(item.id), "not_needed")}>
                  无需导入
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      <Pagination pagination={list.pagination} onChange={list.update} />
    </>
  );
}
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) {
      field += '"';
      i++;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
function Settings({ notify }: { notify: (s: string, d?: boolean) => void }) {
  const [value, setValue] = useState<Item>({ size: 20 });
  useEffect(() => {
    getSettings<Record<string, Item>>().then((response) =>
      setValue(response.test_defaults || { size: 20 }),
    );
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    await updateSetting("test_defaults", value);
    notify("设置已保存");
  }
  return (
    <form className="settings-card" onSubmit={submit}>
      <label className="inline-field">
        <span>默认测试数量</span>
        <select
          className="form-select"
          value={Number(value.size || 20)}
          onChange={(e) => setValue({ ...value, size: Number(e.target.value) })}
        >
          {[10, 20, 30, 50, 100].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary">保存设置</button>
    </form>
  );
}
