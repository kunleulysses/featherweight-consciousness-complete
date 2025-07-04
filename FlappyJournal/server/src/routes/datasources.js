import express from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../../auth-middleware.js';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

// Get all data sources for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // This is the Keycloak ID

    const result = await pool.query(
      `SELECT id, name, type, status, last_sync, records_count, metadata, created_at
       FROM data_sources 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

// Get data sources summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_sources,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sources,
        COALESCE(SUM(records_count), 0) as total_records,
        COALESCE(SUM((metadata->>'size')::bigint), 0) as storage_used,
        MAX(last_sync) as last_update
       FROM data_sources 
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching data sources summary:', error);
    res.status(500).json({ error: 'Failed to fetch data sources summary' });
  }
});

// Create new data source
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, metadata } = req.body;

    const result = await pool.query(
      `INSERT INTO data_sources (user_id, name, type, status, metadata, records_count, last_sync, created_at)
       VALUES ($1, $2, $3, 'inactive', $4, 0, NOW(), NOW())
       RETURNING *`,
      [userId, name, type, metadata || {}]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating data source:', error);
    res.status(500).json({ error: 'Failed to create data source' });
  }
});

// Update data source
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, metadata, status } = req.body;

    const result = await pool.query(
      `UPDATE data_sources 
       SET name = COALESCE($3, name),
           metadata = COALESCE($4, metadata),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, name, metadata, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating data source:', error);
    res.status(500).json({ error: 'Failed to update data source' });
  }
});

// Sync data source
router.post('/:id/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Update last sync time and status
    const result = await pool.query(
      `UPDATE data_sources 
       SET last_sync = NOW(),
           status = 'active',
           records_count = records_count + FLOOR(RANDOM() * 100)::int
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    // In a real implementation, this would trigger actual data synchronization
    res.json({ 
      success: true, 
      message: 'Sync initiated',
      data_source: result.rows[0]
    });
  } catch (error) {
    console.error('Error syncing data source:', error);
    res.status(500).json({ error: 'Failed to sync data source' });
  }
});

// Delete data source
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM data_sources WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting data source:', error);
    res.status(500).json({ error: 'Failed to delete data source' });
  }
});

export default router;
