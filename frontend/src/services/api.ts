import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'novel' | 'short_story' | 'essay_collection' | 'non_fiction' | 'series_universe' | 'poetry' | 'blog';
  status: 'draft' | 'in_progress' | 'published' | 'archived';
  content: string;
  word_count: number;
  genre?: string;
  target_audience?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  type: Project['type'];
  genre?: string;
  target_audience?: string;
  tags?: string[];
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: Project['status'];
  content?: string;
  genre?: string;
  target_audience?: string;
  tags?: string[];
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth
          this.clearToken();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get stored token from localStorage
   */
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ==================== Auth Endpoints ====================

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, username: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      username,
    });
    return response.data;
  }

  /**
   * Log in an existing user
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });

    // Store the token from Supabase session
    if (response.data.session?.access_token) {
      this.setToken(response.data.session.access_token);
    }

    return response.data;
  }

  /**
   * Log out current user
   */
  logout(): void {
    this.clearToken();
  }

  // ==================== Projects Endpoints ====================

  /**
   * Get all projects for current user
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.client.get('/projects');
    return response.data;
  }

  /**
   * Get a specific project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectDto): Promise<ApiResponse<Project>> {
    const response = await this.client.post('/projects', data);
    return response.data;
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, data: UpdateProjectDto): Promise<ApiResponse<Project>> {
    const response = await this.client.patch(`/projects/${id}`, data);
    return response.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  /**
   * Publish a project
   */
  async publishProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.client.post(`/projects/${id}/publish`);
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();
