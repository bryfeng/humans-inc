/**
 * Utility functions for generating and validating slugs
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  // Must be 1-100 characters, lowercase letters, numbers, and hyphens only
  // Cannot start or end with hyphen, cannot have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 1 && slug.length <= 100 && slugRegex.test(slug);
}

/**
 * Check if a slug is available for a user
 */
export async function isSlugAvailable(
  userId: string,
  slug: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', slug)
    .limit(1);

  if (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }

  return data.length === 0;
}

/**
 * Find an available slug with deduplication (n+1 pattern)
 */
export async function findAvailableSlug(
  userId: string,
  baseSlug: string
): Promise<string> {
  // First check if the base slug is available
  if (await isSlugAvailable(userId, baseSlug)) {
    return baseSlug;
  }

  // If not, try with incrementing numbers
  let counter = 2;
  while (counter <= 100) {
    // Prevent infinite loops
    const numberedSlug = `${baseSlug}-${counter}`;
    if (await isSlugAvailable(userId, numberedSlug)) {
      return numberedSlug;
    }
    counter++;
  }

  // Fallback: add timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

/**
 * Generate a slug from title and ensure it's available for the user
 */
export async function generateAvailableSlug(
  userId: string,
  title: string
): Promise<string> {
  const baseSlug = generateSlug(title);

  // If the generated slug is empty or invalid, use a default
  if (!baseSlug || !validateSlug(baseSlug)) {
    const fallbackSlug = 'untitled';
    return await findAvailableSlug(userId, fallbackSlug);
  }

  return await findAvailableSlug(userId, baseSlug);
}

/**
 * Check if a string is a UUID (for backwards compatibility)
 */
export function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize user input for slug
 */
export function sanitizeSlugInput(input: string): string {
  return generateSlug(input);
}
