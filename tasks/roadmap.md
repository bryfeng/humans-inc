Project Summary & Core Concepts
This document outlines the plan for building humans.inc, a platform designed to provide users with a unified and beautiful online presence. The long-term vision is to build a repository for human consciousness, starting with a platform that elegantly combines a personal bio, curated content, and a blogging/newsletter engine.

The core of the project is the humans.inc/username page, a single, creator-controlled destination that represents an individual's curated thoughts and identity online.

Core Concepts
Unified Identity: Each user gets a single, clean URL (humans.inc/username) that acts as their personal hub, replacing the need for scattered links to blogs, bios, and social profiles.
Modular Content Blocks: The user page is built from customizable blocks that can be reordered via drag-and-drop. The V1 blocks include:
Bio Block: For a profile picture, tagline, and key personal links.
Curated Content Block: For sharing and annotating external content like YouTube videos and articles.
Writings Block: For hosting the user's original long-form content (blog posts/essays).
Creator-Centric Experience: The primary focus of V1 is on making the creation and maintenance of the page a delightful and addictive experience, inspired by the customization of Notion.
V1 Simplicity: The initial version prioritizes the creator's page editing experience and the visitor's viewing experience. Features like direct newsletter-sending capabilities are deferred to a future version.
Long-Term Vision: While V1 is a practical tool, every feature is designed with the broader goal in mind: creating a lasting, searchable, and meaningful repository of individual consciousness.

### I. List of Implementation Tasks for humans.inc V1

**Project Stack:** Next.js (React), TypeScript, Tailwind CSS, Supabase (DB & Auth), TipTap (Rich Text Editor)

### Phase 0: Project Hygiene & Tooling

- [x] **Core Repo Tooling**
  - [x] Add `.env.example` and document required environment variables.
  - [x] Configure Prettier and ESLint with strict TypeScript rules.
  - [x] Set up Husky + lint-staged pre-commit hooks.
  - [x] Add GitHub Actions workflow for lint, type-check, and tests.

### Phase 1: Project Setup & Core Structure

- [x] **Initialize Next.js Project**
  - [x] Use `npx create-next-app@latest humans-inc --typescript --tailwind --eslint`.
  - [x] Set up basic project structure: `components/`, `app/` (for routing), `lib/` or `utils/`, `styles/`.
- [x] **Integrate Supabase**
  - [x] Set up a new Supabase project.
  - [x] Install Supabase client library (`supabase-js`).
  - [x] Create Supabase client instance and manage environment variables for Supabase URL and anon key.
  - [x] Configure Supabase Storage bucket (`avatars`) with public-read policy and helper upload util.
- [x] **Basic Layout & Theme**
  - [x] Create a main layout component (`app/layout.tsx`).
  - [x] Implement a simple header and footer (e.g., "Powered by humans.inc" in footer).
  - [x] Set up global styles in `app/globals.css`.
  - [x] Implement Light/Dark mode toggle functionality (e.g., using `next-themes`) and store user preference.

### Phase 2: User Authentication & Profile Foundation

- [x] **User Authentication with Supabase Auth**
  - [x] Implement sign-up, login, and logout functionality.
  - [x] Create pages for `/login`, `/signup`.
  - [x] Protect routes/pages requiring authentication.
  - [x] Set up user sessions.
  - [x] Install and configure `@supabase/ssr` for session management.
- [x] **Basic User Profile Page (`app/[username]/page.tsx`)**
  - [x] Implement dynamic route for user profiles.
  - [x] Fetch and display basic user information.
  - [x] Initial placeholder for content blocks.
- [x] **Profiles Table in Supabase**
  - [x] Define `profiles` table linked to `auth.users`.
  - [x] Ensure `username` is unique.
- [x] **Username Constraints**
  - [x] Restrict `username` to pattern `[a-z0-9_-]{3,}` and reserve system routes.
- [x] **Supabase Row Level Security (RLS)**
  - [x] Enable RLS on `profiles` table.
  - [x] Add policies to allow owners read/write and public read.

### Phase 3: Core "Block" Components - Creator View (Editing Functionality)

- [x] **"Block" Data Model in Supabase**
  - [x] Define `blocks` table with flexible JSONB content and config fields.
  - [x] Create composite index on (`user_id`, `position`) for efficient ordering queries.
- [x] **Creator Dashboard Page (`app/dashboard/edit-profile/page.tsx`)**
  - [x] Protected route for logged-in users to manage their profile blocks.
- [x] **Drag-and-Drop Interface for Blocks**
  - [x] Use `@dnd-kit` library for drag-and-drop functionality.
  - [x] Allow creators to add, remove, and reorder blocks.
  - [x] Update `position` and block data in Supabase.
- [x] **Bio Block - Creator View**
  - [x] Component for editing bio content (display name, tagline, profile picture upload, key links).
  - [x] Saves data to the 'bio' type block in Supabase.
- [x] **Additional Block Types - Creator View**
  - [x] Text Block editor for simple content with markdown support.
  - [x] Links Block editor for curated list of external links.
  - [x] Content List Block editor for curated items with annotations.
- [ ] **Individual Post/Article Creation & Management** _(Deferred to Phase 4)_
  - [ ] Define `posts` table (e.g., `id`, `user_id` (FK), `title`, `slug`, `excerpt`, `reading_time`, `content` (rich text JSON), `created_at`, `updated_at`, `is_published`).
  - [ ] Add unique constraint on (`user_id`, `slug`) and index on `created_at`.
  - [ ] Dedicated page/modal for writing/editing posts (e.g., `app/dashboard/posts/new`).
  - [ ] Integrate TipTap rich text editor.
  - [ ] Save post content to the `posts` table.

### Phase 4: Visitor View - Displaying User Pages ✅

- [x] **Bio Block - Visitor View**
  - [x] Component to display formatted bio content.
- [x] **Text Block - Visitor View**
  - [x] Component to display text content with markdown support.
- [x] **Links Block - Visitor View**
  - [x] Component to display curated links in organized format.
- [x] **Content List Block - Visitor View**
  - [x] Component to display curated items with type indicators and annotations.
- [x] **Block Renderer Component**
  - [x] Unified component to render any block type with error handling.
- [x] **Assembling the Public User Page (`app/[username]/page.tsx`)**
  - [x] Fetch user's ordered blocks from Supabase.
  - [x] Dynamically render visitor view components for each block.
  - [x] Handle cases for missing profiles or no blocks.
  - [x] Add SEO metadata and Open Graph support.
  - [x] Implement responsive design and accessibility.

### Phase 5: Refinements & Polish

- [ ] **Performance & Media Optimization**
  - [ ] Use Next.js `Image` component with optimized formats and lazy loading.
  - [ ] Add `loading="lazy"` to embeds and enable link prefetching.
- [ ] **Styling & Responsiveness**
  - [ ] Ensure all components are well-styled with Tailwind CSS.
  - [ ] Thoroughly test for responsiveness.
- [ ] **Basic SEO**
  - [ ] Implement dynamic page titles and meta descriptions (Next.js metadata object).
  - [ ] Generate `sitemap.xml` and `robots.txt`.
  - [ ] Add Open Graph and Twitter card metadata (including images for sharing).
  - [ ] (Optional) Capture page-view analytics per profile (Supabase table or Edge Function).
- [ ] **Error Handling & Loading States**
  - [ ] Implement user-friendly loading indicators and error messages.
