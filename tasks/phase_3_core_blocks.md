# Phase 3: Core "Block" Components - Creator View

> **Note**: Follow [code_guidelines.md](./code_guidelines.md) for all implementation work.

This phase focuses on building the core components for the creator's editing experience. This includes defining the data models for content "blocks," creating a dashboard for creators to manage their page, and implementing the editable versions of the initial block types.

## Tickets

### 3.1 "Block" Data Model in Supabase

- **Description**: Define the database schema for the `blocks` table, which will store the content and configuration for each block on a user's page. Uses a flexible, Notion-like approach where blocks can contain various types of content without rigid categorization.

- **Design Philosophy**: 
  - Flexible content storage using JSONB for maximum adaptability
  - Text-based `block_type` instead of rigid enums to allow future expansion
  - Support for user-curated content like writings, recommendations, affiliate items, galleries, etc.
  - Block positioning system for drag-and-drop reordering

- **Schema**:
  ```sql
  CREATE TABLE public.blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    block_type TEXT NOT NULL, -- 'bio', 'text', 'media', 'links', 'content_list', etc.
    title TEXT, -- Optional block title/heading
    content JSONB NOT NULL DEFAULT '{}', -- Flexible content storage
    config JSONB NOT NULL DEFAULT '{}', -- Size, styling, display options
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Efficient ordering and user queries
  CREATE INDEX blocks_user_position_idx ON public.blocks(user_id, position);
  CREATE INDEX blocks_user_created_idx ON public.blocks(user_id, created_at DESC);
  ```

- **Content Examples**:
  - **Bio Block**: `{"display_name": "Jane Doe", "tagline": "Writer & Thinker", "bio": "...", "avatar_url": "...", "links": [{"label": "Twitter", "url": "..."}]}`
  - **Curated Content**: `{"items": [{"title": "Amazing Article", "url": "...", "annotation": "This changed my perspective...", "type": "article"}]}`
  - **Simple Text**: `{"text": "Here's my latest thinking on...", "formatting": "markdown"}`

- **Tasks**:
  - [x] Create the `blocks` table in Supabase with the flexible schema above.
  - [x] Create composite index on (`user_id`, `position`) for efficient ordering queries.
  - [x] Create index on (`user_id`, `created_at DESC`) for chronological queries.
  - [x] Enable Row Level Security (RLS) on the `blocks` table.
  - [x] Create RLS policies for block access control.

- **Status**: Done

- **Acceptance Criteria**:
  - The `blocks` table is created in Supabase with the flexible schema.
  - The `user_id` field has a foreign key relationship to `public.profiles.id` with CASCADE delete.
  - The `position` column allows for correct ordering of blocks for each user.
  - The `block_type` field uses TEXT to allow future expansion without schema changes.
  - JSONB fields (`content`, `config`) support flexible, structured data storage.
  - Appropriate indexes are created for efficient queries.
  - RLS is enabled with proper access control policies.

### 3.2 Creator Dashboard & Block Management

- **Description**: Create a protected dashboard page where logged-in users can manage the blocks on their profile. Uses Next.js 15 App Router patterns and follows existing feature-based architecture.

- **Tasks**:
  - [x] Create blocks feature domain structure (`/src/features/blocks/`).
  - [x] Create TypeScript types for blocks (`/src/features/blocks/types/`).
  - [x] Implement server actions for block CRUD operations.
  - [x] Add and configure `@dnd-kit` dependencies for drag-and-drop.
  - [x] Create protected route `/src/app/dashboard/edit-profile/page.tsx`.
  - [x] Build `BlockList` component for displaying user's blocks.
  - [x] Build `BlockEditor` component for editing individual blocks.
  - [x] Build `BlockCreator` component for adding new blocks.
  - [x] Build `BlockItem` component for individual block display/interaction.
  - [x] Integrate block management UI into dashboard route.
  - [x] Test authentication protection and block CRUD flows.

- **Status**: Done

- **Acceptance Criteria**:
  - Only authenticated users can access the dashboard page.
  - Users can see a list of their current blocks in order.
  - Users can successfully reorder blocks via drag-and-drop interface.
  - Changes to block order are saved correctly in the database.
  - Users can add new blocks of different types.
  - Users can edit existing block content.
  - Users can remove existing blocks.
  - All operations follow Next.js 15 patterns and server actions.
  - Components follow existing feature-based architecture.

### 3.3 Bio Block - Creator View

- **Description**: Build the component that allows a creator to edit the content of their Bio block.
- **Tasks**:
  - [x] Create a form or inline-editing component for the Bio block's content (display name, tagline, profile picture, key links).
  - [x] Implement profile picture upload functionality using Supabase Storage.
  - [x] Ensure that changes are saved to the corresponding 'bio' type block in the `blocks` table.
- **Status**: Done
- **Acceptance Criteria**:
  - [x] The creator can edit their display name and tagline.
  - [x] The creator can upload or change their profile picture.
  - [x] The creator can add, edit, and remove key personal links.
  - [x] All edits are correctly saved to the `content` or `config` JSONB field of the appropriate block in the database.

### 3.4 Additional Block Types - Creator View

- **Description**: Implement creator editing interfaces for additional block types beyond the bio block.
- **Tasks**:
  - [x] Create Text Block editor for simple text content with optional markdown formatting.
  - [x] Create Links Block editor for curated list of external links.
  - [x] Create Content List Block editor for curated content with annotations.
  - [x] Integrate all block type editors into the main BlockEditor component.
- **Status**: Done
- **Acceptance Criteria**:
  - [x] Creators can edit text blocks with plain text or markdown formatting.
  - [x] Creators can add/edit/remove items in links blocks.
  - [x] Creators can add/edit/remove curated content items with annotations and types.
  - [x] All block editors are accessible through the unified BlockEditor interface.

## Phase 3 Summary

**Status**: ✅ **COMPLETED**

All major components for the creator editing experience have been implemented:

- ✅ Flexible block data model with JSONB content storage
- ✅ Complete dashboard with drag-and-drop block management  
- ✅ Comprehensive block editor supporting multiple block types
- ✅ Bio block editor with profile picture upload
- ✅ Text, Links, and Content List block editors
- ✅ Server actions for all CRUD operations
- ✅ Authentication protection and user ownership validation
- ✅ Row Level Security policies
