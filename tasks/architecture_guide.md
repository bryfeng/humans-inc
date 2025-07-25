# Architecture & Development Guide for humans.inc

> **Purpose**: Comprehensive guide for coding agents to understand the codebase architecture, patterns, and avoid common mistakes when working on humans.inc.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Principles](#architecture-principles)
3. [Directory Structure & Boundaries](#directory-structure--boundaries)
4. [Core Domain Models](#core-domain-models)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Component Architecture](#component-architecture)
7. [Database Schema & Relationships](#database-schema--relationships)
8. [Authentication & Authorization](#authentication--authorization)
9. [Common Patterns & Best Practices](#common-patterns--best-practices)
10. [Boundary Rules & Import Restrictions](#boundary-rules--import-restrictions)
11. [Testing Strategy](#testing-strategy)
12. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Project Overview

**humans.inc** is a platform for creating unified online presences through modular content blocks. Users get a single URL (`humans.inc/username`) that serves as their personal hub, combining bio, curated content, and writing in a customizable, block-based layout.

### Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Key Libraries**: @dnd-kit (drag-drop), @supabase/ssr (auth)

## Architecture Principles

### 1. Feature-Driven Architecture

The codebase follows a feature-driven structure where each domain (auth, blocks, profile) is self-contained with its own components, hooks, and logic.

### 2. Boundary Enforcement

Strict import boundaries prevent cross-feature pollution and maintain clean separation of concerns.

### 3. Server-First Approach

Server Actions handle all data mutations, with client components focused on presentation and interaction.

### 4. Type Safety First

All database operations and API calls are strictly typed with TypeScript interfaces.

## Directory Structure & Boundaries

```
src/
├── app/                    # Next.js App Router (routes only)
│   ├── [username]/         # Dynamic user profile routes
│   ├── dashboard/          # Protected dashboard routes
│   ├── login/              # Auth routes
│   └── signup/
├── components/             # Shared presentational components
│   ├── dashboard/          # Dashboard-specific shared components
│   ├── layout/             # Layout components (Header, Footer)
│   └── README.md           # Component guidelines
├── features/               # Feature domains (vertical slices)
│   ├── auth/               # Authentication feature
│   │   ├── components/     # Auth-specific components
│   │   └── lib/           # Auth actions and utilities
│   ├── blocks/            # Content blocks feature
│   │   ├── actions/       # Server actions for blocks
│   │   ├── components/    # Block components (editors, viewers)
│   │   └── types/         # Block type definitions
│   └── profile/           # User profile feature
│       ├── actions/       # Profile server actions
│       └── components/    # Profile components
├── lib/                   # Global utilities and configs
│   ├── supabase/         # Supabase client configurations
│   └── auth-actions.ts   # Global auth utilities
└── types/                # Cross-feature TypeScript types
    ├── index.ts          # General types
    └── user.ts           # User-related types
```

### Key Boundary Rules

- **Features cannot import from other features** (enforced by ESLint)
- **Components can only import from lib and types**
- **App routes coordinate between features** but don't contain business logic
- **Shared logic goes in lib**, feature-specific logic stays in features

## Core Domain Models

### 1. User & Profile

```typescript
// User identity (from Supabase Auth)
interface User {
  id: string; // UUID from auth.users
  email: string;
  email_confirmed_at?: string;
}

// Extended profile information
interface UserProfile {
  id: string; // Matches auth.users.id
  username: string; // Unique, URL-friendly identifier
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### 2. Content Blocks

```typescript
// Core block structure
interface Block {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  position: number; // Display order
  block_type: BlockType; // Type discriminator
  title?: string; // Optional block title
  content: Record<string, unknown>; // Flexible content storage
  config: Record<string, unknown>; // Display configuration
  is_published: boolean; // Draft/published state
  created_at: string;
  updated_at: string;
}

// Supported block types
type BlockType =
  | 'bio'
  | 'text'
  | 'links'
  | 'content_list'
  | 'media'
  | 'gallery';
```

### 3. Block Content Types

```typescript
// Bio block content
interface BioBlockContent {
  display_name?: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;
  links?: Array<{ label: string; url: string }>;
}

// Text block content
interface TextBlockContent {
  text: string;
  formatting?: 'plain' | 'markdown';
}

// Links block content
interface LinksBlockContent {
  items: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

// Content list block content
interface ContentListBlockContent {
  items: Array<{
    title: string;
    url?: string;
    annotation?: string;
    type?: 'article' | 'book' | 'video' | 'podcast' | 'other';
  }>;
}
```

## Data Flow Patterns

### 1. Server Action Pattern

All data mutations use Server Actions with proper error handling:

```typescript
// Example: Block creation
export async function createBlock(data: CreateBlockData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // 2. Validate ownership
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot create block for another user');
  }

  // 3. Perform operation
  const { data: result, error } = await supabase
    .from('blocks')
    .insert({
      ...data,
      is_published: data.is_published ?? false, // Default to draft
    })
    .select()
    .single();

  if (error) {
    console.error('Create block error:', error.message);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  // 4. Revalidate affected pages
  revalidatePath('/dashboard');
  return result;
}
```

### 2. Component Data Flow

```
App Route (dashboard/page.tsx)
    ↓ [coordinates features]
Feature Actions (blocks/actions/)
    ↓ [server actions]
Supabase Database
    ↓ [data]
Component Props
    ↓ [presentation]
UI Components
```

### 3. Authentication Flow

```
Middleware (middleware.ts)
    ↓ [route protection]
App Route
    ↓ [user verification]
Supabase Auth
    ↓ [session]
Protected Content
```

## Component Architecture

### 1. Block Component Pattern

Each block type follows a consistent pattern:

```typescript
// Viewer component (public display)
export function BioBlockView({ block }: { block: Block }) {
  const content = block.content as BioBlockContent;
  // Render read-only view
}

// Editor component (dashboard editing)
export function BioEditor({
  block,
  onUpdate
}: {
  block: Block;
  onUpdate: (content: BioBlockContent) => void;
}) {
  // Render editable form
}

// Renderer component (type-aware wrapper)
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.block_type) {
    case 'bio':
      return <BioBlockView block={block} />;
    case 'text':
      return <TextBlockView block={block} />;
    // ... other types
  }
}
```

### 2. Dashboard Section Pattern

Dashboard sections receive data and handlers from the parent dashboard page:

```typescript
interface DraftsSectionProps {
  blocks: Block[]; // All blocks
  draftBlocks: Block[]; // Filtered drafts
  publishedCount: number; // Computed stats
  loading: boolean; // Loading state
  onPublish: (blockId: string) => Promise<void>; // Action handlers
  onDelete: (blockId: string) => Promise<void>;
}

export function DraftsSection({
  blocks,
  draftBlocks,
  publishedCount,
  loading,
  onPublish,
  onDelete,
}: DraftsSectionProps) {
  // Section implementation
}
```

### 3. Props vs Context Decision Tree

- **Props**: For component-specific data and callbacks
- **Context**: For truly global state (theme, user session)
- **Server State**: Fetched at route level, passed down as props

## Database Schema & Relationships

### Primary Tables

```sql
-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (id)
);

-- Content blocks
CREATE TABLE public.blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  block_type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes for performance
CREATE INDEX blocks_user_position_idx ON public.blocks(user_id, position);
CREATE INDEX blocks_user_published_idx ON public.blocks(user_id, is_published, updated_at DESC);
```

### RLS (Row Level Security) Policies

```sql
-- Profiles: Public read, owner write
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Blocks: Public read published, owner full access
CREATE POLICY "Published blocks are viewable by everyone" ON public.blocks
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view own blocks" ON public.blocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blocks" ON public.blocks
  FOR ALL USING (auth.uid() = user_id);
```

## Authentication & Authorization

### 1. Route Protection Layers

```typescript
// 1. Middleware (middleware.ts) - Route-level protection
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// 2. Page-level verification
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Continue with authenticated page
}

// 3. Server Action verification
export async function createBlock(data: CreateBlockData) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated');
  }

  // Verify ownership
  if (data.user_id !== user.id) {
    throw new Error('Unauthorized');
  }

  // Proceed with operation
}
```

### 2. Public vs Private Content

- **Public Routes**: `/[username]` - Shows only published blocks
- **Private Routes**: `/dashboard/*` - Shows all content including drafts
- **Draft System**: `is_published` field controls visibility

## Common Patterns & Best Practices

### 1. Error Handling Pattern

```typescript
// Server actions
export async function someAction() {
  try {
    // Operation
    const result = await supabase.from('table').insert(data);

    if (result.error) {
      console.error('Operation error:', result.error.message);
      throw new Error(`Failed to perform operation: ${result.error.message}`);
    }

    revalidatePath('/relevant-path');
    return result.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error; // Re-throw for client handling
  }
}

// Component error handling
const handleAction = async () => {
  try {
    await someAction();
    // Success feedback
  } catch (error) {
    console.error('Action failed:', error);
    alert('Operation failed. Please try again.'); // Or better toast notification
  }
};
```

### 2. Loading State Management

```typescript
// Dashboard page pattern
const [loading, setLoading] = useState(true);
const [draftsLoading, setDraftsLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    try {
      // Load core data
      const [profile, blocks] = await Promise.all([
        loadProfile(),
        loadBlocks(),
      ]);
      setProfile(profile);
      setBlocks(blocks);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);
```

### 3. Form State Management

```typescript
// Block editor pattern
const [content, setContent] = useState<BlockContent>(initialContent);
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  try {
    await updateBlock({ id: block.id, content });
    // Success feedback
  } catch (error) {
    // Error handling
  } finally {
    setSaving(false);
  }
};
```

## Boundary Rules & Import Restrictions

### ✅ Allowed Imports

```typescript
// App routes can import from features
import { createBlock } from '@/features/blocks/actions';

// Features can import from lib and types
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/user';

// Components can import from lib, types, and other components
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
```

### ❌ Forbidden Imports

```typescript
// Components CANNOT import from features
import { createBlock } from '@/features/blocks/actions'; // ❌ BOUNDARY VIOLATION

// Features CANNOT import from other features
import { updateProfile } from '@/features/profile/actions'; // ❌ BOUNDARY VIOLATION
```

### Solution Patterns

When you need cross-feature functionality:

1. **Move shared logic to `/lib`**
2. **Coordinate in app routes**
3. **Pass handlers as props to components**

```typescript
// ✅ Correct: App route coordinates features
export default function DashboardPage() {
  const handlePublish = async (blockId: string) => {
    await publishBlock(blockId);        // blocks feature
    await updateProfile({ ... });      // profile feature (if needed)
  };

  return (
    <DraftsSection
      onPublish={handlePublish}
      // ... other props
    />
  );
}
```

## Testing Strategy

### 1. Component Testing

```typescript
// Basic render test for each component
import { render, screen } from '@testing-library/react';
import { BioBlockView } from './BioBlockView';

test('renders bio block with content', () => {
  const mockBlock = {
    id: '1',
    block_type: 'bio',
    content: {
      display_name: 'John Doe',
      tagline: 'Developer'
    }
  };

  render(<BioBlockView block={mockBlock} />);

  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Developer')).toBeInTheDocument();
});
```

### 2. Server Action Testing

```typescript
// Test server actions with mock Supabase client
import { createBlock } from './actions';
import { mockSupabaseClient } from '@/__tests__/mocks/supabase';

test('createBlock creates block successfully', async () => {
  const mockData = {
    user_id: 'user-1',
    block_type: 'text',
    content: { text: 'Hello world' },
  };

  mockSupabaseClient.from.mockReturnValue({
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: { id: 'block-1', ...mockData },
        error: null,
      }),
    }),
  });

  const result = await createBlock(mockData);
  expect(result.id).toBe('block-1');
});
```

## Troubleshooting Common Issues

### 1. Boundary Violation Errors

**Error**: `No rule allowing this dependency was found. File is of type 'components'. Dependency is of type 'features'`

**Solution**: Move the feature import to the app route level and pass data/handlers as props.

### 2. Authentication Issues

**Error**: User not authenticated in server actions

**Solution**:

1. Check middleware is protecting the route
2. Ensure `createClient()` is using the correct client type (server vs client)
3. Verify the user session is valid

### 3. Database Permission Errors

**Error**: RLS policy violation

**Solution**:

1. Check RLS policies allow the operation
2. Verify user ownership of resources
3. Ensure `auth.uid()` matches the user making the request

### 4. Type Errors with Block Content

**Error**: Property doesn't exist on `Record<string, unknown>`

**Solution**: Type cast the content to the specific block content type:

```typescript
const content = block.content as BioBlockContent;
```

### 5. Draft/Published Confusion

**Issue**: Drafts appearing on public pages

**Solution**: Ensure queries filter by `is_published = true` for public views:

```typescript
// Public view - only published
const { data } = await supabase
  .from('blocks')
  .select('*')
  .eq('user_id', userId)
  .eq('is_published', true); // Important!

// Dashboard view - include drafts
const { data } = await supabase
  .from('blocks')
  .select('*')
  .eq('user_id', userId);
```

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript checking
npm run lint         # ESLint checking

# Database
npx supabase gen types typescript --project-id=<id> --schema=public > types/supabase.ts
```

### Key File Locations

- **Route handlers**: `src/app/**/page.tsx`
- **Server actions**: `src/features/*/actions/`
- **Component definitions**: `src/features/*/components/`
- **Type definitions**: `src/features/*/types/`
- **Shared utilities**: `src/lib/`

## Phase 8: Enhanced Content Creation Architecture

### Content Creation Components (January 2025)

Phase 8 introduced a comprehensive content creation system that replaced placeholder messages with a fully functional hybrid dashboard interface:

#### New Components

1. **BlockTypeSelectorOverlay** (`src/features/blocks/components/BlockTypeSelectorOverlay.tsx`)

   - Space-efficient overlay for block type selection
   - Recently used block types with star indicators
   - Educational block type cards with features and descriptions
   - Smooth animations and responsive design
   - Click-outside-to-close and ESC key support

2. **SmartPublishControls** (`src/features/blocks/components/SmartPublishControls.tsx`)

   - Toggle between hidden/published states with visual feedback
   - Dynamic button text: "Save" vs "Save & Publish"
   - Visual status indicators (green dot for published, gray for hidden)
   - Integrated save/publish functionality with loading states

3. **SaveFeedback & BlockStatusIndicator** (same file as SmartPublishControls)
   - Success/error feedback messages with dismiss functionality
   - Real-time status indicators showing published state and last saved time
   - Time-ago formatting for user-friendly timestamps

#### Enhanced CreateSection Architecture

The `CreateSection.tsx` component was completely redesigned with a hybrid split-panel approach:

```typescript
// Split-panel layout structure
<div className="split-panel-interface">
  {!selectedBlockType ? (
    // Initial state: Block type selection
    <BlockTypeSelectionView />
  ) : (
    <div className="split-panels">
      {/* Left Panel: Tools & Controls */}
      <div className="left-panel">
        <BlockMetadata />
        <SmartPublishControls />
        <CreationTips />
      </div>

      {/* Right Panel: Live Editor */}
      <div className="right-panel">
        <LiveEditor blockType={selectedBlockType} />
      </div>
    </div>
  )}
