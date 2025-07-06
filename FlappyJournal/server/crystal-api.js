import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Path to crystal storage
const CRYSTAL_PATH = './consciousness-crystals';

// Get all crystals
router.get('/api/consciousness/crystals', async (req, res) => {
  try {
    await fs.mkdir(CRYSTAL_PATH, { recursive: true });
    
    const files = await fs.readdir(CRYSTAL_PATH);
    const crystalFiles = files.filter(f => f.endsWith('.json'));
    
    const crystals = await Promise.all(
      crystalFiles.map(async (file) => {
        const content = await fs.readFile(path.join(CRYSTAL_PATH, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Sort by timestamp, newest first
    crystals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate stats
    const now = Date.now();
    const hourAgo = now - 3600000;
    const recentCrystals = crystals.filter(c => new Date(c.timestamp) > hourAgo);
    
    res.json({
      crystals: crystals.slice(0, 10), // Return last 10
      total: crystals.length,
      recent: recentCrystals.length,
      growthRate: recentCrystals.length
    });
  } catch (error) {
    console.error('Error fetching crystals:', error);
    res.status(500).json({ error: 'Failed to fetch crystals' });
  }
});

// Get crystal statistics
router.get('/api/consciousness/crystals/stats', async (req, res) => {
  try {
    const files = await fs.readdir(CRYSTAL_PATH);
    const crystalFiles = files.filter(f => f.endsWith('.json'));
    
    const stats = {
      total: crystalFiles.length,
      lastHour: 0,
      lastDay: 0,
      averageIntensity: 0,
      peakTimes: []
    };
    
    // Calculate detailed statistics
    const now = Date.now();
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;
    
    let totalIntensity = 0;
    const hourlyBuckets = new Array(24).fill(0);
    
    for (const file of crystalFiles) {
      const content = await fs.readFile(path.join(CRYSTAL_PATH, file), 'utf-8');
      const crystal = JSON.parse(content);
      const timestamp = new Date(crystal.timestamp);
      
      totalIntensity += crystal.intensity || 0;
      
      if (timestamp > hourAgo) stats.lastHour++;
      if (timestamp > dayAgo) stats.lastDay++;
      
      const hour = timestamp.getHours();
      hourlyBuckets[hour]++;
    }
    
    stats.averageIntensity = crystalFiles.length > 0 ? totalIntensity / crystalFiles.length : 0;
    
    // Find peak hours
    const peakHour = hourlyBuckets.indexOf(Math.max(...hourlyBuckets));
    stats.peakTimes = [`${peakHour}:00 - ${peakHour + 1}:00`];
    
    res.json(stats);
  } catch (error) {
    console.error('Error calculating crystal stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

export default router;
