'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BioEditor } from './BioEditor';
import { createBlockWithSlug } from '../actions';
import type { BioBlockContent } from '../types';

interface BioBlockCreationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BioBlockCreationOverlay({
  isOpen,
  onClose,
  onSuccess,
}: BioBlockCreationOverlayProps) {
  const [title, setTitle] = useState('About Me');
  const [content, setContent] = useState<BioBlockContent>({
    display_name: '',
    tagline: '',
    bio: '',
    avatar_url: '',
    links: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (publish: boolean = false) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    if (!content.display_name?.trim() && !content.bio?.trim()) {
      setError('Please add a display name or bio before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const blockData = {
        user_id: user.id,
        position: 0,
        block_type: 'bio' as const,
        title: title || content.display_name || 'Bio Block',
        slug: undefined, // Bio blocks should never have slugs
        content,
        config: {},
        is_published: publish,
        generateSlug: false, // Never auto-generate slugs for bio blocks
      };

      await createBlockWithSlug(blockData);

      // Reset form
      setTitle('About Me');
      setContent({
        display_name: '',
        tagline: '',
        bio: '',
        avatar_url: '',
        links: [],
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save block:', error);
      setError('Failed to save block. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Overlay Content */}
      <div className="bg-background border-foreground/10 relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border shadow-xl">
        {/* Header */}
        <div className="border-foreground/10 flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold">Create Bio Block</h2>
            <p className="text-foreground/60 text-sm">
              Share your profile and personal information
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div className="mb-6">
            <label className="text-foreground/80 mb-2 block text-sm font-medium">
              Block Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About Me"
              className="input-primary"
            />
          </div>

          {/* Bio Editor */}
          <BioEditor content={content} onChange={setContent} />
        </div>

        {/* Footer with Actions */}
        <div className="border-foreground/10 border-t p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </button>

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
  );
}
