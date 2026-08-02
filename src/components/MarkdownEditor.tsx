"use client";

import { useRef, useState } from "react";

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string | null;
  rows?: number;
};

export default function MarkdownEditor({ name, defaultValue = "", rows = 7 }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const restoreSelection = (start: number, end: number, scrollTop: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(start, end);
      textarea.scrollTop = scrollTop;
    });
  };

  const replaceSelection = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    setValue(next);

    const selectionStart = start + prefix.length;
    restoreSelection(selectionStart, selectionStart + selected.length, scrollTop);
  };

  const getLineRange = (start: number, end: number) => {
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf("\n", end);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    return { lineStart, lineEnd };
  };

  const prefixLines = (prefix: string, numbered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const originalStart = textarea.selectionStart;
    const originalEnd = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const hasSelection = originalStart !== originalEnd;
    let start = originalStart;
    let end = originalEnd;
    if (!hasSelection) {
      const range = getLineRange(start, end);
      start = range.lineStart;
      end = range.lineEnd;
    }
    const selected = value.slice(start, end);
    const lines = selected.split("\n");
    const formatted = lines.map((line, index) => {
      const indentation = line.match(/^\s*/)?.[0] || "";
      return `${indentation}${numbered ? `${index + 1}. ` : prefix}${line.slice(indentation.length)}`;
    }).join("\n");
    const next = `${value.slice(0, start)}${formatted}${value.slice(end)}`;
    setValue(next);

    if (hasSelection) {
      restoreSelection(start, start + formatted.length, scrollTop);
    } else {
      const firstLineIndent = lines[0].match(/^\s*/)?.[0] || "";
      const firstMarker = numbered ? "1. " : prefix;
      const cursor = originalStart + firstLineIndent.length + firstMarker.length;
      restoreSelection(cursor, cursor, scrollTop);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { lineStart, lineEnd } = getLineRange(start, end);
    const line = value.slice(lineStart, lineEnd);
    const listMatch = line.match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/);

    if (event.key === "Tab") {
      event.preventDefault();
      const indentation = line.match(/^\s*/)?.[0] || "";
      if (event.shiftKey) {
        const removeCount = indentation.endsWith("  ") ? 2 : indentation.length > 0 ? 1 : 0;
        if (removeCount > 0) {
          const next = `${value.slice(0, lineStart)}${indentation.slice(removeCount)}${value.slice(lineStart + indentation.length)}`;
          setValue(next);
          requestAnimationFrame(() => textarea.setSelectionRange(Math.max(lineStart, start - removeCount), Math.max(lineStart, end - removeCount)));
        }
      } else {
        const next = `${value.slice(0, lineStart)}  ${value.slice(lineStart)}`;
        setValue(next);
        requestAnimationFrame(() => textarea.setSelectionRange(start + 2, end + 2));
      }
      return;
    }

    if (event.key === "Enter" && listMatch) {
      event.preventDefault();
      const indentation = listMatch[1];
      const marker = listMatch[2];
      const content = listMatch[3].trim();

      if (!content) {
        const next = `${value.slice(0, lineStart)}${indentation}\n${value.slice(lineEnd)}`;
        setValue(next);
        requestAnimationFrame(() => textarea.setSelectionRange(lineStart + indentation.length + 1, lineStart + indentation.length + 1));
        return;
      }

      const nextMarker = /^\d/.test(marker) ? `${Number.parseInt(marker, 10) + 1}.` : marker;
      const next = `${value.slice(0, start)}\n${indentation}${nextMarker} ${value.slice(start)}`;
      setValue(next);
      const cursor = start + indentation.length + nextMarker.length + 1;
      requestAnimationFrame(() => textarea.setSelectionRange(cursor, cursor));
    }
  };

  const toolbar: Array<{ label: string; title: string; action: "bold" | "italic" | "underline" | "bullet" | "numbered" | "quote" | "heading" | "link" }> = [
    { label: "B", title: "Bold", action: "bold" },
    { label: "I", title: "Italic", action: "italic" },
    { label: "U", title: "Underline", action: "underline" },
    { label: "•", title: "Bullet list", action: "bullet" },
    { label: "1.", title: "Numbered list", action: "numbered" },
    { label: "\"", title: "Quote", action: "quote" },
    { label: "H2", title: "Heading", action: "heading" },
    { label: "Link", title: "Link", action: "link" },
  ];

  const handleToolbar = (action: (typeof toolbar)[number]["action"]) => {
    if (action === "bold") replaceSelection("**");
    if (action === "italic") replaceSelection("*");
    if (action === "underline") replaceSelection("__");
    if (action === "bullet") prefixLines("- ");
    if (action === "numbered") prefixLines("", true);
    if (action === "quote") prefixLines("> ");
    if (action === "heading") prefixLines("## ");
    if (action === "link") replaceSelection("[", "](https://)");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#d5dee8] bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#edf0f4] bg-[#f8fbfc] p-2">
        {toolbar.map((button) => (
          <button
            key={button.title}
            type="button"
            title={button.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleToolbar(button.action)}
            className="min-h-8 min-w-8 rounded-lg px-2 text-xs font-bold text-[#526176] transition hover:bg-[#e8f4f7] hover:text-[#176b87]"
          >
            {button.label}
          </button>
        ))}
        <span className="ml-auto hidden text-[11px] text-[#8a98a8] sm:block">Format tersimpan sebagai Markdown</span>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder="Tulis deskripsi event..."
        className="block w-full resize-y border-0 px-3 py-3 text-sm leading-6 text-[#152238] outline-none placeholder:text-[#99a6b7]"
      />
      <p className="border-t border-[#edf0f4] px-3 py-2 text-[11px] text-[#8a98a8]">
        Gunakan toolbar untuk menambahkan teks tebal, italic, bullet, numbering, atau link.
      </p>
    </div>
  );
}
