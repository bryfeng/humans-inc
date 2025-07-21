import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfileWithBlocks } from '@/features/blocks/actions';
import { BlockList, BlockCreator } from '@/features/blocks/components';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { cache } from 'react';

// Cache the profile with blocks fetch to improve performance
const getCachedProfileWithBlocks = cache(async (userId: string) => {
  return await getProfileWithBlocks(userId);
});

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile and blocks with caching
  const { profile, blocks } = await getCachedProfileWithBlocks(user.id);

  return (
    <div className="from-background via-background to-foreground/5 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-3">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
              Dashboard
            </h1>
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
          </div>
          <p className="text-foreground/70 mx-auto max-w-2xl text-base sm:text-lg">
            {profile?.username
              ? 'Manage your profile and create amazing content blocks'
              : "Welcome! Let's set up your profile to get started"}
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Top Section: Profile Header */}
          <div className="animate-fade-in">
            <ProfileHeader profile={profile} blockCount={blocks.length} />
          </div>

          {/* Middle Section: Stats and Actions Grid */}
          <div className="animate-fade-in-up grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <DashboardStats profile={profile} blockCount={blocks.length} />
            <DashboardActions />
          </div>

          {/* Content Management Section - Only show if profile is complete */}
          {profile && profile.username && (
            <div className="animate-fade-in-up space-y-6 sm:space-y-8">
              {/* Block Creator */}
              <div className="group from-background to-foreground/5 border-foreground/10 hover:border-foreground/20 rounded-xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                    <span className="text-primary text-sm font-semibold">
                      +
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    Add New Block
                  </h2>
                  <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                  </div>
                </div>
                <BlockCreator
                  userId={user?.id || ''}
                  currentBlockCount={blocks.length}
                />
              </div>

              {/* Block List */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                      <span className="text-primary text-sm font-semibold">
                        {blocks.length}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      Your Content Blocks
                    </h2>
                  </div>
                  {blocks.length > 0 && (
                    <div className="text-foreground/60 hidden items-center gap-2 text-sm sm:flex">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>{blocks.length} active</span>
                    </div>
                  )}
                </div>

                {blocks.length > 0 ? (
                  <div className="animate-fade-in-up">
                    <BlockList blocks={blocks} />
                  </div>
                ) : (
                  <div className="group border-foreground/10 text-foreground/60 hover:text-foreground/80 hover:border-foreground/20 hover:bg-foreground/5 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12">
                    <div className="space-y-4">
                      <div className="bg-foreground/10 group-hover:bg-foreground/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-colors">
                        <span className="text-2xl">📝</span>
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">
                          No blocks yet
                        </h3>
                        <p className="text-sm">
                          Create your first block above to start building your
                          profile!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Setup Prompt for Incomplete Profiles */}
          {(!profile || !profile.username) && (
            <div className="animate-fade-in-up rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center text-amber-900 sm:p-8 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-200">
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                    Complete Your Profile
                  </h3>
                  <p className="mx-auto max-w-md text-sm sm:text-base">
                    Set up your username and profile information above to start
                    creating content blocks and sharing your page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
