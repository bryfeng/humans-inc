'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlock } from '../actions';
import type { BlockType } from '../types';

interface BlockCreatorProps {
  userId: string;
  currentBlockCount: number;
}

const BLOCK_TYPES: Array<{
  type: BlockType;
  label: string;
  description: string;
}> = [
  {
    type: 'bio',
    label: 'Bio Block',
    description: 'Personal info, photo, and social links',
  },
  {
    type: 'text',
    label: 'Text Block',
    description: 'Simple text content or markdown',
  },
  {
    type: 'links',
    label: 'Links Block',
    description: 'Collection of useful links',
  },
  {
    type: 'content_list',
    label: 'Content List',
    description: 'Curated recommendations and annotations',
  },
];

export function BlockCreator({ userId, currentBlockCount }: BlockCreatorProps) {
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateBlock = async (blockType: BlockType) => {
    setIsCreating(true);

    try {
      // Create a new block with default content based on type
      let defaultContent = {};
      let defaultTitle = '';

      switch (blockType) {
        case 'bio':
          defaultContent = {
            display_name: '',
            tagline: '',
            bio: '',
            avatar_url: '',
            links: [],
          };
          defaultTitle = 'About Me';
          break;
        case 'text':
          defaultContent = {
            text: 'Your text content here...',
            formatting: 'plain',
          };
          defaultTitle = 'Text Block';
          break;
        case 'links':
          defaultContent = {
            items: [],
          };
          defaultTitle = 'Useful Links';
          break;
        case 'content_list':
          defaultContent = {
            items: [],
          };
          defaultTitle = 'My Recommendations';
          break;
        default:
          defaultContent = {};
      }

      await createBlock({
        user_id: userId,
        position: currentBlockCount, // Add to end
        block_type: blockType,
        title: defaultTitle,
        content: defaultContent,
        config: {
          size: 'medium',
          layout: 'default',
        },
      });

      setSelectedType(null);
      // Force refresh to show the new block immediately
      router.refresh();
    } catch (error) {
      console.error('Error creating block:', error);
      // TODO: Add user-facing error handling
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedType ? (
        <>
          <p className="text-foreground/70 mb-4 text-sm">
            Choose a block type to add to your profile:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => setSelectedType(blockType.type)}
                className="border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 rounded-lg border p-4 text-left transition-colors"
                disabled={isCreating}
              >
                <h4 className="font-medium">{blockType.label}</h4>
                <p className="text-foreground/60 mt-1 text-sm">
                  {blockType.description}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="border-foreground/20 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium">
              Create {BLOCK_TYPES.find((bt) => bt.type === selectedType)?.label}
            </h4>
            <button
              onClick={() => setSelectedType(null)}
              className="text-foreground/60 hover:text-foreground text-sm"
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>

          <p className="text-foreground/70 mb-4 text-sm">
            {BLOCK_TYPES.find((bt) => bt.type === selectedType)?.description}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handleCreateBlock(selectedType)}
              disabled={isCreating}
              className="bg-foreground text-background rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Block'}
            </button>
            <button
              onClick={() => setSelectedType(null)}
              disabled={isCreating}
              className="bg-foreground/10 text-foreground/80 rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
