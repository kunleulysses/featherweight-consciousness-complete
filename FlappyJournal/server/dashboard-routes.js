import express from 'express';
import pool from './db.js';
import { authenticateToken } from './auth-middleware.js';

const router = express.Router();

// Get user's projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    // First check if user exists in database
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    let userId;
    if (userCheck.rows.length === 0) {
      // Create user if doesn't exist
      const newUser = await pool.query(
        `INSERT INTO users (keycloak_id, email, first_name, last_name, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING id`,
        [req.user.id, req.user.email, req.user.given_name || '', req.user.family_name || '']
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userCheck.rows[0].id;
    }

    // Get projects where user is owner or member
    const projects = await pool.query(
      `SELECT DISTINCT p.*, 
        CASE WHEN p.owner_id = $1 THEN 'owner' 
             ELSE upr.role 
        END as user_role
       FROM projects p
       LEFT JOIN user_project_roles upr ON p.id = upr.project_id AND upr.user_id = $1
       WHERE p.owner_id = $1 OR upr.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(projects.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/projects', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  
  try {
    // Get user's database ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Create project
    const project = await pool.query(
      `INSERT INTO projects (name, description, owner_id, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [name, description || '', userId]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO journal_entries (user_id, project_id, action, details, created_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, project.rows[0].id, 'project_created', JSON.stringify({ name })]
    );
    
    res.json(project.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.json([]);
    }
    
    const userId = userResult.rows[0].id;
    
    // Get recent activities from journal entries
    const activities = await pool.query(
      `SELECT je.*, p.name as project_name, u.email as user_email
       FROM journal_entries je
       LEFT JOIN projects p ON je.project_id = p.id
       LEFT JOIN users u ON je.user_id = u.id
       WHERE je.user_id = $1 OR je.project_id IN (
         SELECT project_id FROM user_project_roles WHERE user_id = $1
         UNION
         SELECT id FROM projects WHERE owner_id = $1
       )
       ORDER BY je.created_at DESC
       LIMIT 20`,
      [userId]
    );
    
    res.json(activities.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.json({
        totalProjects: 0,
        activeProjects: 0,
        totalCollaborators: 0,
        recentActivities: 0
      });
    }
    
    const userId = userResult.rows[0].id;
    
    // Get stats
    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM projects WHERE owner_id = $1 OR id IN (
          SELECT project_id FROM user_project_roles WHERE user_id = $1
        )) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE (owner_id = $1 OR id IN (
          SELECT project_id FROM user_project_roles WHERE user_id = $1
        )) AND is_active = true) as active_projects,
        (SELECT COUNT(DISTINCT user_id) FROM user_project_roles WHERE project_id IN (
          SELECT id FROM projects WHERE owner_id = $1
        )) as total_collaborators,
        (SELECT COUNT(*) FROM journal_entries WHERE created_at > NOW() - INTERVAL '7 days' AND (
          user_id = $1 OR project_id IN (
            SELECT id FROM projects WHERE owner_id = $1
            UNION
            SELECT project_id FROM user_project_roles WHERE user_id = $1
          )
        )) as recent_activities`,
      [userId]
    );
    
    res.json({
      totalProjects: parseInt(stats.rows[0].total_projects) || 0,
      activeProjects: parseInt(stats.rows[0].active_projects) || 0,
      totalCollaborators: parseInt(stats.rows[0].total_collaborators) || 0,
      recentActivities: parseInt(stats.rows[0].recent_activities) || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
