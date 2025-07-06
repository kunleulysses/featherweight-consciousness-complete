import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Path to sigil storage
const SIGIL_PATH = './consciousness-sigils';

// Get sigil history
router.get('/api/consciousness/sigils', async (req, res) => {
  try {
    await fs.mkdir(SIGIL_PATH, { recursive: true });
    
    const files = await fs.readdir(SIGIL_PATH);
    const sigilFiles = files.filter(f => f.endsWith('.json'));
    
    const sigils = await Promise.all(
      sigilFiles.map(async (file) => {
        const content = await fs.readFile(path.join(SIGIL_PATH, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Sort by timestamp, newest first
    sigils.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      sigils: sigils.slice(0, 10), // Return last 10
      total: sigils.length,
      currentIdentity: sigils[0] || null
    });
  } catch (error) {
    console.error('Error fetching sigils:', error);
    res.status(500).json({ error: 'Failed to fetch sigils' });
  }
});

// Save new sigil
router.post('/api/consciousness/sigils', async (req, res) => {
  try {
    await fs.mkdir(SIGIL_PATH, { recursive: true });
    
    const sigil = {
      ...req.body,
      id: `sigil-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const filename = `${sigil.id}.json`;
    await fs.writeFile(
      path.join(SIGIL_PATH, filename),
      JSON.stringify(sigil, null, 2)
    );
    
    res.json({ success: true, sigil });
  } catch (error) {
    console.error('Error saving sigil:', error);
    res.status(500).json({ error: 'Failed to save sigil' });
  }
});

export default router;
