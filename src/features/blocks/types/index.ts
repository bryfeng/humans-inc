// Block types based on our Supabase schema
export interface Block {
  id: string;
  user_id: string;
  position: number;
  block_type: string;
  title?: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
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
export interface BioBlockContent {
  display_name?: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}

export interface TextBlockContent {
  text: string;
  formatting?: 'plain' | 'markdown';
}

export interface LinksBlockContent {
  items: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export interface ContentListBlockContent {
  items: Array<{
    title: string;
    url?: string;
    annotation?: string;
    type?: 'article' | 'book' | 'video' | 'podcast' | 'other';
  }>;
}

// Block configuration options
export interface BlockConfig {
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
  content: Record<string, unknown>;
  config?: BlockConfig;
}

// For updating existing blocks
export interface UpdateBlockData {
  id: string;
  title?: string;
  content?: Record<string, unknown>;
  config?: BlockConfig;
  position?: number;
}