</div>
```

#### Enhanced Block Actions

New server actions added to support the creation workflow:

1. **createAndPublishBlock()** - Creates block and immediately publishes with automatic positioning
2. **createAndSaveBlock()** - Creates block as draft (hidden)
3. **toggleBlockVisibility()** - Switches between published/hidden states
4. **autoSaveBlock()** - Foundation for future Gmail-style auto-save (silent fail implementation)
5. **publishBlock()/unpublishBlock()** - Individual publish/unpublish functions
6. **Enhanced error handling** - All functions include proper authentication, ownership validation, and error reporting

#### Current Implementation Status (January 2025)

**✅ Fully Implemented Components:**

- `BlockTypeSelectorOverlay.tsx` - 180+ lines with educational cards and recently used tracking
- `SmartPublishControls.tsx` - Complete with SaveFeedback and BlockStatusIndicator
- `CreateSection.tsx` - 400+ lines split-panel implementation with state management
- Enhanced block actions with 20+ server functions supporting full workflow

**✅ Key Features Delivered:**

- LocalStorage persistence for recently used block types
- Keyboard shortcuts (ESC key) for overlay management
- Auto-refresh after successful block creation
- Real-time visual feedback with success/error states
- Mobile-responsive design with panel stacking
- Type-safe content handling with proper casting

#### User Experience Flow

```
1. User clicks "Create Block +" button
2. BlockTypeSelectorOverlay opens with educational cards
3. User selects block type (saved to recently used)
4. Split-panel interface loads with:
   - Left: Publishing controls, tips, metadata
   - Right: Live editor for selected block type
