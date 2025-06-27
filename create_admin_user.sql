-- Create admin user with all permissions for DHQ Accommodation Hub
-- This script creates a superadmin user with full access to all pages and actions

-- Create the user with bcrypt hash (cost factor 12 - matching auth-utils.ts)
INSERT INTO users (
    id, 
    username, 
    email, 
    hashed_password, 
    email_verified, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    'admin', 
    'admin@dhq.mil', 
    '$2b$12$1bjCk4JKQQlsfeS2WdMjXuL2B5S8oYigjRbqhFh6oh/g17mRSbwye', -- password: password123
    NOW(), 
    NOW(), 
    NOW()
);

-- Create the profile with superadmin role
INSERT INTO profiles (
    id,
    user_id, 
    full_name, 
    role, 
    created_at, 
    updated_at
) SELECT 
    gen_random_uuid(),
    id, 
    'System Administrator', 
    'superadmin', 
    NOW(), 
    NOW() 
FROM users 
WHERE username = 'admin';

-- Create page permissions with ALL allowed actions from the application
WITH admin_profile AS (
    SELECT p.id 
    FROM profiles p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.username = 'admin'
),
pages AS (
    SELECT * FROM (VALUES
        ('dashboard', 'Dashboard', NULL, ARRAY['access']),
        ('queue', 'Queue', NULL, ARRAY['access']),
        ('queue.list', 'Queue List', 'queue', ARRAY['access', 'add_queue', 'edit', 'delete', 'allocate', 'export']),
        ('queue.units', 'Current Units', 'queue', ARRAY['access', 'add_quarters', 'edit', 'delete']),
        ('allocations', 'Allocations', NULL, ARRAY['access']),
        ('allocations.pending', 'Pending Approval', 'allocations', ARRAY['access', 'view_letter', 'approve', 'refuse']),
        ('allocations.active', 'Active Allocations', 'allocations', ARRAY['access', 'view_letter', 'ejection_notice', 'transfer', 'post_out']),
        ('allocations.past', 'Past Allocations', 'allocations', ARRAY['access', 'view_letter']),
        ('allocations.clearance', 'Clearance', 'allocations', ARRAY['access', 'inspect', 'generate_letter']),
        ('allocations.stamp-settings', 'Stamp Settings', 'allocations', ARRAY['access', 'add_stamp', 'edit', 'delete']),
        ('directory', 'Directory', NULL, ARRAY['access', 'export_data']),
        ('analytics', 'Analytics', NULL, ARRAY['access']),
        ('analytics.queue', 'Queue Analytics', 'analytics', ARRAY['access', 'export_report']),
        ('analytics.pending', 'Pending Allocation Analytics', 'analytics', ARRAY['access', 'export_report']),
        ('analytics.active-allocations', 'Active Allocations', 'analytics', ARRAY['access', 'export_report']),
        ('analytics.past-allocations', 'Past Allocations', 'analytics', ARRAY['access', 'export_report']),
        ('accommodation', 'Accommodation', NULL, ARRAY['access']),
        ('accommodation.units', 'DHQ Accommodation', 'accommodation', ARRAY['access', 'add_quarters', 'edit', 'delete', 'import', 'export', 'view_history', 'maintenance_request', 'inventory']),
        ('accommodation.types', 'Accommodation Types', 'accommodation', ARRAY['access', 'add_type', 'edit', 'delete']),
        ('maintenance', 'Maintenance', NULL, ARRAY['access']),
        ('maintenance.tasks', 'Maintenance Tasks', 'maintenance', ARRAY['access', 'new_task', 'edit', 'delete', 'mark_complete']),
        ('maintenance.requests', 'Maintenance Requests', 'maintenance', ARRAY['access', 'new_request', 'edit', 'delete', 'approve']),
        ('administration', 'Administration', NULL, ARRAY['access']),
        ('administration.users', 'User Management', 'administration', ARRAY['access', 'create_user', 'edit_permissions', 'delete_user']),
        ('administration.roles', 'Role Profiles', 'administration', ARRAY['access', 'create_role', 'edit', 'delete']),
        ('administration.audit-logs', 'Audit Logs', 'administration', ARRAY['access', 'export_logs']),
        ('administration.auth-info', 'Authentication Info', 'administration', ARRAY['access', 'manage_sessions'])
    ) AS t(page_key, page_title, parent_key, allowed_actions)
)
INSERT INTO page_permissions (
    id,
    profile_id,
    page_key,
    page_title,
    parent_key,
    can_view,
    can_edit,
    can_delete,
    allowed_actions,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    admin_profile.id,
    pages.page_key,
    pages.page_title,
    pages.parent_key,
    true,
    true,
    true,
    pages.allowed_actions,
    NOW(),
    NOW()
FROM pages, admin_profile;

-- Verify the user was created successfully
SELECT 
    u.username,
    u.email,
    p.full_name,
    p.role,
    COUNT(pp.id) as permission_count
FROM users u
JOIN profiles p ON p.user_id = u.id
LEFT JOIN page_permissions pp ON pp.profile_id = p.id
WHERE u.username = 'admin'
GROUP BY u.username, u.email, p.full_name, p.role;