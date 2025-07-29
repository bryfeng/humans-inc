'use client';

import { useState, useEffect } from 'react';
import {
  generateSlug,
  validateSlug,
  sanitizeSlugInput,
} from '@/utils/slug-client';

interface SlugInputProps {
  slug?: string;
  title?: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

export function SlugInput({ slug, title, onChange, disabled }: SlugInputProps) {
  const [inputValue, setInputValue] = useState(slug || '');
  const [isValid, setIsValid] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Auto-generate slug from title when title changes and no slug is set
  useEffect(() => {
    if (title && !slug && !isEditing) {
      const generatedSlug = generateSlug(title);
      setInputValue(generatedSlug);
      onChange(generatedSlug);
    }
  }, [title, slug, isEditing, onChange]);

  // Validate slug whenever input changes
  useEffect(() => {
    const valid = !inputValue || validateSlug(inputValue);
    setIsValid(valid);
  }, [inputValue]);

  const handleInputChange = (value: string) => {
    setIsEditing(true);
    const sanitized = sanitizeSlugInput(value);
    setInputValue(sanitized);
    onChange(sanitized);
  };

  const handleGenerateFromTitle = () => {
    if (title) {
      const generatedSlug = generateSlug(title);
      setInputValue(generatedSlug);
      onChange(generatedSlug);
      setIsEditing(true);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <label className="text-foreground/80 mb-1 block text-sm font-medium">
          URL Slug
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            placeholder="url-friendly-slug"
            className={`border-foreground/20 bg-background focus:border-foreground/40 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
              !isValid
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : ''
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          />
        </div>

        {/* URL Preview */}
        {inputValue && (
          <div className="text-foreground/60 mt-1 text-xs">
            URL: <span className="font-mono">/{inputValue}</span>
          </div>
        )}

        {/* Validation Error */}
        {!isValid && (
          <p className="mt-1 text-xs text-red-600">
            Invalid format. Use lowercase letters, numbers, and hyphens only.
          </p>
        )}
      </div>

      {/* Generate Button */}
      {title && (
        <div className="pt-6">
          <button
            type="button"
            onClick={handleGenerateFromTitle}
            disabled={disabled}
            className="text-xs whitespace-nowrap text-blue-600 underline hover:text-blue-800 disabled:no-underline disabled:opacity-50"
          >
            Generate from title
          </button>
        </div>
      )}
    </div>
  );
}
