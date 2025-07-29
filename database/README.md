# Database Setup

## Collections Feature

To enable the collections feature, run the following migration in your Supabase SQL editor:

```sql
-- Run the contents of migrations/001_create_collections.sql
```

This will:

1. Create the `collections` table
2. Add a `collection_id` column to the existing `blocks` table
3. Set up proper indexes and Row Level Security (RLS) policies
4. Add triggers for automatic timestamp updates

## Required Tables

The application expects the following tables to exist:

- `auth.users` (provided by Supabase Auth)
- `profiles` (user profile information)
- `blocks` (content blocks)
- `collections` (content organization)

Make sure all tables have proper RLS policies configured for security.
