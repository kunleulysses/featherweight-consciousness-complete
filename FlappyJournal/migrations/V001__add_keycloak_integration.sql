-- Migration V001: Add Keycloak integration support
-- This migration adds fields to support Keycloak-based authentication

-- Add Keycloak user ID to users table
ALTER TABLE users 
ADD COLUMN keycloak_user_id VARCHAR(255) UNIQUE,
ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local' NOT NULL,
ADD COLUMN external_id VARCHAR(255),
ADD COLUMN last_login_at TIMESTAMP,
ADD COLUMN login_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for Keycloak user ID lookups
CREATE INDEX idx_users_keycloak_user_id ON users(keycloak_user_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_external_id ON users(external_id);

-- Update existing users to mark them as local auth
UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL;

-- Add comments
COMMENT ON COLUMN users.keycloak_user_id IS 'Keycloak user identifier for SSO integration';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local, keycloak, google, github, etc.';
COMMENT ON COLUMN users.external_id IS 'External provider user ID (for social logins)';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.login_count IS 'Total number of successful logins';
COMMENT ON COLUMN users.is_email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether two-factor authentication is enabled';
