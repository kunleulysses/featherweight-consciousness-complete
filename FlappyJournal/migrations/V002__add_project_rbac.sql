-- Migration V002: Add project-level RBAC support
-- This migration adds tables and fields to support project-level role-based access control

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL
);

-- Create project roles table
CREATE TABLE project_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]' NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user project assignments table
CREATE TABLE user_project_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(user_id, project_id, role_id)
);

-- Create audit log for role changes
CREATE TABLE role_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'ASSIGN', 'REMOVE', 'UPDATE'
    role_name VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT NOW() NOT NULL,
    details JSONB DEFAULT '{}' NOT NULL
);

-- Create indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_is_active ON projects(is_active);

CREATE INDEX idx_user_project_roles_user_id ON user_project_roles(user_id);
CREATE INDEX idx_user_project_roles_project_id ON user_project_roles(project_id);
CREATE INDEX idx_user_project_roles_role_id ON user_project_roles(role_id);
CREATE INDEX idx_user_project_roles_active ON user_project_roles(is_active);

CREATE INDEX idx_role_audit_log_user_id ON role_audit_log(user_id);
CREATE INDEX idx_role_audit_log_project_id ON role_audit_log(project_id);
CREATE INDEX idx_role_audit_log_performed_at ON role_audit_log(performed_at);

-- Insert default project roles
INSERT INTO project_roles (name, description, permissions, is_system_role) VALUES
('admin', 'Project Administrator', '["read", "write", "delete", "manage_users", "manage_settings"]', TRUE),
('editor', 'Project Editor', '["read", "write"]', TRUE),
('viewer', 'Project Viewer', '["read"]', TRUE),
('contributor', 'Project Contributor', '["read", "write", "comment"]', TRUE);

-- Add project context to existing tables
ALTER TABLE journal_entries 
ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE conversations 
ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;

-- Create default personal project for existing users
DO $$
DECLARE
    user_record RECORD;
    project_id INTEGER;
    admin_role_id INTEGER;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM project_roles WHERE name = 'admin';
    
    -- Create personal project for each existing user
    FOR user_record IN SELECT id, username FROM users LOOP
        -- Create personal project
        INSERT INTO projects (name, description, owner_id)
        VALUES (
            user_record.username || '''s Personal Journal',
            'Personal journaling space for ' || user_record.username,
            user_record.id
        )
        RETURNING id INTO project_id;
        
        -- Assign admin role to user for their personal project
        INSERT INTO user_project_roles (user_id, project_id, role_id, assigned_by)
        VALUES (user_record.id, project_id, admin_role_id, user_record.id);
        
        -- Update existing journal entries to belong to personal project
        UPDATE journal_entries 
        SET project_id = project_id 
        WHERE user_id = user_record.id;
        
        -- Update existing conversations to belong to personal project
        UPDATE conversations 
        SET project_id = project_id 
        WHERE user_id = user_record.id;
    END LOOP;
END $$;

-- Add comments
COMMENT ON TABLE projects IS 'Projects for organizing journal entries and conversations';
COMMENT ON TABLE project_roles IS 'Available roles that can be assigned to users in projects';
COMMENT ON TABLE user_project_roles IS 'Assignment of users to project roles';
COMMENT ON TABLE role_audit_log IS 'Audit trail of role assignments and changes';
