"use client";
import { ResourceKey } from "../../../config/resources";
import { go } from "../../../utils/navigation";
import type { ResourceTableProps } from "./types";
import "./style.scss";

export function ResourceTable({
  resource,
  data,
  router,
  onEdit,
  onDelete,
}: ResourceTableProps) {
  const isGrammar = resource === ResourceKey.GRAMMARS;
  return (
    <>
      <div className="resource-table-wrap">
        <table className="table table-hover align-middle mb-0 resource-table">
          <thead>
            <tr>
              <th>{isGrammar ? "语法" : "句子"}</th>
              <th>{isGrammar ? "含义" : "翻译"}</th>
              <th className="resource-operation-column">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <button
                    className="entity-title"
                    onClick={() => go(router, `/${resource}/${item.id}`)}
                  >
                    {isGrammar ? item.pattern : item.japanese}
                  </button>
                </td>
                <td>{isGrammar ? item.meaning : item.translation}</td>
                <td>
                  <div className="row-actions justify-content-end">
                    <button onClick={() => onEdit(item)} aria-label="编辑">
                      <i className="bi bi-pencil" />
                    </button>
                    <button onClick={() => onDelete(item)} aria-label="删除">
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="resource-mobile-list">
        {data.map((item) => (
          <article className="resource-mobile-row" key={item.id}>
            <div>
              <button
                className="entity-title"
                onClick={() => go(router, `/${resource}/${item.id}`)}
              >
                {isGrammar ? item.pattern : item.japanese}
              </button>
              <div>{isGrammar ? item.meaning : item.translation}</div>
            </div>
            <div className="row-actions">
              <button onClick={() => onEdit(item)} aria-label="编辑">
                <i className="bi bi-pencil" />
              </button>
              <button onClick={() => onDelete(item)} aria-label="删除">
                <i className="bi bi-trash" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
