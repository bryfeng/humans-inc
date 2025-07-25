'use client';

import { useState } from 'react';

interface SmartPublishControlsProps {
  isPublished: boolean;
  onToggleVisibility: (isPublished: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export function SmartPublishControls({
  isPublished,
  onToggleVisibility,
  onSave,
  isSaving = false,
  disabled = false,
}: SmartPublishControlsProps) {
  const [localIsPublished, setLocalIsPublished] = useState(isPublished);

  const handleToggle = () => {
    const newState = !localIsPublished;
    setLocalIsPublished(newState);
    onToggleVisibility(newState);
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="border-foreground/10 flex items-center justify-between rounded-lg border p-4">
      {/* Visibility Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={disabled || isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              localIsPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localIsPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                localIsPublished
                  ? 'bg-green-500'
                  : 'bg-gray-400 dark:bg-gray-500'
              }`}
            />
            <span className="text-sm font-medium">
              {localIsPublished ? 'Published' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* Status Description */}
        <div className="text-foreground/60 text-xs">
          {localIsPublished
            ? 'Block will be visible on your public profile'
            : 'Block will be saved as draft'}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={disabled || isSaving}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          localIsPublished
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <span className="text-sm">{localIsPublished ? '🌍' : '💾'}</span>
            {localIsPublished ? 'Save & Publish' : 'Save'}
          </>
        )}
      </button>
    </div>
  );
}

// Success/Error Feedback Component
interface SaveFeedbackProps {
  type: 'success' | 'error' | null;
  message: string;
  onDismiss: () => void;
}

export function SaveFeedback({ type, message, onDismiss }: SaveFeedbackProps) {
  if (!type) return null;

  return (
    <div
      className={`flex items-center justify-between rounded-lg p-3 text-sm ${
        type === 'success'
          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{type === 'success' ? '✓' : '⚠️'}</span>
        {message}
      </div>
      <button
        onClick={onDismiss}
        className="text-foreground/60 hover:text-foreground ml-2 transition-colors"
      >
        ×
      </button>
    </div>
  );
}

// Block Status Indicator Component
interface BlockStatusIndicatorProps {
  isPublished: boolean;
  lastSaved?: Date;
  className?: string;
}

export function BlockStatusIndicator({
  isPublished,
  lastSaved,
  className = '',
}: BlockStatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div
        className={`h-2 w-2 rounded-full ${
          isPublished ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
        }`}
      />
      <span className="text-foreground/60">
        {isPublished ? 'Published' : 'Draft'}
        {lastSaved && (
          <span className="text-foreground/40 ml-2">
            • Saved {formatTimeAgo(lastSaved)}
          </span>
        )}
      </span>
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}
