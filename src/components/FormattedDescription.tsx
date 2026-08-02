import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (match) {
        return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#176b87] underline">{match[1]}</a>;
      }
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function FormattedDescription({ value }: { value: string }) {
  const blocks = value.trim().split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const bulletList = lines.length > 0 && lines.every((line) => /^\s*[-*]\s+/.test(line));
        const numberedList = lines.length > 0 && lines.every((line) => /^\s*\d+[.)]\s+/.test(line));

        if (bulletList) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5">
              {lines.map((line, index) => <li key={index}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>)}
            </ul>
          );
        }

        if (numberedList) {
          return (
            <ol key={blockIndex} className="list-decimal space-y-1 pl-5">
              {lines.map((line, index) => <li key={index}>{renderInline(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>)}
            </ol>
          );
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, index) => <span key={index}>{index > 0 && <br />}{renderInline(line)}</span>)}
          </p>
        );
      })}
    </div>
  );
}
