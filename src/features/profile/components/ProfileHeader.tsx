'use client';

import { useState } from 'react';
import { ProfileForm } from './ProfileForm';
import type { UserProfile } from '@/types/user';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  blockCount: number;
}

export function ProfileHeader({ profile, blockCount }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const completionPercentage = calculateProfileCompletion(profile);

  const handleProfileUpdateSuccess = () => {
    setIsEditing(false);
  };

  return (
    <div
      className="bg-background border-foreground/10 rounded-lg border p-6"
      data-tour="profile-header"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">
                {profile?.display_name || 'Welcome!'}
              </h2>
              {profile?.username && (
                <p className="text-foreground/60 text-sm">
                  @{profile.username}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-foreground/10 text-foreground/80 hover:bg-foreground/20 rounded-md px-3 py-1 text-sm transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="mb-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-foreground/60 text-sm">Blocks:</span>
              <span className="font-medium">{blockCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground/60 text-sm">Profile:</span>
              <div className="flex items-center gap-2">
                <div className="bg-foreground/10 h-2 w-16 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>

          {!profile?.username && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <p className="text-sm">
                <strong>Complete your profile</strong> to start creating content
                blocks and sharing your page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Profile Form */}
      {isEditing && (
        <div className="animate-fade-in-up border-foreground/10 mt-6 overflow-hidden border-t pt-6">
          <div className="animate-scale-in">
            <ProfileForm
              profile={profile}
              onSuccess={handleProfileUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function calculateProfileCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  let completed = 0;
  const total = 3;

  if (profile.username) completed++;
  if (profile.display_name) completed++;
  if (profile.short_bio) completed++;

  return Math.round((completed / total) * 100);
}
