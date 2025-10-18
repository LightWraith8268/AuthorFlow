// User & Auth Types
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

// Project Types - Supports all writer types
export type ProjectType = 'novel' | 'short_story' | 'essay_collection' | 'non_fiction' | 'series_universe' | 'poetry' | 'blog';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: ProjectType;
  status: 'draft' | 'in_progress' | 'published' | 'archived';

  // Content
  content: string;
  word_count: number;

  // Metadata
  genre?: string;
  target_audience?: string;
  tags: string[];

  // Publishing
  is_published: boolean;
  published_at?: Date;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// Entity Types (Characters, Locations, Themes, etc.)
export type EntityType = 'character' | 'location' | 'theme' | 'plot_point' | 'chapter' | 'scene' | 'reference';

export interface Entity {
  id: string;
  project_id: string;
  type: EntityType;
  name: string;
  description: string;

  // Flexible metadata for different entity types
  metadata: Record<string, any>;

  // For characters
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';

  // For locations
  coordinates?: { x: number; y: number };

  // Timeline events
  timeline_date?: Date;

  created_at: Date;
  updated_at: Date;
}

// Publishing Connection
export interface PublishingConnection {
  id: string;
  user_id: string;
  platform: 'amazon_kdp' | 'substack' | 'medium' | 'personal_blog' | 'newsletter';
  api_key?: string;
  api_secret?: string;
  connected_at: Date;
  is_active: boolean;
}

// Publishing Schedule
export interface PublishingSchedule {
  id: string;
  project_id: string;
  platform: string;
  scheduled_date: Date;
  status: 'scheduled' | 'published' | 'failed';
  metadata?: Record<string, any>;
  created_at: Date;
}

// Analytics Snapshot
export interface AnalyticsSnapshot {
  id: string;
  project_id: string;
  platform: string;

  metrics: {
    reads: number;
    engagement_rate: number;
    revenue?: number;
    comments: number;
    shares: number;
  };

  captured_at: Date;
}

// Subscription Tier Features
export interface SubscriptionTier {
  tier: 'free' | 'pro' | 'plus';
  max_projects: number;
  max_entities_per_project: number;
  max_platforms: number;
  features: {
    ai_suggestions: boolean;
    cover_generator: boolean;
    community_beta: boolean;
    monetization_tracking: boolean;
    advanced_analytics: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
