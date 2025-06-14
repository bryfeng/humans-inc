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
  const fileName = `${userId}.${fileExtension}`; // e.g., user123.png
  const filePath = `public/${fileName}`; // Store in a 'public' folder within the 'avatars' bucket for easier public URL generation

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

  // Construct the public URL
  // Note: This assumes your 'avatars' bucket is configured for public access
  // and the files are in a 'public' subfolder within the bucket.
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for the uploaded avatar.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Deletes an avatar from the 'avatars' Supabase storage bucket.
 *
 * @param userId The ID of the user whose avatar needs to be deleted.
 * @param fileExtension The extension of the avatar file (e.g., 'png', 'jpg').
 * @returns True if deletion was successful or file didn't exist, false otherwise.
 */
export async function deleteAvatar(
  userId: string,
  fileExtension: string
): Promise<boolean> {
  if (!userId || !fileExtension) {
    throw new Error(
      'User ID and file extension are required to delete an avatar.'
    );
  }

  const fileName = `${userId}.${fileExtension}`;
  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage.from('avatars').remove([filePath]);

  if (error) {
    // It's often okay if the file wasn't found (e.g., user never had an avatar)
    // You might want to log this or handle specific error codes differently
    console.warn(`Could not delete avatar ${filePath}: ${error.message}`);
    return false;
  }

  return true;
}
