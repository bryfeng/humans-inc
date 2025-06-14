# Phase 2: User Authentication & Profile Foundation

This phase focuses on implementing user authentication using Supabase Auth, creating basic user profile pages, defining the necessary database tables, and setting up security rules.

## Tickets

### 2.1 User Authentication with Supabase Auth

- **Description**: Implement core authentication features (sign-up, login, logout).
- **Tasks**:
  - [x] Implement sign-up functionality. (Backend logic complete, email confirmation flow in place)
  - [x] Implement login functionality. (Backend logic complete)
  - [x] Implement logout functionality. (Backend logic complete)
  - [x] Create UI pages/components for `/login` and `/signup`. (UI implementation complete)
  - [x] Set up user session management. (Core logic with `@supabase/ssr` and cookie handling in place)
  - [x] Install and configure `@supabase/ssr` for streamlined session management and server-side rendering with Next.js and Supabase. (Configuration complete)
  - [ ] Protect routes/pages that require authentication (e.g., a future dashboard page). (Pending full auth flow testing)
- **Status**: In Progress
- **Acceptance Criteria**:
  - Users can successfully sign up for a new account.
  - Users receive a confirmation email (if email confirmation is enabled).
  - Users can confirm their email address via a link or code.
  - Users can log in with valid credentials.
  - Users are redirected appropriately after login and logout.
  - Users can log out, and their session is terminated.
  - UI pages/components for `/login` and `/signup` are functional and user-friendly.
  - `@supabase/ssr` is correctly integrated for server-side session management.
  - Authenticated users can access protected routes, while unauthenticated users are redirected or denied access.
  - User sessions are persisted and managed correctly across browser sessions.

### 2.2 User Table in Supabase

- **Description**: Define and create the `users` table in the Supabase database.
- **Tasks**:
  - [ ] Define schema for `users` table including fields like:
    - `id` (UUID, primary key, references `auth.users.id`)
    - `username` (TEXT, unique, indexed)
    - `email` (TEXT, unique, from `auth.users.email`)
    - `created_at` (TIMESTAMPTZ, default `now()`)
    - `display_name` (TEXT, nullable)
    - `short_bio` (TEXT, nullable)
    - `profile_picture_url` (TEXT, nullable, references Supabase Storage)
    - `page_theme_preference` (TEXT, nullable, e.g., 'light', 'dark', 'system')
  - [ ] Create the `users` table in Supabase via SQL or the Supabase dashboard.
  - [ ] Ensure `username` is unique and has appropriate constraints.
- **Status**: To Do
- **Acceptance Criteria**:
  - The `users` table is created in the Supabase database with the specified schema.
  - The `id` field correctly references `auth.users.id` and is set as the primary key.
  - The `username` field has a unique constraint and is indexed for efficient lookups.
  - The `email` field has a unique constraint and is populated from `auth.users.email`.
  - The `created_at` field defaults to the current timestamp upon record creation.
  - All specified fields (`display_name`, `short_bio`, `profile_picture_url`, `page_theme_preference`) exist with correct types and nullability.
  - A database trigger or function is implemented to automatically create a corresponding record in the `users` table when a new user signs up in `auth.users`.

### 2.3 Username Constraints & Validation

- **Description**: Implement constraints and validation for usernames.
- **Tasks**:
  - [ ] Restrict `username` to a specific pattern (e.g., `[a-z0-9_-]{3,}`).
  - [ ] Implement logic to reserve system routes/keywords (e.g., `login`, `signup`, `api`, `admin`) from being used as usernames.
  - [ ] Add validation for username format and availability during sign-up or profile updates.
- **Status**: To Do
- **Acceptance Criteria**:
  - Usernames are restricted to the defined pattern (e.g., `[a-z0-9_-]{3,}`).
  - System-reserved keywords/routes (e.g., `login`, `signup`, `api`, `admin`, `profile`, `settings`) cannot be used as usernames.
  - Client-side validation provides immediate feedback on username format during input.
  - Server-side validation enforces username format, uniqueness, and non-reservation.
  - Users receive clear and actionable error messages for invalid or unavailable usernames.
  - Username availability check is functional and efficient during sign-up or profile update processes.

### 2.4 Basic User Profile Page

- **Description**: Implement a dynamic public profile page for users.
- **Tasks**:
  - [ ] Create dynamic route `app/[username]/page.tsx`.
  - [ ] Fetch basic user information from the `users` table based on the `username` parameter.
  - [ ] Display fetched user information (e.g., display name, bio).
  - [ ] Include an initial placeholder for future content blocks.
- **Status**: To Do
- **Acceptance Criteria**:
  - A dynamic route `app/[username]/page.tsx` is created and functional.
  - Navigating to `/[username]` (e.g., `/johndoe`) successfully renders the profile page for the specified user.
  - The page fetches and displays public user information (e.g., `username`, `display_name`, `short_bio`, `profile_picture_url`) from the `users` table.
  - If the `username` does not exist, an appropriate "User not found" page or message is displayed.
  - The profile page includes a clearly marked placeholder area for future content blocks or sections.
  - The page is server-rendered or statically generated with ISR for good performance and SEO, if applicable.

### 2.5 Supabase Row Level Security (RLS)

- **Description**: Enable and configure Row Level Security for relevant Supabase tables.
- **Tasks**:
  - [ ] Enable RLS on the `users` table.
  - [ ] Create RLS policies for the `users` table:
    - Allow users to read their own profile data.
    - Allow users to update their own profile data.
    - Allow public read access to selected fields for display on profile pages (e.g., `display_name`, `short_bio`, `profile_picture_url`).
  - [ ] Plan for RLS on future tables like `blocks` and `posts` (e.g., owners can read/write, public can read published content).
- **Status**: To Do
- **Acceptance Criteria**:
  - Row Level Security (RLS) is enabled on the `users` table in Supabase.
  - Authenticated users can read all fields of their own record in the `users` table.
  - Authenticated users can update permissible fields (e.g., `display_name`, `short_bio`, `profile_picture_url`, `page_theme_preference`) of their own record in the `users` table.
  - All users (including unauthenticated ones) can publicly read selected, non-sensitive fields (e.g., `username`, `display_name`, `short_bio`, `profile_picture_url`) from the `users` table for profile display purposes.
  - Users cannot read or modify data for which they do not have explicit RLS policy permission.
  - RLS policies are clearly defined and testable.
  - Initial considerations for RLS on future related tables (e.g., `blocks`, `posts`) are documented.
