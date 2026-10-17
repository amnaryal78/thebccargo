import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const renderFormattedText = (text: string): React.ReactNode[] => {
    // Helper to parse inline markdown: **bold**, *italic*, `code`, [link](url)
    // We split by regex tokens
    const tokens: React.ReactNode[] = [];
    let keyIndex = 0;

    // Regex for bold (**text** or __text__), italic (*text* or _text_), code (`code`), links ([text](url))
    const inlineRegex = /(\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(inlineRegex);

    for (const part of parts) {
      if (!part) continue;

      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        tokens.push(
          <strong key={keyIndex++} className="font-bold text-slate-900">
            {inner}
          </strong>
        );
      } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        const inner = part.slice(1, -1);
        tokens.push(
          <em key={keyIndex++} className="italic text-slate-800">
            {inner}
          </em>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        tokens.push(
          <code key={keyIndex++} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-[#002147]">
            {inner}
          </code>
        );
      } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          const label = match[1];
          const url = match[2];
          // Sanitize URL to prevent javascript: XSS
          const safeUrl = url.trim().toLowerCase().startsWith('javascript:') ? '#' : url;
          tokens.push(
            <a
              key={keyIndex++}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002147] underline font-semibold hover:opacity-80"
            >
              {label}
            </a>
          );
        } else {
          tokens.push(part);
        }
      } else {
        tokens.push(part);
      }
    }

    return tokens;
  };

  // Split content into blocks by code blocks or double newlines
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ul' ? 'ul' : 'ol';
      const listClass = listType === 'ul' ? 'list-disc pl-6 space-y-1.5 my-3' : 'list-decimal pl-6 space-y-1.5 my-3';
      elements.push(
        <ListTag key={`list-${elements.length}`} className={listClass}>
          {listItems.map((item, idx) => (
            <li key={idx} className="text-slate-700">
              {renderFormattedText(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code blocks ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <div key={`code-${elements.length}`} className="my-4 rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100 border border-slate-800 overflow-x-auto">
            <pre>{codeBlockLines.join('\n')}</pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Check list items (- item, * item, 1. item)
    const ulMatch = line.match(/^[\*\-]\s+(.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    } else {
      flushList();
    }

    // Check headings (#, ##, ###, ####)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="font-heading font-bold text-lg sm:text-xl text-slate-900 mt-6 mb-2 tracking-tight">
          {renderFormattedText(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mt-8 mb-3 tracking-tight border-b border-slate-200 pb-2">
          {renderFormattedText(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elements.length}`} className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-8 mb-4 tracking-tight">
          {renderFormattedText(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${elements.length}`} className="my-4 border-l-4 border-[#002147] pl-4 py-2 italic text-slate-600 bg-slate-50 rounded-r-lg">
          {renderFormattedText(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed text-slate-800">
          {renderFormattedText(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className={`prose max-w-none font-sans text-sm sm:text-base ${className}`}>{elements}</div>;
};
