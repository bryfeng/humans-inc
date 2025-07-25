'use client';

import { useState } from 'react';
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
  const displayBlocks = showDrafts
    ? [...publishedBlocks, ...draftBlocks]
    : publishedBlocks;
  const profileCompletion = calculateProfileCompletion(profile, blocks);
  const lastUpdated =
    blocks.length > 0
      ? new Date(
          Math.max(...blocks.map((b) => new Date(b.updated_at).getTime()))
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Page Preview</h1>
        <p className="text-foreground/60">
          See how your public profile looks to visitors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">{blocks.length}</div>
          <div className="text-foreground/60 text-sm">Content Blocks</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {profileCompletion}%
          </div>
          <div className="text-foreground/60 text-sm">Profile Complete</div>
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
                  {displayBlocks.slice(0, 3).map((block) => (
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
                  {displayBlocks.length > 3 && (
                    <div className="text-foreground/40 py-2 text-center text-xs">
                      +{displayBlocks.length - 3} more blocks
                    </div>
                  )}
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
              <Link
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <span>View Public Profile</span>
                <span className="text-xs">↗</span>
              </Link>

              <button
                disabled
                className="bg-foreground/5 text-foreground/40 cursor-not-allowed rounded-md px-4 py-2 text-sm font-medium"
                title="Coming soon"
              >
                Share Profile
              </button>
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

      {/* Profile Completion Checklist */}
      <div className="bg-background border-foreground/10 rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">Profile Checklist</h4>
        <div className="space-y-2">
          <ChecklistItem completed={!!profile?.username} text="Username set" />
          <ChecklistItem
            completed={!!profile?.display_name}
            text="Display name added"
          />
          <ChecklistItem
            completed={blocks.some((b) => b.block_type === 'bio')}
            text="Bio block created"
          />
          <ChecklistItem
            completed={blocks.length >= 2}
            text="Multiple content blocks"
          />
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  completed,
  text,
}: {
  completed: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full text-xs ${
          completed
            ? 'bg-green-500 text-white'
            : 'bg-foreground/10 text-foreground/40'
        }`}
      >
        {completed ? '✓' : '○'}
      </div>
      <span
        className={`text-sm ${
          completed ? 'text-foreground' : 'text-foreground/60'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function calculateProfileCompletion(
  profile: UserProfile | null,
  blocks: Block[]
): number {
  if (!profile) return 0;

  let score = 0;
  const maxScore = 5;

  if (profile.username) score += 1;
  if (profile.display_name) score += 1;
  if (blocks.some((b) => b.block_type === 'bio')) score += 1;
  if (blocks.length >= 2) score += 1;
  if (blocks.length >= 4) score += 1;

  return Math.round((score / maxScore) * 100);
}
