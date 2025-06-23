'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkUsernameAvailability(username: string) {
  // Skip check for empty usernames
  if (!username.trim()) {
    return { isAvailable: true };
  }

  const supabase = await createClient();

  // Need to get current user to exclude their own username from the check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .not('id', 'eq', user?.id ?? ''); // Exclude the current user's profile

  if (error) {
    // In case of a database error, assume it might be available to avoid blocking the user
    // but log the error for debugging.
    console.error('Error checking username availability:', error);
    return { isAvailable: true };
  }

  // If data is empty, the username is available
  return { isAvailable: data.length === 0 };
}
