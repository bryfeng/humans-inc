'use client';

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
  created_at: string;
  updated_at: string;
}

interface PagePreviewSectionProps {
  profile: UserProfile | null;
  blocks: Block[];
}

export function PagePreviewSection({
  profile,
  blocks,
}: PagePreviewSectionProps) {
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
        <h3 className="mb-4 text-lg font-semibold">Profile Preview</h3>

        {profile?.username ? (
          <div className="space-y-4">
            {/* Miniature Page Preview */}
            <div className="bg-background border-foreground/10 max-h-64 overflow-hidden rounded-lg border p-4">
              <div className="text-foreground/50 mb-2 text-xs">
                humans.inc/{profile.username}
              </div>

              {blocks.length > 0 ? (
                <div className="space-y-2">
                  {blocks.slice(0, 3).map((block) => (
                    <div key={block.id} className="bg-foreground/5 rounded p-2">
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
                  {blocks.length > 3 && (
                    <div className="text-foreground/40 py-2 text-center text-xs">
                      +{blocks.length - 3} more blocks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-foreground/40 py-8 text-center">
                  <div className="mb-2 text-2xl">📝</div>
                  <div className="text-sm">No content blocks yet</div>
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
