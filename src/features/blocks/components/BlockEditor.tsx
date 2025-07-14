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
import { BioEditor } from './BioEditor';

interface BlockEditorProps {
  block: Block;
  onSave: () => void;
  onCancel: () => void;
}

export function BlockEditor({ block, onSave, onCancel }: BlockEditorProps) {
  const [title, setTitle] = useState(block.title || '');
  const [content, setContent] = useState(block.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBlock({
        id: block.id,
        title: title.trim() || undefined,
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
        return <BioEditor content={content as BioBlockContent} onChange={setContent} />;
      case 'text':
        return <TextEditor content={content as TextBlockContent} onChange={setContent} />;
      case 'links':
        return <LinksEditor content={content as LinksBlockContent} onChange={setContent} />;
      case 'content_list':
        return <ContentListEditor content={content as ContentListBlockContent} onChange={setContent} />;
      default:
        return (
          <div className="text-foreground/60 text-sm">
            Editor for {block.block_type} blocks coming soon...
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit {block.block_type} Block</h3>
      </div>

      {/* Title editor */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Block Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this block..."
          className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Content editor */}
      <div>
        <label className="mb-2 block text-sm font-medium">Content</label>
        {renderContentEditor()}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-foreground text-background rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="bg-foreground/10 text-foreground/80 rounded-md px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Text block editor
function TextEditor({
  content,
  onChange,
}: {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}) {
  const textContent = content;

  return (
    <div className="space-y-4">
      <textarea
        value={textContent.text || ''}
        onChange={(e) => onChange({ ...textContent, text: e.target.value })}
        placeholder="Enter your text content..."
        rows={6}
        className="border-foreground/20 bg-background focus:border-foreground/40 resize-vertical w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
      />
      <div>
        <label className="mb-1 block text-sm font-medium">Formatting</label>
        <select
          value={textContent.formatting || 'plain'}
          onChange={(e) =>
            onChange({ ...textContent, formatting: e.target.value as 'plain' | 'markdown' })
          }
          className="border-foreground/20 bg-background focus:border-foreground/40 rounded-md border px-3 py-2 text-sm focus:outline-none"
        >
          <option value="plain">Plain Text</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>
    </div>
  );
}

// Links block editor
function LinksEditor({
  content,
  onChange,
}: {
  content: LinksBlockContent;
  onChange: (content: LinksBlockContent) => void;
}) {
  const linksContent = content;

  const updateItem = (
    index: number,
    updates: Partial<{ title: string; url: string; description: string }>
  ) => {
    const newItems = [...linksContent.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...linksContent, items: newItems });
  };

  const addItem = () => {
    const newItems = [
      ...linksContent.items,
      { title: '', url: '', description: '' },
    ];
    onChange({ ...linksContent, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = linksContent.items.filter((_, i) => i !== index);
    onChange({ ...linksContent, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Links</span>
        <button
          onClick={addItem}
          className="text-foreground/60 hover:text-foreground text-sm"
        >
          + Add Link
        </button>
      </div>
      <div className="space-y-3">
        {linksContent.items.map((item, index) => (
          <div
            key={index}
            className="border-foreground/10 space-y-2 rounded-md border p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Link title"
                className="border-foreground/20 bg-background focus:border-foreground/40 flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={() => removeItem(index)}
                className="text-foreground/40 p-2 hover:text-red-500"
                title="Remove link"
              >
                ×
              </button>
            </div>
            <input
              type="url"
              value={item.url}
              onChange={(e) => updateItem(index, { url: e.target.value })}
              placeholder="URL"
              className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
            <input
              type="text"
              value={item.description || ''}
              onChange={(e) =>
                updateItem(index, { description: e.target.value })
              }
              placeholder="Description (optional)"
              className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Content list block editor
function ContentListEditor({
  content,
  onChange,
}: {
  content: ContentListBlockContent;
  onChange: (content: ContentListBlockContent) => void;
}) {
  const listContent = content;

  const updateItem = (
    index: number,
    updates: Partial<{
      title: string;
      url: string;
      annotation: string;
      type: 'article' | 'book' | 'video' | 'podcast' | 'other';
    }>
  ) => {
    const newItems = [...listContent.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...listContent, items: newItems });
  };

  const addItem = () => {
    const newItems = [
      ...listContent.items,
      { title: '', url: '', annotation: '', type: 'other' as const },
    ];
    onChange({ ...listContent, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = listContent.items.filter((_, i) => i !== index);
    onChange({ ...listContent, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Content Items</span>
        <button
          onClick={addItem}
          className="text-foreground/60 hover:text-foreground text-sm"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-3">
        {listContent.items.map((item, index) => (
          <div
            key={index}
            className="border-foreground/10 space-y-2 rounded-md border p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Item title"
                className="border-foreground/20 bg-background focus:border-foreground/40 flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
              <select
                value={item.type || 'other'}
                onChange={(e) =>
                  updateItem(index, {
                    type: e.target.value as
                      | 'article'
                      | 'book'
                      | 'video'
                      | 'podcast'
                      | 'other',
                  })
                }
                className="border-foreground/20 bg-background focus:border-foreground/40 rounded-md border px-3 py-2 text-sm focus:outline-none"
              >
                <option value="article">Article</option>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={() => removeItem(index)}
                className="text-foreground/40 p-2 hover:text-red-500"
                title="Remove item"
              >
                ×
              </button>
            </div>
            <input
              type="url"
              value={item.url || ''}
              onChange={(e) => updateItem(index, { url: e.target.value })}
              placeholder="URL (optional)"
              className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
            <textarea
              value={item.annotation || ''}
              onChange={(e) =>
                updateItem(index, { annotation: e.target.value })
              }
              placeholder="Your thoughts or annotation..."
              rows={2}
              className="border-foreground/20 bg-background focus:border-foreground/40 resize-vertical w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
