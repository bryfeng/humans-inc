'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TextBlockContent } from '../types';

interface TextBlockViewProps {
  content: TextBlockContent;
  title?: string;
  mode?: 'preview' | 'full';
  blockId?: string;
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

export function TextBlockView({
  content,
  title,
  mode = 'full',
  blockId,
}: TextBlockViewProps) {
  const pathname = usePathname();
  const {
    text,
    formatting = 'plain',
    richContent,
    wordCount,
    readingTime,
  } = content;

  // Helper function to truncate content for preview mode
  const truncateContent = (
    content: string,
    limit: number = 500
  ): { content: string; isTruncated: boolean } => {
    const strippedContent = content.replace(/<[^>]*>/g, ''); // Strip HTML for character counting
    if (strippedContent.length <= limit) {
      return { content, isTruncated: false };
    }

    // Find a good break point near the limit
    const truncated = strippedContent.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    const breakPoint = lastSpace > limit * 0.8 ? lastSpace : limit;

    // For HTML content, we need to be more careful about truncation
    if (content.includes('<')) {
      return {
        content: strippedContent.substring(0, breakPoint) + '...',
        isTruncated: true,
      };
    }

    return {
      content: content.substring(0, breakPoint) + '...',
      isTruncated: true,
    };
  };

  const renderedContent = useMemo(() => {
    let fullContent = '';

    // Prioritize rich content if available
    if (formatting === 'rich' && richContent) {
      fullContent = richContent;
    } else if (formatting === 'markdown') {
      fullContent = parseMarkdown(text);
    } else {
      fullContent = text.replace(/\n/g, '<br />');
    }

    // Apply truncation for preview mode
    if (mode === 'preview') {
      const { content: truncatedContent } = truncateContent(fullContent);
      return truncatedContent;
    }

    return fullContent;
  }, [text, formatting, richContent, mode]);

  // Check if content is truncated for preview
  const isPreviewTruncated = useMemo(() => {
    if (mode !== 'preview') return false;

    const fullContent =
      formatting === 'rich' && richContent ? richContent : text;
    const { isTruncated } = truncateContent(fullContent);
    return isTruncated;
  }, [mode, text, richContent, formatting]);

  // Get the block link for "Continue reading"
  const getBlockLink = () => {
    const pathParts = pathname.split('/');
    const username = pathParts[1];
    return `/${username}/${blockId}`;
  };

  // Don't render if no content
  if (!text.trim() && !richContent?.trim()) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <>
          {mode === 'preview' && blockId ? (
            <Link href={getBlockLink()}>
              <h2 className="text-foreground cursor-pointer text-2xl font-bold transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                {title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-foreground text-2xl font-bold dark:text-white">
              {title}
            </h2>
          )}
        </>
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

      {/* Continue Reading Button for Preview Mode */}
      {mode === 'preview' && isPreviewTruncated && blockId && (
        <div className="mt-4">
          <Link
            href={getBlockLink()}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            Continue reading →
          </Link>
        </div>
      )}
    </div>
  );
}
