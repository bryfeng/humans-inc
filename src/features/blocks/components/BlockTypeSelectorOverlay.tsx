'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlockType } from '../types';

interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface BlockTypeSelectorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (blockType: BlockType) => void;
  recentlyUsed?: BlockType[];
  existingBlocks?: Block[];
}

const BLOCK_TYPES: Array<{
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  features: string[];
}> = [
  {
    type: 'bio',
    label: 'Bio Block',
    description: 'Introduce yourself with display name, tagline, and avatar',
    icon: '👋',
    features: ['Profile picture', 'Display name', 'Tagline', 'Social links'],
  },
  {
    type: 'text',
    label: 'Text Block',
    description: 'Share thoughts, articles, or any written content',
    icon: '📝',
    features: [
      'Rich text editing',
      'Markdown support',
      'Custom formatting',
      'Long-form content',
    ],
  },
  {
    type: 'links',
    label: 'Links Block',
    description: 'Curate a collection of important links',
    icon: '🔗',
    features: [
      'Link collection',
      'Custom descriptions',
      'Organized layout',
      'Quick sharing',
    ],
  },
  {
    type: 'content_list',
    label: 'Content List',
    description: 'Showcase curated content like books, articles, or media',
    icon: '📚',
    features: [
      'Curated items',
      'Annotations',
      'Type categorization',
      'Personal recommendations',
    ],
  },
];

export function BlockTypeSelectorOverlay({
  isOpen,
  onClose,
  onSelectType,
  recentlyUsed = [],
  existingBlocks = [],
}: BlockTypeSelectorOverlayProps) {
  const router = useRouter();

  if (!isOpen) return null;

  // Group recently used types for quick access
  const recentBlockTypes = BLOCK_TYPES.filter((blockType) =>
    recentlyUsed.includes(blockType.type)
  );
  const otherBlockTypes = BLOCK_TYPES.filter(
    (blockType) => !recentlyUsed.includes(blockType.type)
  );

  const handleSelectType = (blockType: BlockType) => {
    // Check for existing bio block and redirect to edit instead
    if (blockType === 'bio') {
      const existingBio = existingBlocks.find((b) => b.block_type === 'bio');
      if (existingBio) {
        onClose();
        router.push(`/dashboard/edit-block/${existingBio.id}?focus=true`);
        return;
      }
    }

    // Handle bio creation through callback
    onSelectType(blockType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Overlay Content */}
      <div className="bg-background border-foreground/10 relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border shadow-xl">
        {/* Header */}
        <div className="border-foreground/10 flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold">Create New Block</h2>
            <p className="text-foreground/60 text-sm">
              Choose a block type to add to your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Recently Used Section */}
        {recentBlockTypes.length > 0 && (
          <div className="border-foreground/10 border-b p-6">
            <h3 className="text-foreground/80 mb-4 text-sm font-medium">
              Recently Used
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {recentBlockTypes.map((blockType) => (
                <BlockTypeCard
                  key={`recent-${blockType.type}`}
                  blockType={blockType}
                  onSelect={() => handleSelectType(blockType.type)}
                  isRecent
                  existingBlocks={existingBlocks}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Block Types Section */}
        <div className="p-6">
          <h3 className="text-foreground/80 mb-4 text-sm font-medium">
            {recentBlockTypes.length > 0
              ? 'All Block Types'
              : 'Available Block Types'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(recentBlockTypes.length > 0 ? otherBlockTypes : BLOCK_TYPES).map(
              (blockType) => (
                <BlockTypeCard
                  key={blockType.type}
                  blockType={blockType}
                  onSelect={() => handleSelectType(blockType.type)}
                  existingBlocks={existingBlocks}
                />
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-foreground/10 border-t p-4">
          <div className="text-foreground/50 text-center text-xs">
            Press{' '}
            <kbd className="bg-foreground/10 rounded px-1.5 py-0.5 text-xs">
              Esc
            </kbd>{' '}
            to close
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockTypeCard({
  blockType,
  onSelect,
  isRecent = false,
  existingBlocks = [],
}: {
  blockType: (typeof BLOCK_TYPES)[0];
  onSelect: () => void;
  isRecent?: boolean;
  existingBlocks?: Block[];
}) {
  const hasExisting =
    blockType.type === 'bio' &&
    existingBlocks.some((b) => b.block_type === 'bio');

  const buttonText = hasExisting ? 'Edit Existing' : 'Create New';
  const description = hasExisting
    ? 'You already have a bio block. Click to edit it.'
    : blockType.description;

  return (
    <button
      onClick={onSelect}
      className={`border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 group relative rounded-lg border p-4 text-left transition-all ${
        isRecent ? 'ring-1 ring-blue-500/20' : ''
      } ${hasExisting ? 'border-amber-300/40 bg-amber-50/10' : ''}`}
    >
      {isRecent && (
        <div className="absolute -top-2 -right-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
            ★
          </span>
        </div>
      )}

      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label={blockType.label}>
          {hasExisting ? '✏️' : blockType.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{blockType.label}</h4>
            {hasExisting && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Exists
              </span>
            )}
          </div>
          <p className="text-foreground/60 text-sm">{description}</p>
          {hasExisting && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              {buttonText}
            </p>
          )}
        </div>
      </div>

      <ul className="space-y-1">
        {blockType.features.map((feature, index) => (
          <li
            key={index}
            className="text-foreground/50 flex items-center gap-2 text-xs"
          >
            <div className="bg-primary h-1 w-1 rounded-full"></div>
            {feature}
          </li>
        ))}
      </ul>

      {/* Hover indicator */}
      <div className="bg-primary/10 absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

// Floating Action Button Component
interface CreateBlockButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CreateBlockButton({
  onClick,
  disabled = false,
}: CreateBlockButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-foreground/20 disabled:text-foreground/50 flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed"
    >
      <span className="text-lg">+</span>
      Create Block
    </button>
  );
}
