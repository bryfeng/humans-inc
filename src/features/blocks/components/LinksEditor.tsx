'use client';

import type { LinksBlockContent } from '../types';

interface LinksEditorProps {
  content: LinksBlockContent;
  onChange: (content: LinksBlockContent) => void;
}

export function LinksEditor({ content, onChange }: LinksEditorProps) {
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
                className="border-foreground/20 bg-background focus:border-foreground/40 flex-1 rounded-md border px-3 py-2 text-sm focus:outline-hidden"
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
              className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-hidden"
            />
            <input
              type="text"
              value={item.description || ''}
              onChange={(e) =>
                updateItem(index, { description: e.target.value })
              }
              placeholder="Description (optional)"
              className="border-foreground/20 bg-background focus:border-foreground/40 w-full rounded-md border px-3 py-2 text-sm focus:outline-hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
