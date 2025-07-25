'use client';

import { useState } from 'react';
import type { TextBlockContent } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface TextEditorProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const [editorMode, setEditorMode] = useState<'rich' | 'simple'>(
    content.formatting === 'rich' ? 'rich' : 'simple'
  );

  if (editorMode === 'rich') {
    return (
      <div className="animate-fade-in space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Rich Text Editor
          </h3>
          <button
            type="button"
            onClick={() => setEditorMode('simple')}
            className="text-foreground/60 hover:text-foreground text-sm underline transition-colors"
          >
            Switch to Simple Editor
          </button>
        </div>

        {/* Rich Text Editor */}
        <RichTextEditor
          content={content}
          onChange={onChange}
          placeholder="Start writing your story..."
          autofocus={true}
        />
      </div>
    );
  }

  // Simple/Legacy Editor Mode
  const textContent = content;
  const wordCount = textContent.text
    ? textContent.text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;
  const charCount = textContent.text?.length || 0;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Simple Text Editor
        </h3>
        <button
          type="button"
          onClick={() => {
            setEditorMode('rich');
            // Convert to rich format
            onChange({
              ...textContent,
              formatting: 'rich',
              richContent: textContent.text
                ? `<p>${textContent.text.replace(/\n/g, '</p><p>')}</p>`
                : '',
            });
          }}
          className="bg-primary text-background hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          Switch to Rich Editor ✨
        </button>
      </div>

      <div className="animate-slide-up">
        <textarea
          value={textContent.text || ''}
          onChange={(e) => onChange({ ...textContent, text: e.target.value })}
          placeholder="Enter your text content..."
          rows={8}
          className="input-primary min-h-32 resize-y"
        />
        <div className="text-foreground/60 mt-2 flex items-center justify-between text-xs">
          <span>
            {wordCount} words, {charCount} characters
          </span>
          {textContent.formatting === 'markdown' && (
            <span className="text-blue-600 dark:text-blue-400">
              Markdown formatting enabled
            </span>
          )}
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-foreground/80 mb-2 block text-sm font-medium">
          Formatting
        </label>
        <select
          value={textContent.formatting || 'plain'}
          onChange={(e) =>
            onChange({
              ...textContent,
              formatting: e.target.value as 'plain' | 'markdown',
            })
          }
          className="input-primary"
        >
          <option value="plain">Plain Text</option>
          <option value="markdown">Markdown</option>
        </select>
        <p className="text-foreground/60 mt-1 text-xs">
          {textContent.formatting === 'markdown'
            ? 'Use markdown syntax for formatting (e.g., **bold**, *italic*, [links](url))'
            : 'Plain text will be displayed as-is without formatting'}
        </p>
      </div>
    </div>
  );
}
