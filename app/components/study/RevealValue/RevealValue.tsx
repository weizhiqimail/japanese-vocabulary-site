"use client";
import type { RevealValueProps } from "./types";
export function RevealValue({ value, visible, onToggle }: RevealValueProps) {
  if (!value) return null;
  return (
    <button type="button" className="study-reveal-value" onClick={onToggle}>
      {visible ? String(value) : "•••"}
    </button>
  );
}
