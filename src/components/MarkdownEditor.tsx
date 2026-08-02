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

  const replaceSelection = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "teks";
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    setValue(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + prefix.length;
      textarea.setSelectionRange(selectionStart, selectionStart + selected.length);
    });
  };

  const prefixLines = (prefix: string, numbered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "Tulis poin di sini";
    const lines = selected.split("\n");
    const formatted = lines.map((line, index) => `${numbered ? `${index + 1}. ` : prefix}${line}`).join("\n");
    const next = `${value.slice(0, start)}${formatted}${value.slice(end)}`;
    setValue(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    });
  };

  const toolbar: Array<{ label: string; title: string; action: "bold" | "italic" | "bullet" | "numbered" | "link" }> = [
    { label: "B", title: "Bold", action: "bold" },
    { label: "I", title: "Italic", action: "italic" },
    { label: "•", title: "Bullet list", action: "bullet" },
    { label: "1.", title: "Numbered list", action: "numbered" },
    { label: "Link", title: "Link", action: "link" },
  ];

  const handleToolbar = (action: (typeof toolbar)[number]["action"]) => {
    if (action === "bold") replaceSelection("**");
    if (action === "italic") replaceSelection("*");
    if (action === "bullet") prefixLines("- ");
    if (action === "numbered") prefixLines("", true);
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
