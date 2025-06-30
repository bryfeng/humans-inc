'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Block,
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
  ContentListBlockContent,
} from '../types';
import { deleteBlock } from '../actions';

interface BlockItemProps {
  block: Block;
  isReordering: boolean;
  onEdit: (block: Block) => void;
}

export function BlockItem({ block, isReordering, onEdit }: BlockItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this block? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBlock(block.id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting block:', error);
      // TODO: Add user-facing error handling
    } finally {
      setIsDeleting(false);
    }
  };

  const getBlockTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bio: 'Bio',
      text: 'Text',
      links: 'Links',
      content_list: 'Content List',
      media: 'Media',
      gallery: 'Gallery',
    };
    return labels[type] || type;
  };

  const getBlockPreview = (block: Block) => {
    switch (block.block_type) {
      case 'bio':
        const bioContent = block.content as BioBlockContent;
        return bioContent.display_name || bioContent.tagline || 'Bio block';
      case 'text':
        const textContent = block.content as TextBlockContent;
        return (
          textContent.text?.substring(0, 100) +
            (textContent.text?.length > 100 ? '...' : '') || 'Text block'
        );
      case 'links':
        const linksContent = block.content as LinksBlockContent;
        return `${linksContent.items?.length || 0} links`;
      case 'content_list':
        const listContent = block.content as ContentListBlockContent;
        return `${listContent.items?.length || 0} items`;
      default:
        return 'Content block';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-foreground/20 bg-background group rounded-lg border p-4 transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${isReordering ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs font-medium">
              {getBlockTypeLabel(block.block_type)}
            </span>
            {block.title && (
              <h3 className="truncate text-sm font-medium">{block.title}</h3>
            )}
          </div>
          <p className="text-foreground/60 text-sm">{getBlockPreview(block)}</p>
        </div>

        <div className="ml-4 flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-foreground/40 hover:text-foreground/60 cursor-grab p-1 active:cursor-grabbing"
            disabled={isDeleting}
            title="Drag to reorder"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            </svg>
          </button>

          {/* Edit button */}
          <button
            onClick={() => onEdit(block)}
            className="text-foreground/60 hover:text-foreground p-1"
            disabled={isDeleting}
            title="Edit block"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="text-foreground/40 p-1 hover:text-red-500"
            disabled={isDeleting}
            title="Delete block"
          >
            {isDeleting ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
