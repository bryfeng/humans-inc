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
  created_at: string;
  updated_at: string;
}

interface PagePreviewSectionProps {
  profile: UserProfile | null;
  blocks: Block[];
  publishedBlocks: Block[];
  draftBlocks: Block[];
  loading: boolean;
}

export function PagePreviewSection({
  profile,
  blocks,
  publishedBlocks,
  draftBlocks,
  loading,
}: PagePreviewSectionProps) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [hiddenBlocks, setHiddenBlocks] = useState<Set<string>>(new Set());
  const [blockOrder, setBlockOrder] = useState<string[]>(() =>
    [...publishedBlocks]
      .sort((a, b) => a.position - b.position)
      .map((block) => block.id)
  );

  const displayBlocks = showDrafts
    ? [...publishedBlocks, ...draftBlocks]
    : publishedBlocks;
  const lastUpdated =
    blocks.length > 0
      ? new Date(
          Math.max(...blocks.map((b) => new Date(b.updated_at).getTime()))
        )
      : null;

  // Update block order when publishedBlocks change
  React.useEffect(() => {
    const newOrder = [...publishedBlocks]
      .sort((a, b) => a.position - b.position)
      .map((block) => block.id);
    setBlockOrder(newOrder);
  }, [publishedBlocks]);

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
          <h3 className="mb-4 text-lg font-semibold">Block Management</h3>
          <p className="text-foreground/60 mb-4 text-sm">
            Reorder and control visibility of your published blocks
          </p>
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
                  {(showDrafts
                    ? displayBlocks
                    : blockOrder
                        .map((id) =>
                          publishedBlocks.find((block) => block.id === id)
                        )
                        .filter(
                          (block): block is Block =>
                            block !== undefined && !hiddenBlocks.has(block.id)
                        )
                  )
                    .slice(0, 3)
                    .map((block) => (
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
                    ))}
                  {(() => {
                    const visibleCount = showDrafts
                      ? displayBlocks.length
                      : blockOrder.filter((id) => !hiddenBlocks.has(id)).length;
                    return (
                      visibleCount > 3 && (
                        <div className="text-foreground/40 py-2 text-center text-xs">
                          +{visibleCount - 3} more blocks
                          {!showDrafts && hiddenBlocks.size > 0 && (
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
