"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type SelectionState = {
  text: string;
  centerX: number;
  top: number;
  bottom: number;
};

type LookupTarget = "kanjipedia" | "weblio";

const singleKanjiPattern = /^\p{Script=Han}$/u;

function isEditableSelection(selection: Selection) {
  const node = selection.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement;
  return Boolean(element?.closest("input, textarea, [contenteditable='true']"));
}

function lookupZone(node: Node | null) {
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest<HTMLElement>("[data-vocabulary-lookup='true']") ?? null;
}

export default function SelectionLookup() {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, ready: false, below: false });
  const [opening, setOpening] = useState<LookupTarget | null>(null);

  const readSelection = useCallback(() => {
    const current = window.getSelection();
    const text = current?.toString().trim() ?? "";
    const anchorZone = current ? lookupZone(current.anchorNode) : null;
    const focusZone = current ? lookupZone(current.focusNode) : null;
    if (
      !current
      || current.rangeCount === 0
      || !text
      || isEditableSelection(current)
      || !anchorZone
      || anchorZone !== focusZone
    ) {
      setSelection(null);
      return;
    }
    const range = current.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setSelection(null);
      return;
    }
    setPosition((value) => ({ ...value, ready: false }));
    setSelection({
      text,
      centerX: rect.left + rect.width / 2,
      top: rect.top,
      bottom: rect.bottom,
    });
  }, []);

  useEffect(() => {
    const scheduleRead = () => {
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(readSelection);
    };
    const dismiss = () => setSelection(null);
    document.addEventListener("selectionchange", scheduleRead);
    document.addEventListener("pointerup", scheduleRead);
    document.addEventListener("keyup", scheduleRead);
    document.addEventListener("touchend", scheduleRead, { passive: true });
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      document.removeEventListener("selectionchange", scheduleRead);
      document.removeEventListener("pointerup", scheduleRead);
      document.removeEventListener("keyup", scheduleRead);
      document.removeEventListener("touchend", scheduleRead);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    };
  }, [readSelection]);

  useLayoutEffect(() => {
    if (!selection || !toolbarRef.current) return;
    const toolbar = toolbarRef.current.getBoundingClientRect();
    const gap = 10;
    const edge = 8;
    const left = Math.min(
      window.innerWidth - toolbar.width - edge,
      Math.max(edge, selection.centerX - toolbar.width / 2),
    );
    const above = selection.top - toolbar.height - gap;
    const below = above < edge;
    const top = !below
      ? above
      : Math.min(window.innerHeight - toolbar.height - edge, selection.bottom + gap);
    setPosition({ left, top, ready: true, below });
  }, [selection]);

  function openLookup(target: LookupTarget) {
    if (!selection) return;
    setOpening(target);
    const encoded = encodeURIComponent(selection.text);
    const url = target === "kanjipedia"
      ? `https://www.kanjipedia.jp/search?kt=1&sk=leftHand&k=${encoded}`
      : `https://www.weblio.jp/content/${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setOpening(null), 180);
  }

  if (!selection) return null;
  const isSingleKanji = singleKanjiPattern.test(selection.text);

  return (
    <div
      ref={toolbarRef}
      className={`selectionLookup ${position.ready ? "ready" : ""} ${position.below ? "below" : ""}`}
      style={{ left: position.left, top: position.top }}
      role="toolbar"
      aria-label={`查询“${selection.text}”`}
    >
      {isSingleKanji && (
        <button
          className={opening === "kanjipedia" ? "opening" : ""}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => openLookup("kanjipedia")}
          title="在汉字百科查询"
          aria-label={`在汉字百科查询“${selection.text}”`}
        >
          <img src="/icons/lookup/kanjipedia.png" alt="" />
          <span>漢字ペディア</span>
        </button>
      )}
      <button
        className={opening === "weblio" ? "opening" : ""}
        type="button"
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => openLookup("weblio")}
        title="在 Weblio 查询"
        aria-label={`在 Weblio 查询“${selection.text}”`}
      >
        <img src="/icons/lookup/weblio.png" alt="" />
        <span>Weblio</span>
      </button>
      <span className="selectionLookupArrow" aria-hidden="true" />
    </div>
  );
}
