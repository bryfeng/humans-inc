'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BioEditor,
  TextEditor,
  LinksEditor,
  ContentListEditor,
} from '@/features/blocks/components';
import { updateBlock } from '@/features/blocks/actions';
import type {
  BlockType,
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
  ContentListBlockContent,
} from '@/features/blocks/types';

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

export default function EditBlockPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusMode = searchParams.get('focus') === 'true';

  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [blockId, setBlockId] = useState<string | null>(null);

  // Resolve the async params
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setBlockId(resolvedParams.blockId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!blockId) return;

    async function loadBlock() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: blockData, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('id', blockId)
        .eq('user_id', user.id)
        .single();

      if (error || !blockData) {
        setError('Block not found or you do not have permission to edit it.');
        setLoading(false);
        return;
      }

      setBlock(blockData);
      setLoading(false);
    }

    loadBlock();
  }, [blockId, router]);

  const handleContentChange = (newContent: Record<string, unknown>) => {
    if (!block) return;

    setBlock({
      ...block,
      content: newContent,
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!block) return;

    setSaving(true);
    try {
      await updateBlock({
        id: block.id,
        content: block.content,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save block:', error);
      setError('Failed to save block. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!block) return;

    setSaving(true);
    try {
      await updateBlock({
        id: block.id,
        content: block.content,
        is_published: true,
      });
      setHasUnsavedChanges(false);
      router.push('/dashboard?published=true');
    } catch (error) {
      console.error('Failed to publish block:', error);
      setError('Failed to publish block. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    if (!block) return null;

    const blockType = block.block_type as BlockType;

    switch (blockType) {
      case 'bio':
        return (
          <BioEditor
            content={block.content as BioBlockContent}
            onChange={handleContentChange}
          />
        );
      case 'text':
        return (
          <TextEditor
            content={block.content as TextBlockContent}
            onChange={handleContentChange}
          />
        );
      case 'links':
        return (
          <LinksEditor
            content={block.content as LinksBlockContent}
            onChange={handleContentChange}
          />
        );
      case 'content_list':
        return (
          <ContentListEditor
            content={block.content as ContentListBlockContent}
            onChange={handleContentChange}
          />
        );
      default:
        return <div>Unsupported block type: {blockType}</div>;
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-foreground/60">Loading block...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-500">⚠️</div>
          <h1 className="mb-2 text-xl font-semibold">Error</h1>
          <p className="text-foreground/60 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-background min-h-screen ${focusMode ? '' : 'mx-auto max-w-4xl'}`}
    >
      {/* Header */}
      <div className="border-foreground/10 bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="Back to Dashboard"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-semibold">
                  Edit{' '}
                  {block?.block_type
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}{' '}
                  Block
                </h1>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600">
                    You have unsaved changes
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {focusMode && blockId && (
                <button
                  onClick={() =>
                    router.replace(`/dashboard/edit-block/${blockId}`)
                  }
                  className="text-foreground/60 hover:text-foreground text-sm transition-colors"
                >
                  Exit Focus Mode
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={handlePublish}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`p-6 ${focusMode ? 'mx-auto max-w-4xl' : ''}`}>
        <div className="space-y-6">{renderEditor()}</div>
      </div>
    </div>
  );
}
