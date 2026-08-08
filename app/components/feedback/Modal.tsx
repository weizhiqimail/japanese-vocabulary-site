"use client";

import { useEffect, useState } from "react";
import type { ModalProps } from "./Modal/types";

export function Modal({
  title,
  children,
  footer,
  close,
  size,
  closeRequested = false,
}: ModalProps) {
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, []);

  useEffect(() => {
    if (closeRequested) requestClose();
  }, [closeRequested]);

  function requestClose() {
    if (closing) return;
    setClosing(true);
    setShown(false);
    window.setTimeout(close, 180);
  }

  return (
    <div
      className={`modal fade d-block ${shown ? "show" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size ? `modal-${size}` : ""} ${size === "xl" ? "app-modal-expansive" : ""}`}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="app-modal-title">
              {title}
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label="关闭"
              onClick={requestClose}
            />
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{footer}</div>
        </div>
      </div>
      <div
        className={`modal-backdrop fade ${shown ? "show" : ""}`}
        onMouseDown={requestClose}
      />
    </div>
  );
}
