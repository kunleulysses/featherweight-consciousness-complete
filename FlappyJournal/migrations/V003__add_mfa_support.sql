-- Migration V003: Add Multi-Factor Authentication support
-- This migration adds tables and fields to support MFA

-- Create MFA methods table
CREATE TABLE user_mfa_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email', 'backup_codes'
    method_name VARCHAR(100), -- User-friendly name for the method
    secret_key VARCHAR(255), -- Encrypted secret for TOTP
    phone_number VARCHAR(20), -- For SMS MFA
    backup_codes JSONB, -- Array of backup codes
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMP,
    use_count INTEGER DEFAULT 0 NOT NULL
);

-- Create MFA sessions table for temporary verification
CREATE TABLE mfa_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    method_id INTEGER REFERENCES user_mfa_methods(id) ON DELETE CASCADE,
    challenge_code VARCHAR(10), -- For SMS/Email verification
    attempts INTEGER DEFAULT 0 NOT NULL,
    max_attempts INTEGER DEFAULT 3 NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_user_mfa_methods_user_id ON user_mfa_methods(user_id);
CREATE INDEX idx_user_mfa_methods_type ON user_mfa_methods(method_type);
CREATE INDEX idx_user_mfa_methods_verified ON user_mfa_methods(is_verified);

CREATE INDEX idx_mfa_sessions_user_id ON mfa_sessions(user_id);
CREATE INDEX idx_mfa_sessions_token ON mfa_sessions(session_token);
CREATE INDEX idx_mfa_sessions_expires_at ON mfa_sessions(expires_at);

-- Add MFA requirement settings to projects
ALTER TABLE projects 
ADD COLUMN require_mfa BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN mfa_grace_period_hours INTEGER DEFAULT 24;

-- Add MFA settings to user preferences
-- Update the users table to track MFA enablement
ALTER TABLE users 
ADD COLUMN mfa_enabled_at TIMESTAMP,
ADD COLUMN mfa_backup_codes_generated_at TIMESTAMP;

-- Create function to clean up expired MFA sessions
CREATE OR REPLACE FUNCTION cleanup_expired_mfa_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM mfa_sessions 
    WHERE expires_at < NOW() 
    AND completed_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE user_mfa_methods IS 'Multi-factor authentication methods configured by users';
COMMENT ON TABLE mfa_sessions IS 'Temporary sessions for MFA verification process';
COMMENT ON COLUMN user_mfa_methods.secret_key IS 'Encrypted TOTP secret key';
COMMENT ON COLUMN user_mfa_methods.backup_codes IS 'Encrypted backup codes for account recovery';
COMMENT ON COLUMN mfa_sessions.challenge_code IS 'Temporary code sent via SMS/Email';
COMMENT ON COLUMN projects.require_mfa IS 'Whether MFA is required to access this project';
COMMENT ON COLUMN projects.mfa_grace_period_hours IS 'Hours after login before MFA is required again';
