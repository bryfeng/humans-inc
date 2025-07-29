'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  CreateBlockData,
  UpdateBlockData,
  Block,
  BlockLayoutUpdate,
} from '../types';
import {
  generateAvailableSlug,
  isSlugAvailable,
  validateSlug,
  isUUID,
} from '@/utils/slug';

export async function createBlock(data: CreateBlockData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure the user_id matches the authenticated user
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create block for another user');
  }

  // Check that user has a profile record - redirect to setup if not
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.username) {
    // User needs to complete profile setup first
    redirect('/dashboard?setup=required');
  }

  const { data: createdBlock, error } = await supabase
    .from('blocks')
    .insert({
      user_id: data.user_id,
      position: data.position,
      block_type: data.block_type,
      title: data.title,
      content: data.content,
      config: data.config || {},
      is_published: data.is_published ?? false, // Default to draft
    })
    .select()
    .single();

  if (error) {
    console.error('Create block error:', error.message);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return createdBlock;
}

export async function updateBlock(data: UpdateBlockData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', data.id)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot update block belonging to another user'
    );
  }

  // Handle slug validation if being updated
  if (data.slug !== undefined) {
    if (data.slug && !validateSlug(data.slug)) {
      throw new Error(
        'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
      );
    }

    // Check slug availability if changing slug
    if (data.slug) {
      const { data: currentBlock, error: currentError } = await supabase
        .from('blocks')
        .select('slug')
        .eq('id', data.id)
        .single();

      if (currentError) {
        console.error('Fetch current block error:', currentError.message);
        throw new Error(
          `Failed to fetch current block: ${currentError.message}`
        );
      }

      // Only check availability if slug is actually changing
      if (currentBlock.slug !== data.slug) {
        const isAvailable = await isSlugAvailable(user.id, data.slug);
        if (!isAvailable) {
          throw new Error(
            'Slug is already in use. Please choose a different slug.'
          );
        }
      }
    }
  }

  // Build update object with only provided fields
  const updateData: Partial<
    Pick<
      Block,
      | 'title'
      | 'slug'
      | 'content'
      | 'config'
      | 'position'
      | 'is_published'
      | 'updated_at'
    >
  > = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.config !== undefined) updateData.config = data.config;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.is_published !== undefined)
    updateData.is_published = data.is_published;

  // Always update the updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('blocks')
    .update(updateData)
    .eq('id', data.id);

  if (error) {
    console.error('Update block error:', error.message);
    throw new Error(`Failed to update block: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

export async function deleteBlock(blockId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot delete block belonging to another user'
    );
  }

  const { error } = await supabase.from('blocks').delete().eq('id', blockId);

  if (error) {
    console.error('Delete block error:', error.message);
    throw new Error(`Failed to delete block: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

export async function reorderBlocks(
  userId: string,
  blockUpdates: Array<{ id: string; position: number }>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (userId !== user.id) {
    throw new Error('Unauthorized: Cannot reorder blocks for another user');
  }

  // Update all block positions in a transaction-like manner
  // Note: Supabase doesn't have traditional transactions, but we can use RPC or batch updates
  const updatePromises = blockUpdates.map(
    ({ id, position }) =>
      supabase
        .from('blocks')
        .update({
          position,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId) // Double-check ownership
  );

  const results = await Promise.all(updatePromises);

  // Check if any updates failed
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.error('Reorder blocks errors:', errors);
    throw new Error('Failed to reorder some blocks');
  }

  revalidatePath('/dashboard');
}

export async function getUserBlocks(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (userId !== user.id) {
    throw new Error('Unauthorized: Cannot fetch blocks for another user');
  }

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Fetch user blocks error:', error.message);
    throw new Error(`Failed to fetch blocks: ${error.message}`);
  }

  return blocks || [];
}

// Optimized version for use in authenticated dashboard contexts
// Skips redundant auth check since the caller has already authenticated
export async function getUserBlocksOptimized(userId: string) {
  const supabase = await createClient();

  // Use select() to only fetch the fields we need for editing
  const { data: blocks, error } = await supabase
    .from('blocks')
    .select(
      'id, user_id, position, block_type, title, content, config, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Fetch user blocks error:', error.message);
    throw new Error(`Failed to fetch blocks: ${error.message}`);
  }

  return blocks || [];
}

// Combined function to get profile + blocks in a single query where possible
export async function getProfileWithBlocks(userId: string) {
  const supabase = await createClient();

  // Execute both queries in parallel
  const [profileResult, blocksResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('blocks')
      .select(
        'id, user_id, position, block_type, title, content, config, created_at, updated_at'
      )
      .eq('user_id', userId)
      .order('position', { ascending: true }),
  ]);

  const profile = profileResult.data || null;
  const blocks = blocksResult.data || [];

  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    console.error('Fetch profile error:', profileResult.error.message);
  }

  if (blocksResult.error) {
    console.error('Fetch blocks error:', blocksResult.error.message);
  }

  return { profile, blocks };
}

