'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/types/user';
import type { Collection } from '@/types';

// Define local Block type to avoid boundary violation
interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  slug?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  is_published: boolean;
  is_visible?: boolean;
  display_order?: number;
  collection_id?: string;
  created_at: string;
  updated_at: string;
}

interface ManageBlocksSectionProps {
  profile: UserProfile | null;
  blocks: Block[];
  collections: Collection[];
  loading: boolean;
  onMoveToCollection: (
    blockId: string,
    collectionId: string | null
  ) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
  onPublishBlock: (blockId: string) => Promise<void>;
  onSwitchToCreate?: () => void;
}

export function ManageBlocksSection({
  profile,
  blocks,
  collections,
  loading,
  onMoveToCollection,
  onDeleteBlock,
  onPublishBlock,
  onSwitchToCreate,
}: ManageBlocksSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter blocks based on current filters
  const filteredBlocks = blocks.filter((block) => {
    // Filter by type
    if (filterType !== 'all' && block.block_type !== filterType) {
      return false;
    }

    // Filter by collection
    if (filterCollection !== 'all') {
      if (filterCollection === 'uncategorized') {
        if (block.collection_id) return false;
      } else if (block.collection_id !== filterCollection) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = block.title?.toLowerCase().includes(searchLower);
      const matchesType = block.block_type.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesType) {
        return false;
      }
    }

    return true;
  });

  // Group blocks by collection for display
  const blocksByCollection = filteredBlocks.reduce(
    (acc, block) => {
      const collectionId = block.collection_id || 'uncategorized';
      if (!acc[collectionId]) {
        acc[collectionId] = [];
      }
      acc[collectionId].push(block);
      return acc;
    },
    {} as Record<string, Block[]>
  );

  const toggleBlockSelection = (blockId: string) => {
    const newSelection = new Set(selectedBlocks);
    if (newSelection.has(blockId)) {
      newSelection.delete(blockId);
    } else {
      newSelection.add(blockId);
    }
    setSelectedBlocks(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAll = () => {
    setSelectedBlocks(new Set(filteredBlocks.map((block) => block.id)));
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedBlocks(new Set());
    setShowBulkActions(false);
  };

  const getBlockTypeIcon = (blockType: string) => {
    switch (blockType) {
      case 'bio':
        return '👤';
      case 'text':
        return '📝';
      case 'links':
        return '🔗';
      case 'content_list':
        return '📋';
      case 'media':
        return '📸';
      case 'gallery':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getCollectionName = (collectionId: string | null) => {
    if (!collectionId) return 'Uncategorized';
    const collection = collections.find((c) => c.id === collectionId);
    return collection?.name || 'Unknown Collection';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Manage Blocks</h1>
          <p className="text-foreground/60">Loading your content blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Manage Blocks</h1>
        <p className="text-foreground/60">
          Organize, edit, and manage all your content blocks
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-background border-foreground/10 rounded-lg border p-4">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-foreground/5 border-foreground/20 focus:border-primary focus:ring-primary/20 flex-1 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:min-w-64"
            />

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-foreground/5 border-foreground/20 focus:border-primary focus:ring-primary/20 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="bio">Bio</option>
              <option value="text">Text</option>
              <option value="links">Links</option>
              <option value="content_list">Content List</option>
              <option value="media">Media</option>
              <option value="gallery">Gallery</option>
            </select>

            {/* Collection Filter */}
            <select
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="bg-foreground/5 border-foreground/20 focus:border-primary focus:ring-primary/20 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="all">All Collections</option>
              <option value="uncategorized">Uncategorized</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-foreground/5 flex rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground'
                } rounded-l-md transition-colors`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground'
                } rounded-r-md transition-colors`}
              >
                🔳 Grid
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="border-foreground/20 flex items-center justify-between rounded-md border bg-blue-50 p-3 dark:bg-blue-900/20">
            <span className="text-sm font-medium">
              {selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="text-foreground/60 hover:text-foreground text-sm"
              >
                Clear
              </button>
              <button
                onClick={selectAll}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Select All
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-foreground/60 text-sm">
          Showing {filteredBlocks.length} of {blocks.length} blocks
        </div>
      </div>

      {/* Blocks Display */}
      {filteredBlocks.length === 0 ? (
        <div className="bg-foreground/5 rounded-lg p-12 text-center">
          <div className="mb-4 text-4xl">📦</div>
          <h3 className="mb-2 font-semibold">No blocks found</h3>
          <p className="text-foreground/60 mb-4 text-sm">
            {searchQuery || filterType !== 'all' || filterCollection !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first content block to get started.'}
          </p>
          {!searchQuery &&
            filterType === 'all' &&
            filterCollection === 'all' && (
              <button
                onClick={onSwitchToCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <span>✏️</span>
                Create Block
              </button>
            )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group by collection if not filtering by specific collection */}
          {filterCollection === 'all' ? (
            // Group view
            Object.entries(blocksByCollection).map(
              ([collectionId, collectionBlocks]) => (
                <div key={collectionId} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <span>🗂️</span>
                    {getCollectionName(
                      collectionId === 'uncategorized' ? null : collectionId
                    )}
                    <span className="bg-foreground/20 text-foreground/60 rounded-full px-2 py-1 text-xs">
                      {collectionBlocks.length}
                    </span>
                  </h3>

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-3'
                    }
                  >
                    {collectionBlocks.map((block) => (
                      <BlockCard
                        key={block.id}
                        block={block}
                        collections={collections}
                        isSelected={selectedBlocks.has(block.id)}
                        onToggleSelect={() => toggleBlockSelection(block.id)}
                        onMoveToCollection={onMoveToCollection}
                        onDelete={onDeleteBlock}
                        onPublish={onPublishBlock}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            // Flat view
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-3'
              }
            >
              {filteredBlocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  collections={collections}
                  isSelected={selectedBlocks.has(block.id)}
                  onToggleSelect={() => toggleBlockSelection(block.id)}
                  onMoveToCollection={onMoveToCollection}
                  onDelete={onDeleteBlock}
                  onPublish={onPublishBlock}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Block Card Component
interface BlockCardProps {
  block: Block;
  collections: Collection[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onMoveToCollection: (
    blockId: string,
    collectionId: string | null
  ) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
  onPublish: (blockId: string) => Promise<void>;
  viewMode: 'grid' | 'list';
}

function BlockCard({
  block,
  collections,
  isSelected,
  onToggleSelect,
  onMoveToCollection,
  onDelete,
  onPublish,
  viewMode,
}: BlockCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const getBlockTypeIcon = (blockType: string) => {
    switch (blockType) {
      case 'bio':
        return '👤';
      case 'text':
        return '📝';
      case 'links':
        return '🔗';
      case 'content_list':
        return '📋';
      case 'media':
        return '📸';
      case 'gallery':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const handleMoveToCollection = async (collectionId: string | null) => {
    setIsMoving(true);
    try {
      await onMoveToCollection(block.id, collectionId);
    } catch (error) {
      console.error('Failed to move block:', error);
      alert('Failed to move block. Please try again.');
    }
    setIsMoving(false);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (
      confirm(
        'Are you sure you want to delete this block? This action cannot be undone.'
      )
    ) {
      try {
        await onDelete(block.id);
      } catch (error) {
        console.error('Failed to delete block:', error);
        alert('Failed to delete block. Please try again.');
      }
    }
    setShowActions(false);
  };

  const handlePublish = async () => {
    try {
      await onPublish(block.id);
    } catch (error) {
      console.error('Failed to publish block:', error);
      alert('Failed to publish block. Please try again.');
    }
    setShowActions(false);
  };

  return (
    <div
      className={`bg-background border-foreground/10 relative rounded-lg border p-4 transition-colors ${
        isSelected ? 'ring-primary ring-opacity-50 ring-2' : ''
      } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 focus:ring-2"
        />
      </div>

      {/* Block Content */}
      <div className={`${viewMode === 'list' ? 'flex-1' : 'pt-6'}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">{getBlockTypeIcon(block.block_type)}</span>
          <span className="text-foreground/80 text-xs tracking-wide uppercase">
            {block.block_type}
          </span>
          {!block.is_published && (
            <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Draft
            </span>
          )}
          {block.is_visible === false && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
              Hidden
            </span>
          )}
        </div>

        <h4 className="mb-1 font-medium">
          {block.title ||
            `${block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1)} Block`}
        </h4>

        <p className="text-foreground/60 mb-2 text-sm">
          Created {new Date(block.created_at).toLocaleDateString()}
        </p>

        {block.slug && (
          <p className="text-foreground/50 mb-2 font-mono text-xs">
            /{block.slug}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className={`${viewMode === 'list' ? 'flex items-center gap-2' : 'mt-3 flex justify-between'}`}
      >
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/edit-block/${block.id}`}
            className="text-foreground/60 hover:text-foreground rounded p-1 transition-colors"
            title="Edit block"
          >
            ✏️
          </Link>

          <button
            onClick={() => setShowActions(!showActions)}
            className="text-foreground/60 hover:text-foreground rounded p-1 transition-colors"
            title="More actions"
          >
            ⋯
          </button>
        </div>

        {!block.is_published && (
          <button
            onClick={handlePublish}
            className="bg-primary/10 text-primary hover:bg-primary/20 rounded px-2 py-1 text-xs font-medium transition-colors"
          >
            Publish
          </button>
        )}
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="bg-background border-foreground/20 absolute top-12 right-3 z-10 rounded-md border shadow-lg">
          <div className="p-1">
            <div className="text-foreground/60 px-3 py-2 text-xs font-medium tracking-wide uppercase">
              Move to Collection
            </div>
            <button
              onClick={() => handleMoveToCollection(null)}
              disabled={isMoving}
              className="hover:bg-foreground/10 w-full rounded px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
            >
              📂 Uncategorized
            </button>
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleMoveToCollection(collection.id)}
                disabled={isMoving}
                className="hover:bg-foreground/10 w-full rounded px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
              >
                🗂️ {collection.name}
              </button>
            ))}

            <div className="border-foreground/20 my-1 border-t"></div>

            <button
              onClick={handleDelete}
              className="w-full rounded px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
