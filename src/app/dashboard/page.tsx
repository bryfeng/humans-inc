'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DashboardSidebar,
  type DashboardSection,
} from '@/components/dashboard/DashboardSidebar';
import {
  PagePreviewSection,
  InboxSection,
  DraftsSection,
  CreateSection,
} from '@/components/dashboard/sections';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import type { UserProfile } from '@/types/user';

// Define local Block type to avoid boundary violation
interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] =
    useState<DashboardSection>('preview');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      // Fetch profile and blocks
      const [profileResult, blocksResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase
          .from('blocks')
          .select('*')
          .eq('user_id', authUser.id)
          .order('position', { ascending: true }),
      ]);

      setProfile(profileResult.data || null);
      setBlocks(blocksResult.data || []);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="from-background via-background to-foreground/5 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-center">
          <div className="bg-primary mx-auto mb-4 h-8 w-8 animate-pulse rounded-full"></div>
          <p className="text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'preview':
        return <PagePreviewSection profile={profile} blocks={blocks} />;
      case 'inbox':
        return <InboxSection />;
      case 'drafts':
        return <DraftsSection blocks={blocks} />;
      case 'create':
        return (
          <CreateSection
            userId={user?.id || ''}
            profile={profile}
            currentBlockCount={blocks.length}
          />
        );
      default:
        return <PagePreviewSection profile={profile} blocks={blocks} />;
    }
  };

  return (
    <div className="from-background via-background to-foreground/5 min-h-screen bg-gradient-to-br">
      <div className="flex h-screen">
        {/* Sidebar */}
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Profile Header - Always visible at top */}
            <div className="mb-8">
              <ProfileHeader profile={profile} blockCount={blocks.length} />
            </div>

            {/* Section Content */}
            <div className="max-w-6xl">{renderActiveSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
