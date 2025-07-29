'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextEditor } from '@/features/blocks/components';
import { SlugInput } from '@/features/blocks/components/SlugInput';
import { createBlockWithSlug } from '@/features/blocks/actions';
import type { TextBlockContent } from '@/features/blocks/types';

export default function CreateTextBlockPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
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
        slug: slug.trim() || undefined,
        content,
        config: {},
        is_published: publish,
        generateSlug: !slug.trim() && !!title.trim(), // Auto-generate if no manual slug but has title
      };

      await createBlockWithSlug(blockData);

      if (publish) {
        router.push('/dashboard?published=true');
      } else {
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
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-foreground/10 bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
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
      <div className="flex flex-1 flex-col px-8 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-8">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Title Input - Borderless */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your title here..."
              className="placeholder-foreground/40 text-foreground w-full border-none bg-transparent text-3xl font-bold outline-none focus:outline-none"
            />
          </div>

          {/* Slug Input */}
          <div className="border-foreground/10 border-t pt-6">
            <SlugInput
              slug={slug}
              title={title}
              onChange={setSlug}
              disabled={saving}
            />
          </div>

          {/* Text Editor - Full Screen */}
          <div className="flex-1">
            <TextEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
