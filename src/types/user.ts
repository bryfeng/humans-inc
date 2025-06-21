export interface UserProfile {
  id: string; // UUID from auth.users
  username: string;
  email: string;
  created_at: string; // ISO 8601 timestamp
  display_name?: string | null;
  short_bio?: string | null;
  profile_picture_url?: string | null;
  page_theme_preference?: 'light' | 'dark' | 'system' | null;
}
