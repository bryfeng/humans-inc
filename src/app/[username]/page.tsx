import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Generate static paths for existing user profiles
export async function generateStaticParams() {
  // Use service client for build-time operations (no cookies needed)
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles } = await supabase.from('profiles').select('username');

  if (!profiles) {
    return [];
  }

  return profiles.map((profile) => ({
    username: profile.username,
  }));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  // If no profile is found for the username, render a 404 page
  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto h-full max-w-4xl px-6 py-12">
      <div className="w-full space-y-8">
        <div className="flex items-center space-x-4">
          {/* Placeholder for an avatar */}
          <div className="bg-foreground/10 h-24 w-24 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold">
              {profile.display_name || 'No display name'}
            </h1>
            <p className="text-foreground/80 text-lg">@{profile.username}</p>
          </div>
        </div>

        <div className="border-foreground/10 mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold">Content Placeholder</h2>
          <p className="text-foreground/80 mt-2">
            Future content blocks and user-generated content will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
