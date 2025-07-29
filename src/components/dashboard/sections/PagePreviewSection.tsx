'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/types/user';

// Define local Block type to avoid boundary violation
interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  is_published: boolean;
  is_visible?: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

// Layout update interface
interface BlockLayoutUpdate {
  id: string;
  is_visible: boolean;
  display_order: number;
}

interface PagePreviewSectionProps {
  profile: UserProfile | null;
  blocks: Block[];
  publishedBlocks: Block[];
  draftBlocks: Block[];
  loading: boolean;
  onSaveLayout?: (
    userId: string,
    layoutUpdates: BlockLayoutUpdate[]
  ) => Promise<void>;
}

export function PagePreviewSection({
  profile,
  blocks,
  publishedBlocks,
  draftBlocks,
  loading,
  onSaveLayout,
}: PagePreviewSectionProps) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [hiddenBlocks, setHiddenBlocks] = useState<Set<string>>(new Set());
  const [blockOrder, setBlockOrder] = useState<string[]>(() =>
    [...publishedBlocks]
      .sort((a, b) => a.position - b.position)
      .map((block) => block.id)
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  // Track original state to detect changes - initialize empty, will be set from database
  const [originalHiddenBlocks, setOriginalHiddenBlocks] = useState<Set<string>>(
    new Set()
  );
  const [originalBlockOrder, setOriginalBlockOrder] = useState<string[]>([]);

  const displayBlocks = showDrafts
    ? [...publishedBlocks, ...draftBlocks]
    : publishedBlocks;
  const lastUpdated =
    blocks.length > 0
      ? new Date(
          Math.max(...blocks.map((b) => new Date(b.updated_at).getTime()))
        )
      : null;

  // Initialize state from database when publishedBlocks change
  React.useEffect(() => {
    if (publishedBlocks.length === 0) return;

    // Initialize hidden blocks from is_visible field
    const hiddenFromDb = new Set<string>();
    publishedBlocks.forEach((block) => {
      if (block.is_visible === false) {
        hiddenFromDb.add(block.id);
      }
    });
    setHiddenBlocks(hiddenFromDb);
    setOriginalHiddenBlocks(new Set(hiddenFromDb)); // Update original state too

    // Initialize block order from display_order or position
    const orderFromDb = [...publishedBlocks]
      .sort((a, b) => {
        const orderA = a.display_order ?? a.position;
        const orderB = b.display_order ?? b.position;
        return orderA - orderB;
      })
      .map((block) => block.id);

    setBlockOrder(orderFromDb);
    setOriginalBlockOrder([...orderFromDb]); // Update original state too

    // Reset pending changes since we just loaded from database
    setHasPendingChanges(false);
  }, [publishedBlocks]);

  // Detect pending changes
  React.useEffect(() => {
    const hasOrderChanged =
      JSON.stringify(blockOrder) !== JSON.stringify(originalBlockOrder);
    const hasVisibilityChanged =
      hiddenBlocks.size !== originalHiddenBlocks.size ||
      [...hiddenBlocks].some((id) => !originalHiddenBlocks.has(id)) ||
      [...originalHiddenBlocks].some((id) => !hiddenBlocks.has(id));

    setHasPendingChanges(hasOrderChanged || hasVisibilityChanged);
  }, [blockOrder, hiddenBlocks, originalBlockOrder, originalHiddenBlocks]);

  const toggleBlockVisibility = (blockId: string) => {
    setHiddenBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blockOrder.indexOf(blockId);
    if (currentIndex === -1) return;

    const newOrder = [...blockOrder];
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [
        newOrder[targetIndex],
        newOrder[currentIndex],
      ];
      setBlockOrder(newOrder);
    }
  };

  const saveLayout = async () => {
    if (!profile?.id || !hasPendingChanges || !onSaveLayout) return;

    setIsSavingLayout(true);
    try {
      // Prepare layout updates
      const layoutUpdates: BlockLayoutUpdate[] = blockOrder.map(
        (blockId, index) => ({
          id: blockId,
          is_visible: !hiddenBlocks.has(blockId),
          display_order: index,
        })
      );

      await onSaveLayout(profile.id, layoutUpdates);

      // Reset pending changes state
      setHasPendingChanges(false);
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Failed to save layout. Please try again.');
    } finally {
      setIsSavingLayout(false);
    }
  };

  const shareProfile = async () => {
    if (!profile?.username) return;

    const profileUrl = `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this link:', profileUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Page Preview</h1>
        <p className="text-foreground/60">
          See how your public profile looks to visitors
        </p>
      </div>

      {/* Block Management */}
      {publishedBlocks.length > 0 && (
        <div className="bg-background border-foreground/10 rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Block Management</h3>
              <p className="text-foreground/60 text-sm">
                Reorder and control visibility of your published blocks
              </p>
            </div>
            {hasPendingChanges && (
              <button
                onClick={saveLayout}
                disabled={isSavingLayout}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSavingLayout ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Layout
                  </>
                )}
              </button>
            )}
          </div>
          {hasPendingChanges && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-2 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              You have unsaved layout changes. Click "Save Layout" to make them
              live on your public profile.
            </div>
          )}
          <div className="space-y-3">
            {blockOrder.map((blockId, index) => {
              const block = publishedBlocks.find((b) => b.id === blockId);
              if (!block) return null;

              const isHidden = hiddenBlocks.has(blockId);

              return (
                <div
                  key={blockId}
                  className="bg-foreground/5 flex items-center gap-3 rounded-lg p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isHidden
                          ? 'text-foreground/40 line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {block.title || `${block.block_type} block`}
                    </p>
                    <p className="text-foreground/60 text-xs capitalize">
                      {block.block_type}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/edit-block/${blockId}`}
                      className="text-foreground/60 hover:text-foreground p-1"
                      title="Edit block"
                    >
                      ✏️
                    </Link>

                    <button
                      onClick={() => moveBlock(blockId, 'up')}
                      disabled={index === 0}
                      className="text-foreground/60 hover:text-foreground p-1 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => moveBlock(blockId, 'down')}
                      disabled={index === blockOrder.length - 1}
                      className="text-foreground/60 hover:text-foreground p-1 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => toggleBlockVisibility(blockId)}
                      className="text-foreground/60 hover:text-foreground p-1"
                      title={isHidden ? 'Show block' : 'Hide block'}
                    >
                      {isHidden ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">{blocks.length}</div>
          <div className="text-foreground/60 text-sm">Content Blocks</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-foreground/40 text-2xl font-bold">—</div>
          <div className="text-foreground/60 text-sm">Views (Coming Soon)</div>
        </div>
      </div>

      {/* Profile Preview */}
      <div className="bg-foreground/5 rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile Preview</h3>

          {!loading && (
            <div className="flex items-center gap-3">
              <span className="text-foreground/60 text-sm">
                {publishedBlocks.length} published, {draftBlocks.length} drafts
              </span>
              <button
                onClick={() => setShowDrafts(!showDrafts)}
                className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  showDrafts
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <span>{showDrafts ? '👁️' : '👁️‍🗨️'}</span>
                {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
              </button>
            </div>
          )}
        </div>

        {profile?.username ? (
          <div className="space-y-4">
            {/* Miniature Page Preview */}
            <div className="bg-background border-foreground/10 max-h-64 overflow-hidden rounded-lg border p-4">
              <div className="text-foreground/50 mb-2 text-xs">
                humans.inc/{profile.username} {showDrafts && '(with drafts)'}
              </div>

              {loading ? (
                <div className="py-8 text-center">
                  <div className="bg-primary mx-auto mb-2 h-4 w-4 animate-pulse rounded-full"></div>
                  <div className="text-foreground/60 text-xs">
                    Loading blocks...
                  </div>
                </div>
              ) : displayBlocks.length > 0 ? (
                <div className="space-y-2">
                  {(() => {
                    // Get the blocks to display based on draft mode
                    const blocksToShow = showDrafts
                      ? displayBlocks
                      : publishedBlocks;

                    // Apply hidden blocks filter to all blocks
                    const visibleBlocks = blocksToShow.filter(
                      (block) => !hiddenBlocks.has(block.id)
                    );

                    // Sort by block order if not in draft mode
                    const orderedBlocks = showDrafts
                      ? visibleBlocks
                      : blockOrder
                          .map((id) =>
                            visibleBlocks.find((block) => block.id === id)
                          )
                          .filter(
                            (block): block is Block => block !== undefined
                          );

                    return orderedBlocks.slice(0, 3).map((block) => (
                      <div
                        key={block.id}
                        className="bg-foreground/5 relative rounded p-2"
                      >
                        {!block.is_published && (
                          <div className="absolute top-1 right-1">
                            <span className="rounded bg-orange-100 px-1 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Draft
                            </span>
                          </div>
                        )}
                        <div className="text-foreground/70 mb-1 text-xs font-medium">
                          {block.block_type.charAt(0).toUpperCase() +
                            block.block_type.slice(1)}{' '}
                          Block
                        </div>
                        <div className="text-foreground/50 line-clamp-2 text-xs">
                          {block.title || 'Content preview...'}
                        </div>
                      </div>
                    ));
                  })()}
                  {(() => {
                    // Calculate visible blocks count consistently with the display logic above
                    const blocksToShow = showDrafts
                      ? displayBlocks
                      : publishedBlocks;
                    const visibleBlocks = blocksToShow.filter(
                      (block) => !hiddenBlocks.has(block.id)
                    );
                    const visibleCount = visibleBlocks.length;

                    return (
                      visibleCount > 3 && (
                        <div className="text-foreground/40 py-2 text-center text-xs">
                          +{visibleCount - 3} more blocks
                          {hiddenBlocks.size > 0 && (
                            <span className="text-foreground/30 ml-1">
                              ({hiddenBlocks.size} hidden)
                            </span>
                          )}
                        </div>
                      )
                    );
                  })()}
                </div>
              ) : (
                <div className="text-foreground/40 py-8 text-center">
                  <div className="mb-2 text-2xl">📝</div>
                  <div className="text-sm">
                    {showDrafts
                      ? 'No content blocks yet'
                      : 'No published blocks yet'}
                  </div>
                  {!showDrafts && draftBlocks.length > 0 && (
                    <div className="text-foreground/50 mt-1 text-xs">
                      {draftBlocks.length} draft
                      {draftBlocks.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={shareProfile}
                className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <span>📤</span>
                <span>Share</span>
              </button>

              <Link
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <span>🔗</span>
                <span>View Live</span>
              </Link>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-foreground/50 text-xs">
                Last updated: {lastUpdated.toLocaleDateString()} at{' '}
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-4 text-2xl">🚀</div>
            <h4 className="mb-2 font-semibold">Complete Your Profile</h4>
            <p className="text-foreground/60 mb-4 text-sm">
              Set up your username and profile information to see your page
              preview.
            </p>
            <div className="bg-foreground/10 text-foreground/40 rounded-md p-3 font-mono text-sm">
              humans.inc/your-username
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
