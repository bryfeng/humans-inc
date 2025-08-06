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
  ManageBlocksSection,
  CollectionsSection,
} from '@/components/dashboard/sections';
import { WriteSection } from './WriteSection';
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
import { BioBlockCreationOverlay } from '@/features/blocks/components/BioBlockCreationOverlay';
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
import type { Collection } from '@/types';
import { updateBlockLayout } from '@/features/blocks/actions';
import {
  getUserCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  moveBlockToCollection,
  getBlocksByCollection,
} from '@/features/collections/actions';
import {
  OnboardingProvider,
  WelcomeModal,
  OnboardingProgress,
  DashboardTour,
} from '@/features/onboarding/components';
import {
  markTourAsSeen,
  markBioAsCreated,
} from '@/features/onboarding/actions/onboarding-actions';

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
  draftBlocks,
  publishedBlocks,
  onDataRefresh,
}: {
  userId: string;
  profile: UserProfile | null;
  currentBlockCount: number;
  draftBlocks: Block[];
  publishedBlocks: Block[];
  onDataRefresh: () => void;
}) {
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [showBioCreator, setShowBioCreator] = useState(false);
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

  const handleBlockTypeSelect = (blockType: BlockType) => {
    setShowBlockSelector(false);

    if (blockType === 'bio') {
      setShowBioCreator(true);
    } else {
      // Route to dedicated creation pages for other block types
      router.push(`/dashboard/create/${blockType.replace('_', '-')}`);
    }
  };

  const handleBioCreationSuccess = async () => {
    onDataRefresh();
  };

  const handleBioCreated = async (userId: string) => {
    // Mark bio as created in onboarding
    await markBioAsCreated(userId);
  };

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
        onSelectType={handleBlockTypeSelect}
        recentlyUsed={recentlyUsed}
        existingBlocks={[...draftBlocks, ...publishedBlocks]}
      />

      <BioBlockCreationOverlay
        isOpen={showBioCreator}
        onClose={() => setShowBioCreator(false)}
        onSuccess={handleBioCreationSuccess}
        onBioCreated={handleBioCreated}
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [draftBlocks, setDraftBlocks] = useState<Block[]>([]);
  const [publishedBlocks, setPublishedBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(true);

  // Onboarding state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDashboardTour, setShowDashboardTour] = useState(false);

  const router = useRouter();

  // Onboarding handlers
  const handleStartWelcome = () => setShowWelcomeModal(true);
  const handleStartBioCreation = () => {
    setShowWelcomeModal(false);
    // Switch to write section to enable bio creation overlay
    setActiveSection('write');
  };
  const handleStartTour = () => setShowDashboardTour(true);
  const handleTourComplete = async () => {
    setShowDashboardTour(false);
    if (user) {
      await markTourAsSeen(user.id);
    }
  };

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

      // Fetch profile, blocks, and collections
      const [profileResult, blocksResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase
          .from('blocks')
          .select('*, is_visible, display_order, collection_id')
          .eq('user_id', authUser.id)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('position', { ascending: true }),
      ]);

      setProfile(profileResult.data || null);
      setBlocks(blocksResult.data || []);

      // Fetch collections
      try {
        const collectionsData = await getUserCollections(authUser.id);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error loading collections:', error);
        setCollections([]);
      }

      setLoading(false);

      // Load draft and published blocks separately
      try {
        const [drafts, published] = await Promise.all([
          getDraftBlocks(authUser.id),
          getPublishedBlocks(authUser.id),
        ]);
        setDraftBlocks(drafts);
        setPublishedBlocks(published);

        // Check if we should show onboarding for new users
        const totalBlocks = [...drafts, ...published];
        if (totalBlocks.length === 0) {
          // Only show welcome modal if user hasn't seen it yet
          // We need to check onboarding state first
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('onboarding_state')
                .eq('id', authUser.id)
                .single();

              console.log('Onboarding check:', {
                profileData,
                error,
                totalBlocksCount: totalBlocks.length,
                onboardingState: profileData?.onboarding_state,
                hasSeenWelcome: profileData?.onboarding_state?.has_seen_welcome,
              });

              // Show modal only if onboarding_state doesn't exist OR has_seen_welcome is false
              const onboardingState = profileData?.onboarding_state;
              const hasSeenWelcome = onboardingState?.has_seen_welcome === true;

              if (!hasSeenWelcome) {
                console.log(
                  'Showing welcome modal because has_seen_welcome is not true'
                );
                setShowWelcomeModal(true);
              } else {
                console.log('Not showing welcome modal - already seen');
              }
            } catch (err) {
              console.log('Onboarding check error, showing modal:', err);
              setShowWelcomeModal(true);
            }
          }, 1000);
        }
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

  // Collection management functions
  const handleCreateCollection = async (name: string, description?: string) => {
    if (!user) return;

    try {
      await createCollection({
        user_id: user.id,
        name,
        description,
        is_public: false,
      });

      // Refresh collections
      const collectionsData = await getUserCollections(user.id);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };

  const handleUpdateCollection = async (
    id: string,
    name: string,
    description?: string,
    isPublic?: boolean
  ) => {
    try {
      await updateCollection({
        id,
        name,
        description,
        is_public: isPublic,
      });

      // Refresh collections
      const collectionsData = await getUserCollections(user?.id || '');
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await deleteCollection(id);

      // Refresh collections and blocks
      if (user) {
        const [collectionsData, blocksResult] = await Promise.all([
          getUserCollections(user.id),
          createClient()
            .from('blocks')
            .select('*, is_visible, display_order, collection_id')
            .eq('user_id', user.id)
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('position', { ascending: true }),
        ]);
        setCollections(collectionsData);
        setBlocks(blocksResult.data || []);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  };

  const handleMoveToCollection = async (
    blockId: string,
    collectionId: string | null
  ) => {
    try {
      await moveBlockToCollection(blockId, collectionId);

      // Refresh blocks
      if (user) {
        const blocksResult = await createClient()
          .from('blocks')
          .select('*, is_visible, display_order, collection_id')
          .eq('user_id', user.id)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('position', { ascending: true });
        setBlocks(blocksResult.data || []);
      }
    } catch (error) {
      console.error('Error moving block to collection:', error);
      throw error;
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlock(blockId);

      // Refresh blocks and drafts
      if (user) {
        const [blocksResult, drafts] = await Promise.all([
          createClient()
            .from('blocks')
            .select('*, is_visible, display_order, collection_id')
            .eq('user_id', user.id)
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('position', { ascending: true }),
          getDraftBlocks(user.id),
        ]);
        setBlocks(blocksResult.data || []);
        setDraftBlocks(drafts);
      }
    } catch (error) {
      console.error('Error deleting block:', error);
      throw error;
    }
  };

  const handlePublishBlock = async (blockId: string) => {
    try {
      await publishBlock(blockId);

      // Refresh blocks and drafts
      if (user) {
        const [blocksResult, drafts, published] = await Promise.all([
          createClient()
            .from('blocks')
            .select('*, is_visible, display_order, collection_id')
            .eq('user_id', user.id)
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('position', { ascending: true }),
          getDraftBlocks(user.id),
          getPublishedBlocks(user.id),
        ]);
        setBlocks(blocksResult.data || []);
        setDraftBlocks(drafts);
        setPublishedBlocks(published);
      }
    } catch (error) {
      console.error('Error publishing block:', error);
      throw error;
    }
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
            loading={loading}
            onSaveLayout={updateBlockLayout}
          />
        );
      case 'inbox':
        return <InboxSection />;
      case 'write':
        return (
          <WriteSection
            userId={user?.id || ''}
            profile={profile}
            blocks={blocks}
            draftBlocks={draftBlocks}
            publishedBlocks={publishedBlocks}
            publishedCount={publishedBlocks.length}
            loading={draftsLoading}
            onPublish={handlePublish}
            onDelete={handleDelete}
            onDataRefresh={async () => {
              if (user) {
                try {
                  const [drafts, published, blocksResult] = await Promise.all([
                    getDraftBlocks(user.id),
                    getPublishedBlocks(user.id),
                    createClient()
                      .from('blocks')
                      .select('*, is_visible, display_order, collection_id')
                      .eq('user_id', user.id)
                      .order('display_order', {
                        ascending: true,
                        nullsFirst: false,
                      })
                      .order('position', { ascending: true }),
                  ]);
                  setDraftBlocks(drafts);
                  setPublishedBlocks(published);
                  setBlocks(blocksResult.data || []);
                } catch (error) {
                  console.error('Error refreshing data:', error);
                }
              }
            }}
          />
        );
      case 'manage':
        return (
          <ManageBlocksSection
            profile={profile}
            blocks={blocks}
            collections={collections}
            loading={loading}
            onMoveToCollection={handleMoveToCollection}
            onDeleteBlock={handleDeleteBlock}
            onPublishBlock={handlePublishBlock}
            onSwitchToCreate={() => setActiveSection('write')}
          />
        );
      case 'collections':
        return (
          <CollectionsSection
            profile={profile}
            collections={collections}
            blocks={blocks}
            loading={loading}
            onCreateCollection={handleCreateCollection}
            onUpdateCollection={handleUpdateCollection}
            onDeleteCollection={handleDeleteCollection}
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
            onSaveLayout={updateBlockLayout}
          />
        );
    }
  };

  if (!user) return null;

  return (
    <OnboardingProvider userId={user.id}>
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
              {/* Onboarding Progress */}
              <OnboardingProgress
                onStartWelcome={handleStartWelcome}
                onStartBioCreation={handleStartBioCreation}
                onStartTour={handleStartTour}
              />

              {/* Profile Header - Always visible at top */}
              <div className="mb-8">
                <ProfileHeader profile={profile} blockCount={blocks.length} />
              </div>

              {/* Section Content */}
              <div className="max-w-6xl">{renderActiveSection()}</div>
            </div>
          </div>
        </div>

        {/* Onboarding Modals */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onStartBioCreation={handleStartBioCreation}
          userId={user.id}
        />

        <DashboardTour
          isActive={showDashboardTour}
          onComplete={handleTourComplete}
          onSkip={handleTourComplete}
        />
      </div>
    </OnboardingProvider>
  );
}
