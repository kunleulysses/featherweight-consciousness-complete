import express from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../../auth-middleware.js';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

// Get project memory/context
router.get('/projects/:projectId/memory', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get user's database ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;

    // Verify user has access to the project
    const projectCheck = await pool.query(
      `SELECT id FROM projects 
       WHERE id = $1 AND (owner_id = $2 OR id IN (
         SELECT project_id FROM user_project_roles WHERE user_id = $2
       ))`,
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get memory items for the project
    const result = await pool.query(
      `SELECT id, key, value, category, created_at, updated_at 
       FROM project_memory 
       WHERE project_id = $1 
       ORDER BY updated_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project memory:', error);
    res.status(500).json({ error: 'Failed to fetch project memory' });
  }
});

// Add/Update memory item
router.post('/projects/:projectId/memory', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { key, value, category } = req.body;
    
    // Get user's database ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;

    // Verify user has access to the project
    const projectCheck = await pool.query(
      `SELECT id FROM projects 
       WHERE id = $1 AND (owner_id = $2 OR id IN (
         SELECT project_id FROM user_project_roles WHERE user_id = $2
       ))`,
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Upsert memory item
    const result = await pool.query(
      `INSERT INTO project_memory (project_id, key, value, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (project_id, key) 
       DO UPDATE SET value = $3, category = $4, updated_at = NOW()
       RETURNING *`,
      [projectId, key, value, category]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving project memory:', error);
    res.status(500).json({ error: 'Failed to save project memory' });
  }
});

// Delete memory item
router.delete('/projects/:projectId/memory/:key', authenticateToken, async (req, res) => {
  try {
    const { projectId, key } = req.params;
    
    // Get user's database ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE keycloak_id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;

    // Verify user has access to the project
    const projectCheck = await pool.query(
      `SELECT id FROM projects 
       WHERE id = $1 AND (owner_id = $2 OR id IN (
         SELECT project_id FROM user_project_roles WHERE user_id = $2
       ))`,
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await pool.query(
      'DELETE FROM project_memory WHERE project_id = $1 AND key = $2',
      [projectId, key]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project memory:', error);
    res.status(500).json({ error: 'Failed to delete project memory' });
  }
});

export default router;
