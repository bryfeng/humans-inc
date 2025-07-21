'use client';

import Link from 'next/link';
import type { UserProfile } from '@/types/user';

interface DashboardStatsProps {
  profile: UserProfile | null;
  blockCount: number;
}

export function DashboardStats({ profile, blockCount }: DashboardStatsProps) {
  return (
    <div className="bg-background border-foreground/10 rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Quick Stats</h3>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-primary text-2xl font-bold">{blockCount}</div>
          <div className="text-foreground/60 text-sm">Content Blocks</div>
        </div>
        <div className="text-center">
          <div className="text-primary text-2xl font-bold">
            {profile?.username ? '✓' : '—'}
          </div>
          <div className="text-foreground/60 text-sm">Profile Setup</div>
        </div>
      </div>

      {profile?.username && (
        <div className="space-y-3">
          <Link
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <span>View Public Profile</span>
            <span className="text-xs">↗</span>
          </Link>

          <div className="bg-foreground/5 rounded-md p-3">
            <div className="text-foreground/60 mb-1 text-xs">Your URL</div>
            <div className="font-mono text-sm break-all">
              humans.inc/{profile.username}
            </div>
          </div>
        </div>
      )}

      {!profile?.username && (
        <div className="text-center">
          <p className="text-foreground/60 mb-3 text-sm">
            Complete your profile to get your public URL
          </p>
          <div className="bg-foreground/5 text-foreground/40 rounded-md p-3">
            <div className="font-mono text-sm">humans.inc/your-username</div>
          </div>
        </div>
      )}
    </div>
  );
}