5. User edits content with real-time feedback
6. SmartPublishControls toggle hidden/published state
7. Save button text adapts: "Save" or "Save & Publish"
8. Block saves with immediate positioning and feedback
9. Success message shows, interface resets after 2s
```

#### Technical Implementation Details

**State Management Pattern**:

```typescript
// CreateSection state structure
const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(
  null
);
const [blockContent, setBlockContent] = useState<Record<string, unknown>>({});
const [isPublished, setIsPublished] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<SaveStatus>({
  type: null,
  message: '',
});
const [recentlyUsed, setRecentlyUsed] = useState<BlockType[]>([]);
```

**LocalStorage Integration**:

- Recently used block types persist across sessions
- Keyboard shortcuts (ESC) for overlay management
- Auto-refresh after successful block creation

**Type Safety Enhancements**:

- Proper type casting for block content: `blockContent as BioBlockContent`
- Const assertions for config: `'medium' as const`
- Strict TypeScript interfaces for all new components

#### Responsive Design Strategy

- **Desktop**: Side-by-side split panels with fixed left panel width
- **Mobile**: Stacked panels with full-width layout
- **Overlay**: Responsive grid that adapts to screen size
- **Touch Support**: Proper touch targets and gesture handling

### Architecture Decision Log

- **2024-12**: Chose feature-driven architecture over layer-based
- **2024-12**: Implemented strict boundary enforcement to prevent coupling
- **2024-12**: Adopted Server Actions over API routes for simplicity
- **2024-12**: Used JSONB for flexible block content vs rigid schemas
- **2025-01**: Implemented hybrid split-panel creation interface (Phase 8)
- **2025-01**: Added overlay-based block type selection for space efficiency
- **2025-01**: Introduced smart publishing workflow with toggle controls
- **2025-01**: Built foundation for future Gmail-style auto-save functionality

---

This guide should be updated as the architecture evolves. When making significant changes, document the decisions and update relevant sections.
