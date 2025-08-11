# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plan & Review

### Before starting work

- Always in plan mode to make a plan
- After getting the plan, make sure you write the plan to /tasks TASK_NAME.md
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task requires external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing

- You should upadte the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily handed over to other engineers.

## Project Overview

humans.inc is a modern web application that provides users with a customizable online presence through modular content blocks. Users get a personal URL (`humans.inc/username`) where they can showcase their bio, links, writings, and curated content.

## Commands

### Development

- `npm run dev` - Start the development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Run the production build locally

### Code Quality

- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format all code using Prettier
- `npm run typecheck` - Run TypeScript compiler to check types without emitting files

### Testing

- No test framework is currently set up. When adding tests, check with the user for their preferred testing approach.

## Architecture

### Tech Stack

- **Frontend**: Next.js 15.3.3 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Rich Text**: Tiptap editor
- **Drag & Drop**: @dnd-kit library

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [username]/         # Public profile pages
│   ├── dashboard/          # Protected creator dashboard
│   ├── auth/              # Authentication routes
│   └── (login|signup)/    # Auth pages
├── components/            # Shared UI components
├── features/              # Domain-specific features
│   ├── auth/             # Authentication logic
│   ├── blocks/           # Content block system
│   ├── collections/      # Content collections
│   ├── onboarding/       # User onboarding flow
│   └── profile/          # User profile management
├── lib/                  # Utilities and configurations
│   └── supabase/         # Supabase client setup
└── types/                # TypeScript type definitions
```

### Architectural Rules

The codebase uses ESLint boundary rules to enforce clean architecture:

- **Features** can import from: lib, types, components
- **App** can import from: features, lib, types, components
- **Components** can import from: lib, types
- **Lib** can import from: types only
- No circular dependencies between layers

### Key Patterns

1. **Server Actions** - All data mutations use Next.js server actions in `actions.ts` files
2. **Server Components** - Default to server components, use client components only when needed
3. **Type Safety** - Strict TypeScript throughout, with Zod for runtime validation
4. **Feature Isolation** - Each feature is self-contained with its own components, types, and actions

### Database Schema

- **profiles** - User profiles linked to auth.users
- **blocks** - Flexible content blocks with JSONB for content/config
- **collections** - Groups of blocks for organization

All tables use Row Level Security (RLS) policies.

### Environment Variables

Required (see .env.example):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key

## Development Guidelines

### Code Style

- Prettier with single quotes, semicolons, trailing commas
- 80 character line width, 2 space indentation
- Tailwind classes are automatically sorted

### Component Patterns

- Separate editor and viewer components for blocks
- Use `cn()` utility for conditional classes
- Prefer composition over inheritance

### Data Fetching

- Use server components for initial data fetch
- Server actions for mutations
- Revalidate paths after data changes

### Authentication

- Supabase Auth with email/password
- Session management via @supabase/ssr
- Protected routes check auth in layout.tsx

### Styling

- Use Tailwind utility classes
- Custom properties defined in globals.css
- Support dark/light themes via next-themes
- Geist font family (Sans and Mono variants)

## Common Tasks

### Adding a New Block Type

1. Create new components in `src/features/blocks/components/[block-name]/`
2. Add editor and viewer components
3. Update block type definitions in `src/features/blocks/types.ts`
4. Add to BlockFactory in `src/features/blocks/components/block-factory.tsx`

### Creating a New Feature

1. Create directory under `src/features/[feature-name]/`
2. Add components, types, and actions subdirectories
3. Export public API from index.ts
4. Follow existing patterns from other features

### Working with Supabase

- Client setup in `src/lib/supabase/`
- Use `createClient()` for server components
- Always handle auth state properly
- Check RLS policies when adding new tables
