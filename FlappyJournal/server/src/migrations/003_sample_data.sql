-- Insert sample data sources for testing
INSERT INTO data_sources (user_id, name, type, status, records_count, metadata, last_sync) 
VALUES 
  ('test-user', 'Research Papers Database', 'database', 'active', 1543, 
   '{"format": "PostgreSQL", "endpoint": "research.db.internal", "frequency": "Real-time"}'::jsonb, 
   NOW() - INTERVAL '1 hour'),
  
  ('test-user', 'ArXiv API Feed', 'api', 'active', 892, 
   '{"endpoint": "https://export.arxiv.org/api", "frequency": "Hourly"}'::jsonb, 
   NOW() - INTERVAL '2 hours'),
  
  ('test-user', 'Conference Proceedings', 'file', 'inactive', 456, 
   '{"format": "PDF Collection", "size": 2147483648}'::jsonb, 
   NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Add sample project memory if we have projects
INSERT INTO project_memory (project_id, key, value, category)
SELECT 
  p.id,
  'project_context',
  '{"description": "Research on quantum computing applications", "keywords": ["quantum", "computing", "algorithms"], "start_date": "2025-01-01"}'::jsonb,
  'context'
FROM projects p
WHERE p.owner_id = (SELECT id FROM users LIMIT 1)
LIMIT 1
ON CONFLICT (project_id, key) DO NOTHING;

INSERT INTO project_memory (project_id, key, value, category)
SELECT 
  p.id,
  'data_sources',
  '{"primary": ["arxiv.org", "nature.com"], "secondary": ["conferences", "journals"]}'::jsonb,
  'sources'
FROM projects p
WHERE p.owner_id = (SELECT id FROM users LIMIT 1)
LIMIT 1
ON CONFLICT (project_id, key) DO NOTHING;
