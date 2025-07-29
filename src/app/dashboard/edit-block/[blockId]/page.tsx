'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BlockEditor } from '@/features/blocks/components';
import type { Block } from '@/features/blocks/types';

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
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
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

  const handleSave = () => {
    setIsEditing(false);
    // The BlockEditor handles the actual saving
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`p-6 ${focusMode ? 'mx-auto max-w-4xl' : ''}`}>
        <div className="space-y-6">
          {block && (
            <BlockEditor
              block={block}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
