import { useEffect, useMemo, useState } from "react";
import { PAGE_SIZE_OPTIONS } from "../../config/resources";
import type { PaginationState } from "../../types/common";

export function Pagination({
  pagination,
  onChange,
}: {
  pagination: PaginationState;
  onChange: (values: Partial<PaginationState>) => void;
}) {
  const pages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const [jump, setJump] = useState("");
  useEffect(() => setJump(""), [pagination.pageNum, pagination.pageSize]);
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(pages - 4, pagination.pageNum - 2));
    return Array.from(
      { length: Math.min(5, pages) },
      (_, index) => start + index,
    );
  }, [pages, pagination.pageNum]);

  const goTo = (pageNum: number) =>
    onChange({ pageNum: Math.max(1, Math.min(pages, pageNum)) });

  return (
    <nav className="pager" aria-label="分页">
      <div className="page-buttons">
        <button
          className="btn btn-outline-primary"
          disabled={pagination.pageNum <= 1}
          onClick={() => goTo(pagination.pageNum - 1)}
        >
          上一页
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            className={`btn ${pageNum === pagination.pageNum ? "btn-primary" : "btn-outline-primary"}`}
            key={pageNum}
            onClick={() => goTo(pageNum)}
            aria-current={pageNum === pagination.pageNum ? "page" : undefined}
          >
            {pageNum}
          </button>
        ))}
        <button
          className="btn btn-outline-primary"
          disabled={pagination.pageNum >= pages}
          onClick={() => goTo(pagination.pageNum + 1)}
        >
          下一页
        </button>
        <input
          className="form-control pager-jump"
          value={jump}
          onChange={(event) => setJump(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          aria-label="跳转页码"
        />
        <button
          className="btn btn-outline-primary"
          onClick={() => goTo(Number(jump) || 1)}
        >
          跳转
        </button>
        <label className="pager-size">
          <span>每页</span>
          <select
            className="form-select"
            value={pagination.pageSize}
            onChange={(event) =>
              onChange({ pageSize: Number(event.target.value), pageNum: 1 })
            }
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>条</span>
        </label>
      </div>
    </nav>
  );
}
