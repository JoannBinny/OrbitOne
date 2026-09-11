import type { ReactNode } from "react";
import "./AgentResultText.css";

/**
 * Renders the agent's real result_text (light markdown: **bold**, "- " bullet
 * lists, "1. " numbered lists, blank-line paragraphs) as formatted output
 * instead of raw asterisks. This is presentation only — it never changes or
 * summarizes the real text the agent returned.
 */
export function AgentResultText({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return <div className="agent-result">{blocks}</div>;
}

function renderInline(line: string, key: number): ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <p key={key} className="agent-result__p">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function stripListMarker(line: string): string {
  return line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
}

function parseBlocks(text: string): ReactNode[] {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(stripListMarker(lines[i].trim()));
        i++;
      }
      blocks.push(
        <ul className="agent-result__list" key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFragments(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(stripListMarker(lines[i].trim()));
        i++;
      }
      blocks.push(
        <ol className="agent-result__list" key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineFragments(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    blocks.push(renderInline(trimmed, key++));
    i++;
  }

  return blocks;
}

function renderInlineFragments(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}
