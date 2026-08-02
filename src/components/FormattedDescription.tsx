import type { ReactNode } from "react";

type ListNode = {
  ordered: boolean;
  text: string;
  children: ListNode[];
};

type DescriptionBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; lines: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "heading"; line: string };

function renderInline(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g;
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
    if (part.startsWith("__") && part.endsWith("__")) {
      return <u key={index}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function parseList(lines: string[]): ListNode[] {
  const roots: ListNode[] = [];
  const stack: Array<{ indent: number; node: ListNode }> = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/);
    if (!match) continue;

    const node: ListNode = {
      ordered: /^\d/.test(match[2]),
      text: match[3],
      children: [],
    };
    const indent = match[1].replace(/\t/g, "  ").length;

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length > 0) {
      stack[stack.length - 1].node.children.push(node);
    } else {
      roots.push(node);
    }
    stack.push({ indent, node });
  }

  return roots;
}

function parseBlocks(value: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let current: DescriptionBlock | null = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const line of value.trim().split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }

    if (/^#{1,3}\s+.+/.test(trimmed)) {
      flush();
      blocks.push({ type: "heading", line: trimmed });
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      if (!current || current.type !== "quote") {
        flush();
        current = { type: "quote", lines: [] };
      }
      current.lines.push(line);
      continue;
    }

    if (/^\s*(?:[-*]|\d+[.)])\s+/.test(line)) {
      if (!current || current.type !== "list") {
        flush();
        current = { type: "list", lines: [] };
      }
      current.lines.push(line);
      continue;
    }

    if (!current || current.type !== "paragraph") {
      flush();
      current = { type: "paragraph", lines: [] };
    }
    current.lines.push(line);
  }

  flush();
  return blocks;
}

function RenderList({ nodes, nested = false }: { nodes: ListNode[]; nested?: boolean }) {
  const ListTag = nodes[0]?.ordered ? "ol" : "ul";
  return (
    <ListTag className={`${nested ? "mt-1" : ""} list-${nodes[0]?.ordered ? "decimal" : "disc"} space-y-1 pl-5`}>
      {nodes.map((node, index) => (
        <li key={`${node.text}-${index}`}>
          {renderInline(node.text)}
          {node.children.length > 0 && <RenderList nodes={node.children} nested />}
        </li>
      ))}
    </ListTag>
  );
}

export default function FormattedDescription({ value }: { value: string }) {
  const blocks = parseBlocks(value);

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        if (block.type === "list") {
          return <RenderList key={blockIndex} nodes={parseList(block.lines)} />;
        }

        if (block.type === "quote") {
          return (
            <blockquote key={blockIndex} className="border-l-4 border-[#8bcbd3] bg-[#f2fafb] px-4 py-3 italic text-[#526176]">
              {block.lines.map((line, index) => <span key={index}>{index > 0 && <br />}{renderInline(line.replace(/^\s*>\s?/, ""))}</span>)}
            </blockquote>
          );
        }

        if (block.type === "heading") {
          const heading = block.line.match(/^#{1,3}\s+(.+)$/);
          const HeadingTag = block.line.startsWith("###") ? "h3" : block.line.startsWith("##") ? "h2" : "h1";
          return <HeadingTag key={blockIndex} className="font-bold tracking-tight text-[#152238]">{renderInline(heading?.[1] || block.line)}</HeadingTag>;
        }

        return (
          <p key={blockIndex}>
            {block.lines.map((line, index) => <span key={index}>{index > 0 && <br />}{renderInline(line)}</span>)}
          </p>
        );
      })}
    </div>
  );
}
