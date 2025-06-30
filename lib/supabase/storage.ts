import { supabase } from './client'; // Assuming client.ts is in the same directory

/**
 * Uploads a file to the 'avatars' Supabase storage bucket.
 *
 * @param file The file to upload.
 * @param userId The ID of the user, used to create a unique path for the avatar.
 * @returns The public URL of the uploaded file.
 * @throws If the upload fails or the file path cannot be determined.
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!userId) {
    throw new Error('User ID is required to upload an avatar.');
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExtension}`;
  // This path creates a folder with the user's ID, which matches the RLS policy.
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('avatars') // Target the 'avatars' bucket
    .upload(filePath, file, {
      cacheControl: '3600', // Cache for 1 hour
      upsert: true, // Overwrite if file already exists for this user
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  if (!data || !data.path) {
    throw new Error('Upload successful, but no path returned from Supabase.');
  }

  // Get public URL from the correct path
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for the uploaded avatar.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Deletes an avatar from the 'avatars' Supabase storage bucket.
 *
 * @param filePath The full path of the file to delete (e.g., "userId/avatar-123.png").
 * @throws If the deletion fails.
 */
export async function deleteAvatar(filePath: string): Promise<void> {
  if (!filePath) {
    throw new Error('File path is required to delete an avatar.');
  }

  const { error } = await supabase.storage.from('avatars').remove([filePath]);

  if (error) {
    // It's often okay if the file wasn't found (e.g., user never had an avatar)
    // You might want to log this or handle specific error codes differently
    console.warn(`Could not delete avatar ${filePath}: ${error.message}`);
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }
}
