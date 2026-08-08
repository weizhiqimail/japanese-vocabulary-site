import { Modal } from "../Modal";
import type { DeleteConfirmationProps } from "./types";
export function DeleteConfirmation({
  subject,
  busy,
  close,
  confirm,
  closeRequested,
}: DeleteConfirmationProps) {
  return (
    <Modal
      title="确认删除"
      size="sm"
      close={close}
      closeRequested={closeRequested}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={close}
            disabled={busy}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirm}
            disabled={busy}
          >
            {busy ? "删除中…" : "确认删除"}
          </button>
        </>
      }
    >
      <p className="mb-1">确定要删除“{subject}”吗？</p>
      <p className="text-secondary small mb-0">
        该操作采用逻辑删除，不会清理数据库中的历史记录。
      </p>
    </Modal>
  );
}
