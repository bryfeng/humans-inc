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
} from '@/components/dashboard/sections';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import {
  getDraftBlocks,
  getPublishedBlocks,
  publishBlock,
  deleteBlock,
  createAndPublishBlock,
  createAndSaveBlock,
} from '@/features/blocks/actions';
import {
  BlockTypeSelectorOverlay,
  CreateBlockButton,
} from '@/features/blocks/components/BlockTypeSelectorOverlay';
import {
  SmartPublishControls,
  SaveFeedback,
  BlockStatusIndicator,
} from '@/features/blocks/components/SmartPublishControls';
import {
  BioEditor,
  TextEditor,
  LinksEditor,
  ContentListEditor,
} from '@/features/blocks/components';
import type {
  BlockType,
  BioBlockContent,
  TextBlockContent,
  LinksBlockContent,
  ContentListBlockContent,
} from '@/features/blocks/types';
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
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Inline CreateSection component to avoid boundary violations
function CreateSectionComponent({
  userId,
  profile,
  currentBlockCount,
}: {
  userId: string;
  profile: UserProfile | null;
  currentBlockCount: number;
}) {
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(
    null
  );
  const [blockContent, setBlockContent] = useState<Record<string, unknown>>({});
  const [blockTitle, setBlockTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [recentlyUsed, setRecentlyUsed] = useState<BlockType[]>([]);
  const router = useRouter();

  if (!profile || !profile.username) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Create Content</h1>
          <p className="text-foreground/60">
            Complete your profile setup to start creating content blocks
          </p>
        </div>
        <div className="bg-background border-foreground/10 rounded-lg border p-8 text-center">
          <div className="mb-4 text-4xl">🚀</div>
          <h3 className="mb-2 font-semibold">Complete Your Profile First</h3>
          <p className="text-foreground/60 mb-4 text-sm">
            Set up your username and basic profile information before creating
            content blocks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Create Content</h1>
        <p className="text-foreground/60">
          Create and publish new blocks with the rich text editor
        </p>
      </div>

      <div className="bg-background border-foreground/10 rounded-lg border p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Create New Block</h2>
            <p className="text-foreground/60 text-sm">
              Choose a block type to get started
            </p>
          </div>
          <CreateBlockButton
            onClick={() => setShowBlockSelector(true)}
            disabled={isSaving}
          />
        </div>
      </div>

      <BlockTypeSelectorOverlay
        isOpen={showBlockSelector}
        onClose={() => setShowBlockSelector(false)}
        onSelectType={() => {}} // Simplified for now
        recentlyUsed={recentlyUsed}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] =
    useState<DashboardSection>('preview');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draftBlocks, setDraftBlocks] = useState<Block[]>([]);
  const [publishedBlocks, setPublishedBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(true);
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

      // Load draft and published blocks separately
      try {
        const [drafts, published] = await Promise.all([
          getDraftBlocks(authUser.id),
          getPublishedBlocks(authUser.id),
        ]);
        setDraftBlocks(drafts);
        setPublishedBlocks(published);
      } catch (error) {
        console.error('Error loading draft/published blocks:', error);
      } finally {
        setDraftsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handlePublish = async (blockId: string) => {
    if (!user) return;

    await publishBlock(blockId);

    // Refresh data
    const [drafts, published] = await Promise.all([
      getDraftBlocks(user.id),
      getPublishedBlocks(user.id),
    ]);
    setDraftBlocks(drafts);
    setPublishedBlocks(published);
  };

  const handleDelete = async (blockId: string) => {
    if (!user) return;

    await deleteBlock(blockId);

    // Refresh drafts
    const drafts = await getDraftBlocks(user.id);
    setDraftBlocks(drafts);
  };

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
        return (
          <PagePreviewSection
            profile={profile}
            blocks={blocks}
            publishedBlocks={publishedBlocks}
            draftBlocks={draftBlocks}
            loading={draftsLoading}
          />
        );
      case 'inbox':
        return <InboxSection />;
      case 'drafts':
        return (
          <DraftsSection
            blocks={blocks}
            draftBlocks={draftBlocks}
            publishedCount={publishedBlocks.length}
            loading={draftsLoading}
            onPublish={handlePublish}
            onDelete={handleDelete}
          />
        );
      case 'create':
        return (
          <CreateSectionComponent
            userId={user?.id || ''}
            profile={profile}
            currentBlockCount={blocks.length}
          />
        );
      default:
        return (
          <PagePreviewSection
            profile={profile}
            blocks={blocks}
            publishedBlocks={publishedBlocks}
            draftBlocks={draftBlocks}
            loading={draftsLoading}
          />
        );
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
