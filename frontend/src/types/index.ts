// Re-export API types for convenience
export type {
  ApiResponse,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from '../services/api';

// User
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'plus';
  subscription_renewal?: Date;
  created_at: Date;
  updated_at: Date;
}

// Auth state
export interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Projects
export type ProjectType = 'novel' | 'short_story' | 'essay_collection' | 'non_fiction' | 'series_universe' | 'poetry' | 'blog';

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
