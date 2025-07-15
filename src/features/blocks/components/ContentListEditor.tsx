'use client';

import type { ContentListBlockContent } from '../types';

interface ContentListEditorProps {
  content: ContentListBlockContent;
  onChange: (content: ContentListBlockContent) => void;
}

export function ContentListEditor({
  content,
  onChange,
}: ContentListEditorProps) {
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
