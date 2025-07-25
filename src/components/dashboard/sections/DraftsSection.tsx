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
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface DraftsSectionProps {
  blocks: Block[];
  draftBlocks: Block[];
  publishedCount: number;
  loading: boolean;
  onPublish: (blockId: string) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
}

export function DraftsSection({
  blocks,
  draftBlocks,
  publishedCount,
  loading,
  onPublish,
  onDelete,
}: DraftsSectionProps) {
  const handlePublish = async (blockId: string) => {
    try {
      await onPublish(blockId);
    } catch (error) {
      console.error('Error publishing block:', error);
      alert('Failed to publish block. Please try again.');
    }
  };

  const handleDelete = async (blockId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this draft? This action cannot be undone.'
      )
    ) {
      try {
        await onDelete(blockId);
      } catch (error) {
        console.error('Error deleting block:', error);
        alert('Failed to delete block. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Drafts</h1>
          <p className="text-foreground/60">Loading draft content...</p>
        </div>
        <div className="py-12 text-center">
          <div className="bg-primary mx-auto mb-4 h-8 w-8 animate-pulse rounded-full"></div>
          <p className="text-foreground/60">Loading drafts...</p>
        </div>
      </div>
    );
  }

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
            {publishedCount}
          </div>
          <div className="text-foreground/60 text-sm">Published Blocks</div>
        </div>
      </div>

      {/* Draft Blocks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Draft Content</h3>
          <div className="flex gap-2">
            <span className="text-foreground/60 text-sm">
              {draftBlocks.length} drafts
            </span>
          </div>
        </div>

        {draftBlocks.length > 0 ? (
          <div className="space-y-3">
            {draftBlocks.map((block) => (
              <div
                key={block.id}
                className="bg-background border-foreground/10 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {block.block_type.charAt(0).toUpperCase() +
                          block.block_type.slice(1)}
                      </span>
                      <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Draft
                      </span>
                      <span className="text-foreground/40 text-xs">
                        {new Date(block.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-foreground mb-1 font-medium">
                      {block.title || 'Untitled Block'}
                    </h4>
                    <p className="text-foreground/60 line-clamp-2 text-sm">
                      {getBlockPreview(block)}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handlePublish(block.id)}
                      className="rounded bg-green-100 px-3 py-1 text-xs text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleDelete(block.id)}
                      className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      Delete
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
              Create new content blocks to see drafts here. New blocks are saved
              as drafts by default.
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-foreground/5 rounded-lg p-6">
        <h3 className="mb-4 font-semibold">About Drafts</h3>
        <div className="text-foreground/70 space-y-3 text-sm">
          <p>• New content blocks are automatically saved as drafts</p>
          <p>• Draft blocks are not visible on your public profile</p>
          <p>• You can publish drafts individually when ready</p>
          <p>
            • Published blocks can be unpublished to convert them back to drafts
          </p>
        </div>
      </div>
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
