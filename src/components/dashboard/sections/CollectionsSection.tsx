'use client';

import React, { useState } from 'react';
import type { UserProfile } from '@/types/user';
import type { Collection } from '@/types';

// Define local Block type to avoid boundary violation
interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  slug?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  is_published: boolean;
  is_visible?: boolean;
  display_order?: number;
  collection_id?: string;
  created_at: string;
  updated_at: string;
}

interface CollectionsSectionProps {
  profile: UserProfile | null;
  collections: Collection[];
  blocks: Block[];
  loading: boolean;
  onCreateCollection: (name: string, description?: string) => Promise<void>;
  onUpdateCollection: (
    id: string,
    name: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
}

export function CollectionsSection({
  profile,
  collections,
  blocks,
  loading,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
}: CollectionsSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null
  );
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get block count for each collection
  const getBlockCount = (collectionId: string | null) => {
    return blocks.filter((block) => block.collection_id === collectionId)
      .length;
  };

  const getUncategorizedCount = () => {
    return blocks.filter((block) => !block.collection_id).length;
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined
      );
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection. Please try again.');
    }
    setIsCreating(false);
  };

  const handleUpdateCollection = async (
    collection: Collection,
    name: string,
    description?: string,
    isPublic?: boolean
  ) => {
    try {
      await onUpdateCollection(collection.id, name, description, isPublic);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
      alert('Failed to update collection. Please try again.');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this collection? Blocks in this collection will be moved to Uncategorized.'
      )
    ) {
      try {
        await onDeleteCollection(collectionId);
      } catch (error) {
        console.error('Failed to delete collection:', error);
        alert('Failed to delete collection. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Collections</h1>
          <p className="text-foreground/60">Loading your collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Collections</h1>
        <p className="text-foreground/60">
          Organize your content blocks into themed collections
        </p>
      </div>

      {/* Create Collection */}
      <div className="bg-background border-foreground/10 rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Collections</h3>
            <p className="text-foreground/60 text-sm">
              Group related blocks together for better organization
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <span>➕</span>
            New Collection
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateCollection}
            className="border-foreground/20 bg-foreground/5 mb-6 rounded-lg border p-4"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="collection-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Collection Name *
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Projects, Writing, Personal"
                  required
                  className="bg-background border-foreground/20 focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="collection-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description (optional)
                </label>
                <textarea
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Brief description of this collection"
                  rows={3}
                  className="bg-background border-foreground/20 focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating || !newCollectionName.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Create Collection
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollectionName('');
                    setNewCollectionDescription('');
                  }}
                  className="text-foreground/60 hover:text-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Collections List */}
        <div className="space-y-4">
          {/* Uncategorized (special case) */}
          <div className="bg-foreground/5 flex items-center justify-between rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📂</span>
              <div>
                <h4 className="font-medium">Uncategorized</h4>
                <p className="text-foreground/60 text-sm">
                  Blocks not assigned to any collection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-foreground/20 text-foreground/60 rounded-full px-3 py-1 text-sm">
                {getUncategorizedCount()} blocks
              </span>
            </div>
          </div>

          {/* User Collections */}
          {collections.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">🗂️</div>
              <h4 className="mb-2 font-semibold">No collections yet</h4>
              <p className="text-foreground/60 mb-4 text-sm">
                Create your first collection to organize your content blocks by
                theme or purpose.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                <span>➕</span>
                Create Collection
              </button>
            </div>
          ) : (
            collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                blockCount={getBlockCount(collection.id)}
                isEditing={editingCollection === collection.id}
                onEdit={() => setEditingCollection(collection.id)}
                onCancelEdit={() => setEditingCollection(null)}
                onUpdate={handleUpdateCollection}
                onDelete={() => handleDeleteCollection(collection.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {collections.length}
          </div>
          <div className="text-foreground/60 text-sm">Collections</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">{blocks.length}</div>
          <div className="text-foreground/60 text-sm">Total Blocks</div>
        </div>

        <div className="bg-background border-foreground/10 rounded-lg border p-4">
          <div className="text-primary text-2xl font-bold">
            {getUncategorizedCount()}
          </div>
          <div className="text-foreground/60 text-sm">Uncategorized</div>
        </div>
      </div>
    </div>
  );
}

// Collection Card Component
interface CollectionCardProps {
  collection: Collection;
  blockCount: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (
    collection: Collection,
    name: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<void>;
  onDelete: () => void;
}

function CollectionCard({
  collection,
  blockCount,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: CollectionCardProps) {
  const [editName, setEditName] = useState(collection.name);
  const [editDescription, setEditDescription] = useState(
    collection.description || ''
  );
  const [editIsPublic, setEditIsPublic] = useState(collection.is_public);
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (isEditing) {
      setEditName(collection.name);
      setEditDescription(collection.description || '');
      setEditIsPublic(collection.is_public);
    }
  }, [isEditing, collection]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      await onUpdate(
        collection,
        editName.trim(),
        editDescription.trim() || undefined,
        editIsPublic
      );
    } catch (error) {
      // Error handling is done in parent
    }
    setIsUpdating(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleUpdate}
        className="border-foreground/20 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Collection Name *
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="bg-background border-foreground/20 focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="bg-background border-foreground/20 focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`public-${collection.id}`}
              checked={editIsPublic}
              onChange={(e) => setEditIsPublic(e.target.checked)}
              className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 focus:ring-2"
            />
            <label htmlFor={`public-${collection.id}`} className="text-sm">
              Make this collection visible on public profile
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isUpdating || !editName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancelEdit}
              className="text-foreground/60 hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-foreground/5 flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗂️</span>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{collection.name}</h4>
            {collection.is_public && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Public
              </span>
            )}
          </div>
          {collection.description && (
            <p className="text-foreground/60 text-sm">
              {collection.description}
            </p>
          )}
          <p className="text-foreground/50 text-xs">
            Created {new Date(collection.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-foreground/20 text-foreground/60 rounded-full px-3 py-1 text-sm">
          {blockCount} blocks
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="text-foreground/60 hover:text-foreground rounded p-1 transition-colors"
            title="Edit collection"
          >
            ✏️
          </button>

          <button
            onClick={onDelete}
            className="text-foreground/60 rounded p-1 transition-colors hover:text-red-600"
            title="Delete collection"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
