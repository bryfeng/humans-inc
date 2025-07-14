'use client';

import { BioBlockView } from './BioBlockView';
import { TextBlockView } from './TextBlockView';
import { LinksBlockView } from './LinksBlockView';
import { ContentListBlockView } from './ContentListBlockView';
import type {
  Block,
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
  ContentListBlockContent,
} from '../types';

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const { block_type, title, content } = block;

  try {
    switch (block_type) {
      case 'bio':
        return (
          <BioBlockView content={content as BioBlockContent} title={title} />
        );

      case 'text':
        return (
          <TextBlockView content={content as TextBlockContent} title={title} />
        );

      case 'links':
        return (
          <LinksBlockView
            content={content as LinksBlockContent}
            title={title}
          />
        );

      case 'content_list':
        return (
          <ContentListBlockView
            content={content as ContentListBlockContent}
            title={title}
          />
        );

      // Placeholder for future block types
      case 'media':
      case 'gallery':
        return (
          <div className="border-foreground/20 bg-foreground/5 rounded-lg border p-4">
            <p className="text-foreground/60 text-center">
              {block_type} blocks are not yet supported
            </p>
          </div>
        );

      default:
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="text-center text-red-600 dark:text-red-400">
              Unknown block type: {block_type}
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering block:', error);
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
        <p className="text-center text-red-600 dark:text-red-400">
          Error rendering {block_type} block
        </p>
      </div>
    );
  }
}
