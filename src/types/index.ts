export * from './user';

// Collection types
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  description?: string;
  is_public: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionData {
  user_id: string;
  name: string;
  slug?: string;
  description?: string;
  is_public?: boolean;
  display_order?: number;
}

export interface UpdateCollectionData {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  is_public?: boolean;
  display_order?: number;
}
