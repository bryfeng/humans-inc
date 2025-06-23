'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the schema for profile updates using Zod
const ProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(50, { message: 'Username cannot be longer than 50 characters.' })
    .regex(/^[a-z0-9_]+$/, {
      message:
        'Username can only contain lowercase letters, numbers, and underscores.',
    })
    .refine(
      (username) => {
        const reservedUsernames = [
          'login',
          'signup',
          'api',
          'admin',
          'dashboard',
          'profile',
          'settings',
          'legal',
          'help',
          'contact',
        ];
        return !reservedUsernames.includes(username);
      },
      { message: 'This username is reserved and cannot be used.' }
    ),
  display_name: z
    .string()
    .max(100, { message: 'Display name cannot be longer than 100 characters.' })
    .optional(),
});

// Define the shape of the state object for the form
export interface ProfileFormState {
  success: boolean;
  message: string;
  errors?: {
    username?: string[];
    display_name?: string[];
  };
}

export async function updateProfile(
  prevState: ProfileFormState,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  const rawData = {
    username: formData.get('username'),
    display_name: formData.get('display_name'),
  };

  const validationResult = ProfileSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Invalid data provided.',
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update(validationResult.data)
    .eq('id', user.id);

  if (error) {
    // Handle potential unique constraint violation for username
    if (error.code === '23505') {
      return {
        success: false,
        message: 'This username is already taken.',
        errors: { username: ['This username is already taken.'] },
      };
    }
    return { success: false, message: `Database error: ${error.message}` };
  }

  // Revalidate the user's profile page to show the updated data
  revalidatePath(`/${validationResult.data.username}`);
  revalidatePath('/dashboard'); // Also revalidate dashboard if it shows profile info

  return { success: true, message: 'Profile updated successfully.' };
}
