'use client';

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

interface DraftsSectionProps {
  blocks: Block[];
}

export function DraftsSection({ blocks }: DraftsSectionProps) {
  // For now, we'll simulate drafts by filtering blocks that have no title or are recently created
  // In the future, this will use the is_published field
  const draftBlocks = blocks.filter(
    (block) =>
      !block.title ||
      new Date(block.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Within last 24 hours
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Drafts</h1>
        <p className="text-foreground/60">
          Manage your unpublished content blocks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {draftBlocks.length}
          </div>
          <div className="text-foreground/60 text-sm">Draft Blocks</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {blocks.length - draftBlocks.length}
          </div>
          <div className="text-foreground/60 text-sm">Published Blocks</div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="mb-4 text-4xl">📝</div>
        <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
          Draft System Coming Soon
        </h3>
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          We're building a powerful draft system that will let you work on
          content privately before publishing.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></div>
          <span>In Development</span>
        </div>
      </div>

      {/* Draft Blocks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Content (Preview)</h3>
          <div className="flex gap-2">
            <button
              disabled
              className="bg-foreground/5 text-foreground/40 cursor-not-allowed rounded px-3 py-1 text-xs"
            >
              Filter
            </button>
            <button
              disabled
              className="bg-foreground/5 text-foreground/40 cursor-not-allowed rounded px-3 py-1 text-xs"
            >
              Sort
            </button>
          </div>
        </div>

        {draftBlocks.length > 0 ? (
          <div className="space-y-3">
            {draftBlocks.map((block) => (
              <div
                key={block.id}
                className="bg-background border-foreground/10 rounded-lg border p-4 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {block.block_type.charAt(0).toUpperCase() +
                          block.block_type.slice(1)}
                      </span>
                      <span className="text-foreground/40 text-xs">
                        {new Date(block.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-foreground/70 mb-1 font-medium">
                      {block.title || 'Untitled Block'}
                    </h4>
                    <p className="text-foreground/50 line-clamp-2 text-sm">
                      {getBlockPreview(block)}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      disabled
                      className="bg-primary/10 text-primary/40 cursor-not-allowed rounded px-3 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      disabled
                      className="cursor-not-allowed rounded bg-green-100 px-3 py-1 text-xs text-green-600/40 dark:bg-green-900/20 dark:text-green-400/40"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-foreground/40 py-12 text-center">
            <div className="mb-4 text-4xl">📄</div>
            <h4 className="mb-2 font-medium">No Drafts Yet</h4>
            <p className="text-sm">
              Once you create content blocks, they'll appear here for
              management.
            </p>
          </div>
        )}
      </div>

      {/* Feature Preview */}
      <div className="bg-foreground/5 rounded-lg p-6">
        <h3 className="mb-4 font-semibold">Draft System Features</h3>
        <div className="space-y-3">
          <FeatureItem icon="💾" text="Auto-save drafts as you type" />
          <FeatureItem icon="👁️" text="Preview drafts before publishing" />
          <FeatureItem
            icon="📅"
            text="Schedule content for future publication"
          />
          <FeatureItem icon="📂" text="Organize drafts with tags and folders" />
          <FeatureItem icon="🔄" text="Version history and revision tracking" />
          <FeatureItem
            icon="👥"
            text="Share private draft links for feedback"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-background border-foreground/10 rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            disabled
            className="bg-foreground/5 text-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-lg p-3"
          >
            <span className="text-lg">📝</span>
            <div className="text-left">
              <div className="text-sm font-medium">New Draft</div>
              <div className="text-xs">Start a new content block</div>
            </div>
          </button>

          <button
            disabled
            className="bg-foreground/5 text-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-lg p-3"
          >
            <span className="text-lg">📋</span>
            <div className="text-left">
              <div className="text-sm font-medium">Import Draft</div>
              <div className="text-xs">From clipboard or file</div>
            </div>
          </button>

          <button
            disabled
            className="bg-foreground/5 text-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-lg p-3"
          >
            <span className="text-lg">🚀</span>
            <div className="text-left">
              <div className="text-sm font-medium">Publish All</div>
              <div className="text-xs">Make all drafts public</div>
            </div>
          </button>

          <button
            disabled
            className="bg-foreground/5 text-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-lg p-3"
          >
            <span className="text-lg">🗑️</span>
            <div className="text-left">
              <div className="text-sm font-medium">Clean Up</div>
              <div className="text-xs">Delete old drafts</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg" role="img">
        {icon}
      </span>
      <span className="text-foreground/70 text-sm">{text}</span>
    </div>
  );
}

function getBlockPreview(block: Block): string {
  const content = block.content as Record<string, unknown>;

  switch (block.block_type) {
    case 'bio':
      return (
        (content.bio as string) ||
        (content.tagline as string) ||
        'Bio content...'
      );
    case 'text':
      return (content.text as string) || 'Text content...';
    case 'links':
      return Array.isArray(content.items)
        ? `${content.items.length} links`
        : 'Links collection...';
    case 'content_list':
      return Array.isArray(content.items)
        ? `${content.items.length} curated items`
        : 'Content list...';
    default:
      return 'Content preview...';
  }
}
