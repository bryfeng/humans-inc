import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfileWithBlocks } from '@/features/blocks/actions';
import { BlockList, BlockCreator } from '@/features/blocks/components';
import { logout } from '@/features/auth/lib/actions';
import { cache } from 'react';

// Cache the profile with blocks fetch to improve performance
const getCachedProfileWithBlocks = cache(async (userId: string) => {
  return await getProfileWithBlocks(userId);
});

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile and blocks with caching
  const { profile, blocks } = await getCachedProfileWithBlocks(user.id);

  // If no profile exists or missing username, redirect to main dashboard for setup
  if (!profile || !profile.username) {
    redirect('/dashboard?setup=required');
  }

  return (
    <div className="container mx-auto h-full max-w-4xl px-6 py-12">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-foreground/80 mt-2 text-lg">
            Customize your content blocks and layout.
          </p>
        </div>

        {/* Block Creator */}
        <div className="border-foreground/10 bg-foreground/5 w-full rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Add New Block</h2>
          <BlockCreator
            userId={user?.id || ''}
            currentBlockCount={blocks.length}
          />
        </div>

        {/* Block List */}
        <div className="w-full space-y-4">
          <h2 className="text-xl font-semibold">Your Content Blocks</h2>
          {blocks.length > 0 ? (
            <BlockList blocks={blocks} />
          ) : (
            <div className="border-foreground/10 text-foreground/60 rounded-lg border border-dashed p-8 text-center">
              <p>No blocks yet. Create your first block above!</p>
            </div>
          )}
        </div>

        {/* View Public Profile Link */}
        <div className="pt-4 text-center">
          <a
            href={`/${profile?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-foreground underline"
          >
            View your public profile →
          </a>
        </div>
      </div>
    </div>
  );
}
