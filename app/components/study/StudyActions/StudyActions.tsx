import type { StudyActionsProps } from "./types";
export function StudyActions({ item, mark }: StudyActionsProps) {
  return (
    <div className="study-row-actions justify-content-end">
      <button
        className="btn btn-outline-primary"
        onClick={() => mark(item, "review")}
      >
        复习
      </button>
      <button className="btn btn-primary" onClick={() => mark(item, "learn")}>
        已学习
      </button>
    </div>
  );
}
