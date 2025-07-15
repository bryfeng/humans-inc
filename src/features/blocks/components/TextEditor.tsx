'use client';

import type { TextBlockContent } from '../types';

interface TextEditorProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
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
