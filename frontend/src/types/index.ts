// User
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'plus';
}

// Projects
export type ProjectType = 'novel' | 'short_story' | 'essay_collection' | 'non_fiction' | 'series_universe' | 'poetry' | 'blog';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: ProjectType;
  status: 'draft' | 'in_progress' | 'published' | 'archived';
  content: string;
  word_count: number;
  genre?: string;
  created_at: string;
  updated_at: string;
}

// Entities
export type EntityType = 'character' | 'location' | 'theme' | 'plot_point' | 'chapter' | 'scene' | 'reference';

export interface Entity {
  id: string;
  project_id: string;
  type: EntityType;
  name: string;
  description: string;
  metadata: Record<string, any>;
}
