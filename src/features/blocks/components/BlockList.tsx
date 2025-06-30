'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import { Block } from '../types';
import { reorderBlocks } from '../actions';
import { BlockItem } from './BlockItem';
import { BlockEditor } from './BlockEditor';

interface BlockListProps {
  blocks: Block[];
}

export function BlockList({ blocks: initialBlocks }: BlockListProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isReordering, setIsReordering] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [mounted, setMounted] = useState(false);

  // All hooks must be called before any conditional logic
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // Client-only rendering guard for DnD to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4">
        {initialBlocks.map((block) => (
          <div
            key={block.id}
            className="bg-background border-foreground/10 rounded-lg border p-4 shadow-sm"
          >
            <h4 className="text-foreground font-semibold">
              {block.title || `Untitled ${block.block_type} block`}
            </h4>
          </div>
        ))}
      </div>
    );
  }

  const handleDragStart = () => {
    setIsReordering(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsReordering(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);

      try {
        const blockUpdates = newBlocks.map((block, index) => ({
          id: block.id,
          position: index,
        }));
        await reorderBlocks(blocks[0]?.user_id || '', blockUpdates);
      } catch (error) {
        console.error('Error reordering blocks:', error);
        setBlocks(initialBlocks);
      }
    }
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
  };

  const handleSave = () => {
    setEditingBlock(null);
    // Parent component will handle refresh if needed
  };

  const handleCancel = () => {
    setEditingBlock(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="text-foreground/60 py-8 text-center">
        No blocks yet. Create your first block to get started!
      </div>
    );
  }

  // If editing a block, show the editor
  if (editingBlock) {
    return (
      <div className="border-foreground/20 bg-background rounded-lg border p-4">
        <BlockEditor
          block={editingBlock}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-foreground/60 text-sm">
        Drag and drop to reorder your blocks. Changes are saved automatically.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                isReordering={isReordering}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isReordering && (
        <div className="text-foreground/60 text-center text-xs">
          Saving new order...
        </div>
      )}
    </div>
  );
}
