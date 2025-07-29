/**
 * Client-side slug utility functions
 */

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
