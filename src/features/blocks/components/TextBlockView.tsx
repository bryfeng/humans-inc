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
  const { text, formatting = 'plain' } = content;

  const renderedContent = useMemo(() => {
    if (formatting === 'markdown') {
      return parseMarkdown(text);
    }
    return text.replace(/\n/g, '<br />');
  }, [text, formatting]);

  if (!text.trim()) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-foreground text-2xl font-bold dark:text-white">
          {title}
        </h2>
      )}

      <div className="prose prose-foreground max-w-none">
        {formatting === 'markdown' ? (
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
