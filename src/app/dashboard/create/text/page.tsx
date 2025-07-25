'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextEditor } from '@/features/blocks/components';
import {
  createAndSaveBlock,
  createAndPublishBlock,
} from '@/features/blocks/actions';
import type { TextBlockContent } from '@/features/blocks/types';

export default function CreateTextBlockPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<TextBlockContent>({
    text: '',
    formatting: 'rich',
    richContent: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (publish: boolean = false) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    if (!content.text?.trim()) {
      setError('Please add some content before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const blockData = {
        user_id: user.id,
        position: 0,
        block_type: 'text' as const,
        title: title || 'Untitled Text Block',
        content,
        config: {},
      };

      if (publish) {
        await createAndPublishBlock(blockData);
        router.push('/dashboard?published=true');
      } else {
        await createAndSaveBlock(blockData);
        router.push('/dashboard?saved=true');
      }
    } catch (error) {
      console.error('Failed to save block:', error);
      setError('Failed to save block. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-foreground/10 bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-foreground/60 hover:text-foreground transition-colors"
                title="Back to Dashboard"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-semibold">Create Text Block</h1>
                <p className="text-foreground/60 text-sm">
                  Share your thoughts and ideas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="text-foreground/80 mb-2 block text-sm font-medium">
              Block Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your text block a title..."
              className="border-foreground/20 bg-background focus:border-foreground/40 focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-base focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Text Editor */}
          <div>
            <TextEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
