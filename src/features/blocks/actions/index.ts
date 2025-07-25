'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { CreateBlockData, UpdateBlockData, Block } from '../types';

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

  const { error } = await supabase.from('blocks').insert({
    user_id: data.user_id,
    position: data.position,
    block_type: data.block_type,
    title: data.title,
    content: data.content,
    config: data.config || {},
    is_published: data.is_published ?? false, // Default to draft
  });

  if (error) {
    console.error('Create block error:', error.message);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  revalidatePath('/dashboard');
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

  // Build update object with only provided fields
  const updateData: Partial<
    Pick<
      Block,
      | 'title'
      | 'content'
      | 'config'
      | 'position'
      | 'is_published'
      | 'updated_at'
    >
  > = {};
  if (data.title !== undefined) updateData.title = data.title;
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
    .order('position', { ascending: true });

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
