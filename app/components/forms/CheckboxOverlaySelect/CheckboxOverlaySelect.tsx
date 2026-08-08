"use client";
import { useEffect, useRef, useState } from "react";
import type { CheckboxOverlaySelectProps } from "./types";
import "./style.scss";

export function CheckboxOverlaySelect({
  label,
  options,
  selected,
  onChange,
}: CheckboxOverlaySelectProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const names = options
    .filter((option) => selected.includes(Number(option.id)))
    .map((option) => String(option.name));
  const toggle = (id: number) =>
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  return (
    <div className="inline-field">
      <span>{label}</span>
      <div className="checkbox-overlay-select" ref={root}>
        <button
          type="button"
          className="form-select checkbox-overlay-trigger"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={names.length ? "" : "text-secondary"}>
            {names.length ? names.join("、") : "请选择"}
          </span>
        </button>
        {open && (
          <div className="checkbox-overlay-panel shadow">
            <div className="checkbox-overlay-options">
              {options.map((option) => {
                const id = Number(option.id);
                return (
                  <label
                    className="form-check checkbox-overlay-option"
                    key={id}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selected.includes(id)}
                      onChange={() => toggle(id)}
                    />
                    <span className="form-check-label">{option.name}</span>
                  </label>
                );
              })}
            </div>
            {!options.length && (
              <span className="text-secondary">暂无可选项</span>
            )}
            {!!selected.length && (
              <button
                type="button"
                className="btn btn-link btn-sm px-0 mt-2"
                onClick={() => onChange([])}
              >
                清除选择
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
