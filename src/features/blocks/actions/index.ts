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
  });

  if (error) {
    console.error('Create block error:', error.message);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  revalidatePath('/dashboard/edit-profile');
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
    Pick<Block, 'title' | 'content' | 'config' | 'position' | 'updated_at'>
  > = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.config !== undefined) updateData.config = data.config;
  if (data.position !== undefined) updateData.position = data.position;

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

  revalidatePath('/dashboard/edit-profile');
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

  revalidatePath('/dashboard/edit-profile');
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

  revalidatePath('/dashboard/edit-profile');
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
