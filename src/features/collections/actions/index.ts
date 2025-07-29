'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from '@/types';
import { revalidatePath } from 'next/cache';

// Define a generic block type to avoid cross-feature dependencies
interface Block {
  id: string;
  user_id: string;
  collection_id?: string | null;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>;
}

// Get all collections for a user
export async function getUserCollections(
  userId: string
): Promise<Collection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching collections:', error.message);
    throw new Error(`Failed to fetch collections: ${error.message}`);
  }

  return (data as Collection[]) || [];
}

// Create a new collection
export async function createCollection(
  data: CreateCollectionData
): Promise<Collection> {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify ownership
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create collection for another user');
  }

  // Get next display order if not specified
  let displayOrder = data.display_order;
  if (displayOrder === undefined) {
    const { data: collections } = await supabase
      .from('collections')
      .select('display_order')
      .eq('user_id', user.id)
      .order('display_order', { ascending: false, nullsFirst: false })
      .limit(1);

    displayOrder =
      collections && collections.length > 0
        ? (collections[0].display_order || 0) + 1
        : 0;
  }

  const { data: result, error } = await supabase
    .from('collections')
    .insert({
      ...data,
      display_order: displayOrder,
      is_public: data.is_public ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Create collection error:', error.message);
    throw new Error(`Failed to create collection: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return result;
}

// Update an existing collection
export async function updateCollection(
  data: UpdateCollectionData
): Promise<Collection> {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('collections')
    .select('user_id')
    .eq('id', data.id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot update collection for another user');
  }

  const { data: result, error } = await supabase
    .from('collections')
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description,
      is_public: data.is_public,
      display_order: data.display_order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    console.error('Update collection error:', error.message);
    throw new Error(`Failed to update collection: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return result;
}

// Delete a collection
export async function deleteCollection(collectionId: string): Promise<void> {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('collections')
    .select('user_id')
    .eq('id', collectionId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot delete collection for another user');
  }

  // Remove collection_id from all blocks in this collection
  await supabase
    .from('blocks')
    .update({ collection_id: null })
    .eq('collection_id', collectionId);

  // Delete the collection
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Delete collection error:', error.message);
    throw new Error(`Failed to delete collection: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

// Move a block to a collection
export async function moveBlockToCollection(
  blockId: string,
  collectionId: string | null
): Promise<void> {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify block ownership
  const { data: block } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', blockId)
    .single();

  if (!block || block.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot move block for another user');
  }

  // If moving to a collection, verify collection ownership
  if (collectionId) {
    const { data: collection } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single();

    if (!collection || collection.user_id !== user.id) {
      throw new Error(
        'Unauthorized: Cannot move block to collection for another user'
      );
    }
  }

  // Update the block's collection
  const { error } = await supabase
    .from('blocks')
    .update({
      collection_id: collectionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Move block to collection error:', error.message);
    throw new Error(`Failed to move block to collection: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

// Get blocks grouped by collection
export async function getBlocksByCollection(userId: string): Promise<{
  collections: Collection[];
  blocksByCollection: Record<string, Block[]>;
  uncategorizedBlocks: Block[];
}> {
  const supabase = await createClient();

  // Get collections
  const collections = await getUserCollections(userId);

  // Get all blocks for the user
  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching blocks:', error.message);
    throw new Error(`Failed to fetch blocks: ${error.message}`);
  }

  // Group blocks by collection
  const blocksByCollection: Record<string, Block[]> = {};
  const uncategorizedBlocks: Block[] = [];

  (blocks || []).forEach((block) => {
    if (block.collection_id) {
      if (!blocksByCollection[block.collection_id]) {
        blocksByCollection[block.collection_id] = [];
      }
      blocksByCollection[block.collection_id].push(block);
    } else {
      uncategorizedBlocks.push(block);
    }
  });

  return {
    collections,
    blocksByCollection,
    uncategorizedBlocks,
  };
}

// Create default "Uncategorized" collection for new users
export async function createDefaultCollection(
  userId: string
): Promise<Collection> {
  return createCollection({
    user_id: userId,
    name: 'Uncategorized',
    description: 'Default collection for blocks without a specific category',
    is_public: false,
    display_order: 999, // Put at the end
  });
}
