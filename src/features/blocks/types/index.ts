// Block types based on our Supabase schema
export interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  slug?: string; // URL-friendly slug for SEO-friendly URLs
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  is_published: boolean;
  is_visible?: boolean; // Controls visibility on public page (default: true)
  display_order?: number; // Custom ordering for public display (separate from position)
  collection_id?: string; // Reference to collection (nullable)
  created_at: string;
  updated_at: string;
}

// Common block types
export type BlockType =
  | 'bio'
  | 'text'
  | 'media'
  | 'links'
  | 'content_list'
  | 'gallery';

// Content interfaces for different block types
export interface BioBlockContent extends Record<string, unknown> {
  display_name?: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}

export interface TextBlockContent extends Record<string, unknown> {
  text: string;
  formatting?: 'plain' | 'markdown' | 'rich';
  richContent?: string; // HTML content from TipTap
  wordCount?: number;
  readingTime?: number;
  outline?: Array<{
    id: string;
    level: number;
    text: string;
    anchor: string;
  }>;
}

export interface LinksBlockContent extends Record<string, unknown> {
  items: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export interface ContentListBlockContent extends Record<string, unknown> {
  items: Array<{
    title: string;
    url?: string;
    annotation?: string;
    type?: 'article' | 'book' | 'video' | 'podcast' | 'other';
  }>;
}

// Block configuration options
export interface BlockConfig extends Record<string, unknown> {
  size?: 'small' | 'medium' | 'large';
  layout?: 'default' | 'centered' | 'grid';
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
}

// For creating new blocks
export interface CreateBlockData {
  user_id: string;
  position: number;
  block_type: BlockType;
  title?: string;
  slug?: string; // Optional slug for new blocks
  content: Record<string, unknown>;
  config?: BlockConfig;
  is_published?: boolean;
  collection_id?: string; // Optional collection assignment
}

// For updating existing blocks
export interface UpdateBlockData {
  id: string;
  title?: string;
  slug?: string; // Allow slug updates
  content?: Record<string, unknown>;
  config?: BlockConfig;
  position?: number;
  is_published?: boolean;
  is_visible?: boolean;
  display_order?: number;
  collection_id?: string; // Allow collection updates
}

// For batch layout updates
export interface BlockLayoutUpdate {
  id: string;
  is_visible: boolean;
  display_order: number;
}
