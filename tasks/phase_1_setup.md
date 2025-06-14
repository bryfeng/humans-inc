# Phase 1 – Project Setup & Core Structure

This phase focuses on establishing the basic file structure, integrating Supabase, and setting up the main application layout and theme.

## [DONE] Ticket 1.1: Set up Basic Project Structure

- **Parent Task:** [Initialize Next.js Project](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Create the standard directories for organizing components, utility functions, and styles. The `app/` directory for routing already exists from `create-next-app`.
- **Files/Directories to Create:**
  - `components/`
  - `lib/` (or `utils/` - decide on a convention)
  - `styles/` (if not already present or if more specific style organization is needed beyond `globals.css`)
- **Acceptance Criteria:**
  - The specified directories are created in the project root.
  - A brief `README.md` or note within `lib/` and `components/` can be added to describe their purpose if desired.

## [DONE] Ticket 1.2: Set up Supabase Project (External Task)

- **Parent Task:** [Integrate Supabase](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** This task is performed on the Supabase website. Create a new Supabase project. Once created, you will need the Project URL and the `anon` key.
- **Action:** Go to [supabase.com](https://supabase.com/), sign in, and create a new project.
- **Acceptance Criteria:**
  - Supabase project is created.
  - You have access to the Project URL and the `anon` (public) key.
  - These values should be securely stored (e.g., in your `.env` file, which is gitignored, based on `.env.example`).

## [DONE] Ticket 1.3: Install Supabase Client Library

- **Parent Task:** [Integrate Supabase](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Install the official Supabase JavaScript client library (`@supabase/supabase-js`) into the project.
- **Files to Modify:**
  - `package.json` (dependencies will be added)
- **Command:** `npm install @supabase/supabase-js`
- **Acceptance Criteria:**
  - `@supabase/supabase-js` is added to the project's dependencies.
  - `npm install` completes successfully.

## [DONE] Ticket 1.4: Create Supabase Client & Manage Env Vars

- **Parent Task:** [Integrate Supabase](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Create a utility module to initialize and export the Supabase client. This client will use the environment variables for the Supabase URL and anon key. Ensure your `.env` file (copied from `.env.example`) is populated with the actual keys from your Supabase project.
- **Files to Create/Modify:**
  - `lib/supabaseClient.ts` (or a similar path like `utils/supabase/client.ts`)
  - `.env` (User must create this from `.env.example` and populate with actual Supabase credentials)
- **Acceptance Criteria:**
  - A Supabase client instance is successfully created and can be imported into other parts of the application.
  - The client uses `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Basic connection can be tested (e.g., by attempting a simple read, though this might be deferred to a later ticket).

## [DONE] Ticket 1.5: Configure Supabase Storage Bucket & Helper (Avatars)

- **Parent Task:** [Integrate Supabase](roadmap.md#phase-1-project-setup--core-structure)
- **Description:**
  - In your Supabase project dashboard, create a new storage bucket named `avatars`.
  - Configure its policies for public read access (if profile pictures are public) or appropriate authenticated access.
  - (Optional, can be deferred) Create a basic helper utility function in your Next.js app for uploading files to this bucket.
- **Files to Create/Modify (for helper utility):**
  - `lib/supabaseStorage.ts` (or similar, e.g., `utils/supabase/storage.ts`)
- **Acceptance Criteria:**
  - `avatars` storage bucket exists in the Supabase project.
  - Bucket policies are set as intended.
  - (If helper is created) A basic function to upload a file to the `avatars` bucket is available.

## [DONE] Ticket 1.6: Create Main Layout Component

- **Parent Task:** [Basic Layout & Theme](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Ensure the main application layout component (`app/layout.tsx`) is set up correctly. This file is created by Next.js but might need adjustments for global structure, metadata, and theme providers.
- **Files to Modify:**
  - `app/layout.tsx`
- **Acceptance Criteria:**
  - `app/layout.tsx` correctly renders children pages.
  - Basic HTML structure (html, head, body) is sound.
  - Placeholder for future Header and Footer components.

## [DONE] Ticket 1.7: Implement Header and Footer

- **Parent Task:** [Basic Layout & Theme](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Create simple, stateless Header and Footer components. The footer might include a "Powered by humans.inc" message or similar. Integrate these into the main layout.
- **Files to Create/Modify:**
  - `components/layout/Header.tsx`
  - `components/layout/Footer.tsx`
  - `app/layout.tsx` (to import and use Header/Footer)
- **Acceptance Criteria:**
  - Header and Footer components are created.
  - They are visible on all pages that use the main layout.

## [DONE] Ticket 1.8: Set up Global Styles

- **Parent Task:** [Basic Layout & Theme](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Review and set up initial global styles in `app/globals.css`. This could include base font settings, background colors, or any Tailwind CSS `@layer base` customizations.
- **Files to Modify:**
  - `app/globals.css`
  - `tailwind.config.ts` (if base styles or theme extensions are defined here)
- **Acceptance Criteria:**
  - Basic global styles are applied consistently across the application.
  - Tailwind CSS is correctly configured for any custom base styles.

## [DONE] Ticket 1.9: Implement Light/Dark Mode Toggle

- **Parent Task:** [Basic Layout & Theme](roadmap.md#phase-1-project-setup--core-structure)
- **Description:** Integrate a theme provider (e.g., `next-themes`) to allow users to toggle between light and dark modes. Store the user's preference (e.g., in localStorage).
- **Files to Create/Modify:**
  - `package.json` (to add `next-themes`)
  - `components/ThemeProvider.tsx` (or similar, to wrap `next-themes` provider)
  - `components/ThemeToggle.tsx` (button/UI for toggling)
  - `app/layout.tsx` (to use the ThemeProvider)
- **Command:** `npm install next-themes`
- **Acceptance Criteria:**
  - `next-themes` package is installed.
  - A toggle UI element allows switching between light and dark themes.
  - The chosen theme is applied globally.
  - User's theme preference is persisted across sessions.
