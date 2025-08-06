import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BlockRenderer } from '@/features/blocks/components';
import {
  getPublicUserBlocks,
  getPublicProfile,
} from '@/features/blocks/actions';
import type { BioBlockContent } from '@/features/blocks/types';

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Generate static paths for existing user profiles
export async function generateStaticParams() {
  // Use service client for build-time operations (no cookies needed)
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles } = await supabase
    .from('profiles')
    .select('username')
    .not('username', 'is', null);

  if (!profiles) {
    return [];
  }

  return profiles
    .filter(
      (profile) => profile.username && typeof profile.username === 'string'
    )
    .map((profile) => ({
      username: profile.username as string,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return {
      title: 'Profile Not Found',
      description: 'This profile does not exist.',
    };
  }

  // Get bio block for additional metadata
  const blocks = await getPublicUserBlocks(profile.id);
  const bioBlock = blocks.find((block) => block.block_type === 'bio');
  const bioContent = bioBlock?.content as BioBlockContent | undefined;

  const title =
    bioContent?.display_name || profile.display_name || profile.username;
  const description =
    bioContent?.tagline ||
    bioContent?.bio ||
    `${title}'s profile on humans.inc`;
  const imageUrl = bioContent?.avatar_url;

  return {
    title: `${title} | humans.inc`,
    description: description.slice(0, 160), // Limit description length
    openGraph: {
      title: `${title} | humans.inc`,
      description: description.slice(0, 160),
      type: 'profile',
      url: `/${username}`,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 400,
            height: 400,
            alt: `${title}'s profile picture`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary',
      title: `${title} | humans.inc`,
      description: description.slice(0, 160),
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Get profile data
  const profile = await getPublicProfile(username);

  // If no profile is found for the username, render a 404 page
  if (!profile) {
    notFound();
  }

  // Get user's blocks
  const blocks = await getPublicUserBlocks(profile.id);

  return (
    <div className="container mx-auto max-w-4xl px-6 py-8">
      <div className="space-y-8">
        {/* Render blocks */}
        {blocks.length > 0 ? (
          <div className="space-y-8">
            {blocks.map((block) => (
              <div key={block.id} className="w-full">
                <BlockRenderer block={block} mode="preview" />
              </div>
            ))}
          </div>
        ) : (
          /* Fallback when no blocks exist */
          <div className="py-12 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                {/* Simple avatar fallback */}
                <div className="bg-foreground/10 flex h-24 w-24 items-center justify-center rounded-full">
                  <span className="text-foreground/50 text-2xl">
                    {profile.display_name?.charAt(0)?.toUpperCase() ||
                      profile.username?.charAt(0)?.toUpperCase() ||
                      '?'}
                  </span>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-foreground/80 text-lg">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <div className="border-foreground/10 mt-8 border-t pt-8">
                <p className="text-foreground/60">
                  This profile hasn't been set up yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
