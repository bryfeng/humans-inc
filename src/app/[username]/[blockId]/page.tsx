import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { BlockRenderer } from '@/features/blocks/components';
import {
  getPublicUserBlocks,
  getPublicProfile,
  getBlockBySlugOrId,
} from '@/features/blocks/actions';
import type {
  BioBlockContent,
  TextBlockContent,
  Block,
} from '@/features/blocks/types';
import { isUUID } from '@/utils/slug';
import Link from 'next/link';
import Image from 'next/image';

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; blockId: string }>;
}): Promise<Metadata> {
  const { username, blockId } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return {
      title: 'Profile Not Found',
      description: 'This profile does not exist.',
    };
  }

  const block = await getBlockBySlugOrId(profile.id, blockId);

  if (!block || block.block_type !== 'text') {
    return {
      title: 'Content Not Found',
      description: 'This content does not exist.',
    };
  }

  const textContent = block.content as TextBlockContent;
  const authorName = profile.display_name || profile.username;
  const title = block.title || 'Untitled';
  const description = textContent.text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .slice(0, 160);

  return {
    title: `${title} | ${authorName}`,
    description,
    openGraph: {
      title: `${title} | ${authorName}`,
      description,
      type: 'article',
      url: block.slug
        ? `/${username}/${block.slug}`
        : `/${username}/${blockId}`,
    },
    twitter: {
      card: 'summary',
      title: `${title} | ${authorName}`,
      description,
    },
  };
}

// Small bio header component for individual block pages
function SmallBioHeader({
  profile,
  bioBlock,
}: {
  profile: {
    id: string;
    username: string;
    display_name?: string;
  };
  bioBlock?: Block;
}) {
  const bioContent = bioBlock?.content as BioBlockContent | undefined;
  const displayName =
    bioContent?.display_name || profile.display_name || profile.username;
  const avatarUrl = bioContent?.avatar_url;

  return (
    <div className="border-foreground/10 mb-8 flex items-center gap-3 border-b pb-6">
      <Link href={`/${profile.username}`}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${displayName}'s profile picture`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="bg-foreground/10 flex h-12 w-12 items-center justify-center rounded-full">
            <span className="text-foreground/70 text-lg font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>
      <div>
        <Link href={`/${profile.username}`} className="hover:underline">
          <h3 className="text-foreground font-semibold">{displayName}</h3>
          <p className="text-foreground/60 text-sm">@{profile.username}</p>
        </Link>
      </div>
    </div>
  );
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ username: string; blockId: string }>;
}) {
  const { username, blockId } = await params;

  // Get profile data
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  // Get block by slug or ID
  const block = await getBlockBySlugOrId(profile.id, blockId);

  // Only allow text blocks on individual pages
  if (!block || block.block_type !== 'text') {
    notFound();
  }

  // If accessing by UUID but block has a slug, redirect to slug URL
  if (isUUID(blockId) && block.slug) {
    redirect(`/${username}/${block.slug}`);
  }

  // Get user's blocks for bio block
  const blocks = await getPublicUserBlocks(profile.id);

  // Get bio block for author info
  const bioBlock = blocks.find((b) => b.block_type === 'bio');

  return (
    <div className="container mx-auto max-w-4xl px-6 py-8">
      <div className="space-y-6">
        {/* Small bio header */}
        <SmallBioHeader profile={profile} bioBlock={bioBlock} />

        {/* Full block content */}
        <div className="w-full">
          <BlockRenderer block={block} mode="full" />
        </div>

        {/* Back to profile link */}
        <div className="border-foreground/10 border-t pt-6">
          <Link
            href={`/${profile.username}`}
            className="text-foreground/60 hover:text-foreground inline-flex items-center gap-2 text-sm hover:underline"
          >
            ← Back to {profile.display_name || profile.username}'s profile
          </Link>
        </div>
      </div>
    </div>
  );
}
