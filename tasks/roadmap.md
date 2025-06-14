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

- [ ] **Core Repo Tooling**
  - [ ] Add `.env.example` and document required environment variables.
  - [ ] Configure Prettier and ESLint with strict TypeScript rules.
  - [ ] Set up Husky + lint-staged pre-commit hooks.
  - [ ] Add GitHub Actions workflow for lint, type-check, and tests.

### Phase 1: Project Setup & Core Structure

- [ ] **Initialize Next.js Project**
  - [ DONE ] Use `npx create-next-app@latest humans-inc --typescript --tailwind --eslint`.
  - [ ] Set up basic project structure: `components/`, `app/` (for routing), `lib/` or `utils/`, `styles/`.
- [ ] **Integrate Supabase**
  - [ ] Set up a new Supabase project.
  - [ ] Install Supabase client library (`supabase-js`).
  - [ ] Create Supabase client instance and manage environment variables for Supabase URL and anon key.
  - [ ] Configure Supabase Storage bucket (`avatars`) with public-read policy and helper upload util.
- [ ] **Basic Layout & Theme**
  - [ ] Create a main layout component (`app/layout.tsx`).
  - [ ] Implement a simple header and footer (e.g., "Powered by humans.inc" in footer).
  - [ ] Set up global styles in `app/globals.css`.
  - [ ] Implement Light/Dark mode toggle functionality (e.g., using `next-themes`) and store user preference.

### Phase 2: User Authentication & Profile Foundation

- [ ] **User Authentication with Supabase Auth**
  - [ ] Implement sign-up, login, and logout functionality.
  - [ ] Create pages for `/login`, `/signup`.
  - [ ] Protect routes/pages requiring authentication.
  - [ ] Set up user sessions.
  - [ ] Install and configure `@supabase/auth-helpers-nextjs` for session management.
- [ ] **Basic User Profile Page (`app/[username]/page.tsx`)**
  - [ ] Implement dynamic route for user profiles.
  - [ ] Fetch and display basic user information.
  - [ ] Initial placeholder for content blocks.
- [ ] **User Table in Supabase**
  - [ ] Define `users` table (e.g., `id`, `username`, `email`, `created_at`, `display_name`, `short_bio`, `profile_picture_url`, `page_theme_preference`).
  - [ ] Ensure `username` is unique.
- [ ] **Username Constraints**
  - [ ] Restrict `username` to pattern `[a-z0-9_-]{3,}` and reserve system routes (e.g., `login`, `signup`).
- [ ] **Supabase Row Level Security (RLS)**
  - [ ] Enable RLS on `users`, `blocks`, and `posts` tables.
  - [ ] Add policies to allow owners read/write and public read for published content.

### Phase 3: Core "Block" Components - Creator View (Editing Functionality)

- [ ] **"Block" Data Model in Supabase**
  - [ ] Define `blocks` table (e.g., `id`, `user_id` (FK), `type` (enum: 'bio', 'curated_content', 'writings_list'), `content` (JSONB), `config` (JSONB), `position` (numeric)).
  - [ ] Create composite index on (`user_id`, `position`) for efficient ordering queries.
- [ ] **Creator Dashboard Page (e.g., `app/dashboard/edit-profile/page.tsx`)**
  - [ ] Protected route for logged-in users to manage their profile blocks.
- [ ] **Drag-and-Drop Interface for Blocks**
  - [ ] Use a library like `dnd-kit` or `React Beautiful DnD`.
  - [ ] Allow creators to add, remove, and reorder blocks.
  - [ ] Update `position` and block data in Supabase.
- [ ] **Bio Block - Creator View**
  - [ ] Component for editing bio content (display name, tagline, profile picture upload, key links).
  - [ ] Saves data to the 'bio' type block in Supabase.
- [ ] **Curated Content Block - Creator View**
  - [ ] Component to add/edit/remove curated items (YouTube videos, external articles).
  - [ ] Store URL, type, user's annotation.
  - [ ] (Optional V1.1) Auto-fetch metadata on URL paste.
  - [ ] Saves data to the 'curated_content' type block.
- [ ] **Writings Block (List Display) - Creator View**
  - [ ] Placeholder or configuration settings for how writings are displayed on the public page. Actual writing occurs separately.
- [ ] **Individual Post/Article Creation & Management**
  - [ ] Define `posts` table (e.g., `id`, `user_id` (FK), `title`, `slug`, `excerpt`, `reading_time`, `content` (rich text JSON), `created_at`, `updated_at`, `is_published`).
  - [ ] Add unique constraint on (`user_id`, `slug`) and index on `created_at`.
  - [ ] Dedicated page/modal for writing/editing posts (e.g., `app/dashboard/posts/new`).
  - [ ] Integrate TipTap rich text editor.
  - [ ] Save post content to the `posts` table.

### Phase 4: Visitor View - Displaying User Pages

- [ ] **Bio Block - Visitor View**
  - [ ] Component to display formatted bio content.
- [ ] **Curated Content Block - Visitor View**
  - [ ] Component to display curated items (embedded videos, links, annotations).
- [ ] **Writings List Block - Visitor View**
  - [ ] Component to display a list/grid of user's published posts.
- [ ] **Individual Post Page - Visitor View (`app/[username]/[postSlug]/page.tsx`)**
  - [ ] Dynamic route to display a single published post.
  - [ ] Render rich text content.
- [ ] **Assembling the Public User Page (`app/[username]/page.tsx`)**
  - [ ] Fetch user's ordered blocks from Supabase.
  - [ ] Dynamically render visitor view components for each block.
  - [ ] Handle cases for missing profiles or no blocks.

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
