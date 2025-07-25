'use client';

import { useMemo } from 'react';
import type { TextBlockContent } from '../types';

interface TextBlockViewProps {
  content: TextBlockContent;
  title?: string;
}

// Simple markdown parser for basic formatting
function parseMarkdown(text: string): string {
  return (
    text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, '<br />')
  );
}

export function TextBlockView({ content, title }: TextBlockViewProps) {
  const {
    text,
    formatting = 'plain',
    richContent,
    wordCount,
    readingTime,
  } = content;

  const renderedContent = useMemo(() => {
    // Prioritize rich content if available
    if (formatting === 'rich' && richContent) {
      return richContent;
    }

    if (formatting === 'markdown') {
      return parseMarkdown(text);
    }

    return text.replace(/\n/g, '<br />');
  }, [text, formatting, richContent]);

  // Don't render if no content
  if (!text.trim() && !richContent?.trim()) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-foreground text-2xl font-bold dark:text-white">
          {title}
        </h2>
      )}

      {/* Reading Stats for Rich Content */}
      {formatting === 'rich' && (wordCount || readingTime) && (
        <div className="text-foreground/60 border-border flex items-center gap-4 border-b pb-3 text-sm">
          {wordCount && <span>{wordCount} words</span>}
          {readingTime && <span>{readingTime} min read</span>}
        </div>
      )}

      {/* Content Rendering */}
      <div className="prose prose-lg prose-foreground max-w-none">
        {formatting === 'rich' ? (
          <div
            className="rich-content [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        ) : formatting === 'markdown' ? (
          <div
            className="text-foreground/90 leading-relaxed dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        ) : (
          <p
            className="text-foreground/90 leading-relaxed whitespace-pre-wrap dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}
      </div>
    </div>
  );
}
