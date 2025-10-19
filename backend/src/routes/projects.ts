import { Router, Request, Response } from 'express';
import { supabase } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

// Subscription tier limits
const TIER_LIMITS = {
  free: { max_projects: 3 },
  pro: { max_projects: Infinity },
  plus: { max_projects: Infinity },
};

/**
 * GET /api/projects
 * Get all projects for authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new ApiError(500, `Failed to fetch projects: ${error.message}`);
    }

    res.json({
      success: true,
      data: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch projects');
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !project) {
      throw new ApiError(404, 'Project not found');
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch project');
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, type, genre, target_audience, tags } = req.body;

    // Validate required fields
    if (!title || !type) {
      throw new ApiError(400, 'Title and type are required');
    }

    // Validate project type
    const validTypes = ['novel', 'short_story', 'essay_collection', 'non_fiction', 'series_universe', 'poetry', 'blog'];
    if (!validTypes.includes(type)) {
      throw new ApiError(400, `Invalid project type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Check subscription tier limits
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const tier = user.subscription_tier as 'free' | 'pro' | 'plus';
    const limit = TIER_LIMITS[tier].max_projects;

    // Count existing projects
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (projectCount !== null && projectCount >= limit) {
      throw new ApiError(
        403,
        `Project limit reached for ${tier} tier. Upgrade to create more projects.`
      );
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          title,
          description: description || null,
          type,
          status: 'draft',
          content: '',
          word_count: 0,
          genre: genre || null,
          target_audience: target_audience || null,
          tags: tags || [],
          is_published: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new ApiError(500, `Failed to create project: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create project');
  }
});

/**
 * PATCH /api/projects/:id
 * Update a project
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const updates = req.body;

    // Don't allow updating user_id or id
    delete updates.user_id;
    delete updates.id;
    delete updates.created_at;

    // If updating content, recalculate word count
    if (updates.content !== undefined) {
      updates.word_count = updates.content.trim().split(/\s+/).length;
    }

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !project) {
      throw new ApiError(404, 'Project not found or update failed');
    }

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to update project');
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(404, 'Project not found or delete failed');
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to delete project');
  }
});

/**
 * POST /api/projects/:id/publish
 * Mark a project as published
 */
router.post('/:id/publish', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        status: 'published',
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !project) {
      throw new ApiError(404, 'Project not found');
    }

    res.json({
      success: true,
      data: project,
      message: 'Project published successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to publish project');
  }
});

export default router;
