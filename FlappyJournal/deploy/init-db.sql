-- Database initialization script
-- This script will be executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (PostgreSQL will create the database specified in POSTGRES_DB)
-- Add any additional database setup here

-- Example: Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Example: Create initial tables or indexes
-- This is optional - your application migrations should handle schema creation

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE flappyjournal TO postgres;
