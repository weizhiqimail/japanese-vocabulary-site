import type { EmptyProps } from "./types";
export function Empty({ text }: EmptyProps) {
  return (
    <div className="empty">
      <i className="bi bi-inbox" />
      <p>{text}</p>
    </div>
  );
}