// Public function to fetch blocks for visitor view
export async function getPublicUserBlocks(userId: string) {
  const supabase = await createClient();

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_published', true)
    .eq('is_visible', true) // Only show visible blocks
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('position', { ascending: true }); // Fallback to position for blocks without display_order

  if (error) {
    console.error('Fetch public blocks error:', error.message);
    return [];
  }

  return blocks || [];
}

// Public function to get user profile by username
export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Fetch public profile error:', error.message);
    return null;
  }

  return profile;
}

// Draft-specific functions
export async function getDraftBlocks(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (userId !== user.id) {
    throw new Error('Unauthorized: Cannot fetch draft blocks for another user');
  }

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_published', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Fetch draft blocks error:', error.message);
    throw new Error(`Failed to fetch draft blocks: ${error.message}`);
  }

  return blocks || [];
}

export async function getPublishedBlocks(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (userId !== user.id) {
    throw new Error(
      'Unauthorized: Cannot fetch published blocks for another user'
    );
  }

  const { data: blocks, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_published', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('Fetch published blocks error:', error.message);
    throw new Error(`Failed to fetch published blocks: ${error.message}`);
  }

  return blocks || [];
}

export async function publishBlock(blockId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot publish block belonging to another user'
    );
  }

  const { error } = await supabase
    .from('blocks')
    .update({
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Publish block error:', error.message);
    throw new Error(`Failed to publish block: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

export async function unpublishBlock(blockId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot unpublish block belonging to another user'
    );
  }

  const { error } = await supabase
    .from('blocks')
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Unpublish block error:', error.message);
    throw new Error(`Failed to unpublish block: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

// Enhanced block creation with immediate publish/save functionality
export async function createAndPublishBlock(data: CreateBlockData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure the user_id matches the authenticated user
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create block for another user');
  }

  // Check that user has a profile record - redirect to setup if not
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.username) {
    // User needs to complete profile setup first
    redirect('/dashboard?setup=required');
  }

  // Get the highest position to add block at the end
  const { data: lastBlock, error: positionError } = await supabase
    .from('blocks')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = lastBlock ? lastBlock.position + 1 : 0;

  const { data: createdBlock, error } = await supabase
    .from('blocks')
    .insert({
      user_id: data.user_id,
      position: nextPosition,
      block_type: data.block_type,
      title: data.title,
      content: data.content,
      config: data.config || {},
      is_published: true, // Immediately published
    })
    .select()
    .single();

  if (error) {
    console.error('Create and publish block error:', error.message);
    throw new Error(`Failed to create and publish block: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return createdBlock;
}

// Enhanced block creation that saves as draft (hidden)
export async function createAndSaveBlock(data: CreateBlockData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure the user_id matches the authenticated user
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create block for another user');
  }

  // Check that user has a profile record - redirect to setup if not
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.username) {
    // User needs to complete profile setup first
    redirect('/dashboard?setup=required');
  }

  const { data: createdBlock, error } = await supabase
    .from('blocks')
    .insert({
      user_id: data.user_id,
      position: data.position || 0,
      block_type: data.block_type,
      title: data.title,
      content: data.content,
      config: data.config || {},
      is_published: false, // Saved as draft
    })
    .select()
    .single();

  if (error) {
    console.error('Create and save block error:', error.message);
    throw new Error(`Failed to create and save block: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return createdBlock;
}

// Toggle block visibility (published/hidden)
export async function toggleBlockVisibility(blockId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id, is_published')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot toggle visibility of block belonging to another user'
    );
  }

  const newPublishedState = !existingBlock.is_published;

  const { error } = await supabase
    .from('blocks')
    .update({
      is_published: newPublishedState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Toggle block visibility error:', error.message);
    throw new Error(`Failed to toggle block visibility: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return newPublishedState;
}

// Auto-save functionality for future implementation
export async function autoSaveBlock(
  blockId: string,
  content: Record<string, unknown>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return; // Silent fail for auto-save
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id')
    .eq('id', blockId)
    .single();

  if (fetchError || existingBlock.user_id !== user.id) {
    return; // Silent fail for auto-save
  }

  const { error } = await supabase
    .from('blocks')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Auto-save block error:', error.message);
    // Silent fail for auto-save
  }

  // Don't revalidate for auto-save to avoid excessive re-renders
}

// Slug-specific functions

// Get block by slug (for public access)
export async function getBlockBySlug(
  userId: string,
  slug: string
): Promise<Block | null> {
  const supabase = await createClient();

  const { data: block, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Fetch block by slug error:', error.message);
    return null;
  }

  return block;
}

// Get block by slug or ID (for backwards compatibility)
export async function getBlockBySlugOrId(
  userId: string,
  slugOrId: string
): Promise<Block | null> {
  const supabase = await createClient();

  // First try to get by slug if it's not a UUID
  if (!isUUID(slugOrId)) {
    const blockBySlug = await getBlockBySlug(userId, slugOrId);
    if (blockBySlug) return blockBySlug;
  }

  // Fallback to ID lookup
  const { data: block, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('id', slugOrId)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Fetch block by ID error:', error.message);
    return null;
  }

  return block;
}

// Validate and update block slug
export async function updateBlockSlug(
  blockId: string,
  newSlug: string
): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Validate slug format
  if (!validateSlug(newSlug)) {
    throw new Error(
      'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
    );
  }

  // First check if the block belongs to the authenticated user
  const { data: existingBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('user_id, slug')
    .eq('id', blockId)
    .single();

  if (fetchError) {
    console.error('Fetch block error:', fetchError.message);
    throw new Error(`Failed to fetch block: ${fetchError.message}`);
  }

  if (existingBlock.user_id !== user.id) {
    throw new Error(
      'Unauthorized: Cannot update slug of block belonging to another user'
    );
  }

  // Check if slug is available (ignore current block's slug)
  if (existingBlock.slug !== newSlug) {
    const isAvailable = await isSlugAvailable(user.id, newSlug);
    if (!isAvailable) {
      throw new Error(
        'Slug is already in use. Please choose a different slug.'
      );
    }
  }

  // Update the slug
  const { error } = await supabase
    .from('blocks')
    .update({
      slug: newSlug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId);

  if (error) {
    console.error('Update block slug error:', error.message);
    throw new Error(`Failed to update slug: ${error.message}`);
  }

  revalidatePath('/dashboard');

  // Also revalidate the public profile page
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (profile?.username) {
    revalidatePath(`/${profile.username}`);
  }

  return true;
}

// Enhanced create function with slug support
export async function createBlockWithSlug(
  data: CreateBlockData & { generateSlug?: boolean }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure the user_id matches the authenticated user
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create block for another user');
  }

  // Check that user has a profile record
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.username) {
    redirect('/dashboard?setup=required');
  }

  // Generate slug if requested and title is provided
  let finalSlug = data.slug;
  if (data.generateSlug && data.title && !finalSlug) {
    finalSlug = await generateAvailableSlug(user.id, data.title);
  }

  // Validate provided slug
  if (finalSlug && !validateSlug(finalSlug)) {
    throw new Error(
      'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
    );
  }

  // Check slug availability if provided
  if (finalSlug) {
    const isAvailable = await isSlugAvailable(user.id, finalSlug);
    if (!isAvailable) {
      throw new Error(
        'Slug is already in use. Please choose a different slug.'
      );
    }
  }

  const { data: createdBlock, error } = await supabase
    .from('blocks')
    .insert({
      user_id: data.user_id,
      position: data.position,
      block_type: data.block_type,
      title: data.title,
      slug: finalSlug,
      content: data.content,
      config: data.config || {},
      is_published: data.is_published ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Create block with slug error:', error.message);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return createdBlock;
}

// Update block layout (visibility and ordering)
export async function updateBlockLayout(
  userId: string,
  layoutUpdates: BlockLayoutUpdate[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (userId !== user.id) {
    throw new Error('Unauthorized: Cannot update layout for another user');
  }

  // Verify all blocks belong to the user before updating
  const blockIds = layoutUpdates.map((update) => update.id);
  const { data: userBlocks, error: verifyError } = await supabase
    .from('blocks')
    .select('id, user_id')
    .in('id', blockIds)
    .eq('user_id', userId);

  if (verifyError) {
    console.error('Verify blocks error:', verifyError.message);
    throw new Error(`Failed to verify block ownership: ${verifyError.message}`);
  }

  if (userBlocks.length !== blockIds.length) {
    throw new Error('Some blocks do not exist or do not belong to user');
  }

  // Update all blocks in batch
  const updatePromises = layoutUpdates.map(
    ({ id, is_visible, display_order }) =>
      supabase
        .from('blocks')
        .update({
          is_visible,
          display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId) // Double-check ownership
  );

  const results = await Promise.all(updatePromises);

  // Check if any updates failed
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.error('Update layout errors:', errors);
    throw new Error('Failed to update some block layouts');
  }

  // Revalidate both dashboard and public profile
  revalidatePath('/dashboard');

  // Also revalidate the public profile page if we can determine the username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  if (profile?.username) {
    revalidatePath(`/${profile.username}`);
  }
}
