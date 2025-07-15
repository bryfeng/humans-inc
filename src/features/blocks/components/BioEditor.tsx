'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadAvatar } from '../../../../lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';
import type { Block, BioBlockContent } from '../types';

interface BioEditorProps {
  content: BioBlockContent;
  onChange: (content: BioBlockContent) => void;
}

export function BioEditor({ content, onChange }: BioEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use existing uploadAvatar utility
      const publicUrl = await uploadAvatar(file, user.id);

      // Update content with new avatar URL
      onChange({
        ...content,
        avatar_url: publicUrl,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // More specific error message based on error type
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const addLink = () => {
    const links = content.links || [];
    onChange({
      ...content,
      links: [...links, { label: '', url: '' }],
    });
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const links = content.links || [];
    const updatedLinks = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    onChange({
      ...content,
      links: updatedLinks,
    });
  };

  const removeLink = (index: number) => {
    const links = content.links || [];
    onChange({
      ...content,
      links: links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="animate-slide-up">
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          {content.avatar_url && (
            <div className="animate-scale-in">
              <Image
                src={content.avatar_url}
                alt="Profile"
                width={64}
                height={64}
                className="border-foreground/20 h-16 w-16 rounded-full border-2 object-cover transition-all duration-200 hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:btn-primary text-sm file:mr-4 file:cursor-pointer file:border-0 file:text-sm file:font-medium disabled:file:opacity-50"
            />
            <p className="text-foreground/60 mt-1 text-xs">
              Upload an image (max 5MB)
            </p>
            {isUploading && (
              <div className="text-foreground/80 mt-2 flex items-center gap-2 text-xs">
                <div className="border-foreground/30 border-t-foreground h-3 w-3 animate-spin rounded-full border-2"></div>
                Uploading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Display Name
        </label>
        <input
          type="text"
          value={content.display_name || ''}
          onChange={(e) =>
            onChange({ ...content, display_name: e.target.value })
          }
          placeholder="Your name or brand"
          className="input-primary"
        />
      </div>

      {/* Tagline */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Tagline
        </label>
        <input
          type="text"
          value={content.tagline || ''}
          onChange={(e) => onChange({ ...content, tagline: e.target.value })}
          placeholder="A short description of what you do"
          className="input-primary"
        />
      </div>

      {/* Bio */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Bio
        </label>
        <textarea
          value={content.bio || ''}
          onChange={(e) => onChange({ ...content, bio: e.target.value })}
          placeholder="Tell people about yourself..."
          rows={4}
          className="input-primary resize-y"
        />
        <p className="text-foreground/60 mt-1 text-xs">
          {content.bio?.length || 0} characters
        </p>
      </div>

      {/* Links */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">Links</label>
          <button
            type="button"
            onClick={addLink}
            className="text-foreground/70 hover:text-foreground text-sm underline"
          >
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {(content.links || []).map((link, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  placeholder="Label (e.g., Twitter)"
                  className="border-foreground/20 bg-background focus:border-foreground/40 mb-2 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-foreground/50 hover:text-foreground/80 mt-1 p-1"
                title="Remove link"
              >
                ✕
              </button>
            </div>
          ))}

          {(!content.links || content.links.length === 0) && (
            <p className="text-foreground/60 border-foreground/20 rounded-md border border-dashed py-4 text-center text-sm">
              No links yet. Click "Add Link" to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
