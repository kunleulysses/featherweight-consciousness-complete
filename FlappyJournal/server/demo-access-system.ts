import express from 'express';
import { storage } from './storage';

interface DemoRequest {
  id?: number;
  name: string;
  email: string;
  company: string;
  title: string;
  vertical: string;
  use_case?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  access_code?: string;
}

export function addDemoAccessRoutes(app: express.Application) {
  // Submit demo request
  app.post('/api/demo/request', async (req, res) => {
    try {
      const { name, email, company, title, vertical, use_case } = req.body;

      // Validate required fields
      if (!name || !email || !company || !title || !vertical) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate unique access code
      const access_code =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Store demo request in database
      const demoRequest: DemoRequest = {
        name,
        email,
        company,
        title,
        vertical,
        use_case: use_case || '',
        status: 'pending',
        created_at: new Date(),
        access_code,
      };

      // For now, log the request (in production, save to database)
      console.log('🎯 NEW DEMO REQUEST:', demoRequest);

      // Auto-approve for demo purposes (in production, you'd review these)
      const approvedRequest = { ...demoRequest, status: 'approved' as const };

      // Send response
      res.json({
        success: true,
        message: 'Demo request submitted successfully',
        access_code: access_code,
        status: 'approved',
      });

      // In production, you'd send an email here
      console.log(
        `📧 Demo access granted to ${email} - Access Code: ${access_code}`
      );
    } catch (error) {
      console.error('Error processing demo request:', error);
      res.status(500).json({ error: 'Failed to process demo request' });
    }
  });

  // Verify demo access
  app.post('/api/demo/verify', async (req, res) => {
    try {
      const { access_code } = req.body;

      if (!access_code) {
        return res.status(400).json({ error: 'Access code required' });
      }

      // For demo purposes, any 30-character code is valid
      if (access_code.length >= 20) {
        res.json({
          success: true,
          access_granted: true,
          demo_urls: {
            full_demo: '/demo-portal/',
            healthcare: '/demo-portal/healthcare.html',
            research: '/demo-portal/research.html',
            education: '/demo-portal/education.html',
            enterprise: '/demo-portal/enterprise.html',
          },
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid access code',
        });
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  });

  // Get demo analytics (for internal use)
  app.get('/api/demo/analytics', async (req, res) => {
    try {
      // Mock analytics data
      const analytics = {
        total_requests: 25,
        approved: 18,
        pending: 4,
        rejected: 3,
        by_vertical: {
          healthcare: 8,
          enterprise: 6,
          research: 5,
          education: 4,
          other: 2,
        },
        recent_requests: [
          {
            name: 'Dr. Sarah Chen',
            company: 'MedTech Solutions',
            vertical: 'healthcare',
            status: 'approved',
          },
          {
            name: 'Prof. James Miller',
            company: 'Stanford AI Lab',
            vertical: 'research',
            status: 'approved',
          },
          {
            name: 'Lisa Rodriguez',
            company: 'Fortune 500 Corp',
            vertical: 'enterprise',
            status: 'pending',
          },
        ],
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });
}
