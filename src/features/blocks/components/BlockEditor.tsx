'use client';

import { useState } from 'react';
import type {
  Block,
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
  ContentListBlockContent,
} from '../types';
import { updateBlock } from '../actions';
import { BioEditor, TextEditor, LinksEditor, ContentListEditor } from './index';
import { SlugInput } from './SlugInput';

interface BlockEditorProps {
  block: Block;
  onSave: () => void;
  onCancel: () => void;
}

export function BlockEditor({ block, onSave, onCancel }: BlockEditorProps) {
  const [title, setTitle] = useState(block.title || '');
  const [slug, setSlug] = useState(block.slug || '');
  const [content, setContent] = useState(block.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBlock({
        id: block.id,
        title: title.trim() || undefined,
        slug: slug.trim() || undefined,
        content,
      });
      onSave();
    } catch (error) {
      console.error('Error updating block:', error);
      // TODO: Add user-facing error handling
    } finally {
      setIsSaving(false);
    }
  };

  const renderContentEditor = () => {
    switch (block.block_type) {
      case 'bio':
        return (
          <BioEditor
            content={content as BioBlockContent}
            onChange={setContent}
          />
        );
      case 'text':
        return (
          <TextEditor
            content={content as TextBlockContent}
            onChange={setContent}
          />
        );
      case 'links':
        return (
          <LinksEditor
            content={content as LinksBlockContent}
            onChange={setContent}
          />
        );
      case 'content_list':
        return (
          <ContentListEditor
            content={content as ContentListBlockContent}
            onChange={setContent}
          />
        );
      default:
        return (
          <div className="text-foreground/60 text-sm">
            Editor for {block.block_type} blocks coming soon...
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-balance">
          Edit {block.block_type} Block
        </h3>
      </div>

      {/* Title editor */}
      <div className="animate-slide-up">
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Block Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this block..."
          className="input-primary"
        />
      </div>

      {/* Slug editor - only for text blocks */}
      {block.block_type === 'text' && (
        <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <SlugInput
            slug={slug}
            title={title}
            onChange={setSlug}
            disabled={isSaving}
          />
        </div>
      )}

      {/* Content editor */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Content
        </label>
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          {renderContentEditor()}
        </div>
      </div>

      {/* Actions */}
      <div
        className="animate-slide-up flex gap-3 pt-4"
        style={{ animationDelay: '0.3s' }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="border-background/30 border-t-background h-4 w-4 animate-spin rounded-full border-2"></div>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
