import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, setSessionCookie, getClientInfo, getSession } from '@/lib/auth-utils';
import { AppRole } from '@prisma/client';
import { AuditLogger } from '@/lib/audit-logger';

// Default role-based permissions
const DEFAULT_ROLE_PERMISSIONS = {
  user: [
    { pageKey: 'dashboard', pageTitle: 'Dashboard', allowedActions: ['access'] },
    { pageKey: 'queue', pageTitle: 'Queue', allowedActions: ['access'] },
    { pageKey: 'queue.list', pageTitle: 'Queue List', allowedActions: ['access'] },
    { pageKey: 'directory', pageTitle: 'Directory', allowedActions: ['access'] },
  ],
  moderator: [
    { pageKey: 'dashboard', pageTitle: 'Dashboard', allowedActions: ['access'] },
    { pageKey: 'queue', pageTitle: 'Queue', allowedActions: ['access'] },
    { pageKey: 'queue.list', pageTitle: 'Queue List', allowedActions: ['access', 'edit'] },
    { pageKey: 'allocations', pageTitle: 'Allocations', allowedActions: ['access'] },
    { pageKey: 'allocations.pending', pageTitle: 'Pending Approval', allowedActions: ['access'] },
    { pageKey: 'allocations.active', pageTitle: 'Active Allocations', allowedActions: ['access'] },
    { pageKey: 'personnel', pageTitle: 'Personnel', allowedActions: ['access'] },
    { pageKey: 'personnel.manage', pageTitle: 'Manage Personnel', allowedActions: ['access'] },
    { pageKey: 'directory', pageTitle: 'Directory', allowedActions: ['access'] },
  ],
  admin: [
    { pageKey: 'dashboard', pageTitle: 'Dashboard', allowedActions: ['access'] },
    { pageKey: 'queue', pageTitle: 'Queue', allowedActions: ['access'] },
    { pageKey: 'queue.list', pageTitle: 'Queue List', allowedActions: ['access', 'add_queue', 'edit', 'delete', 'allocate', 'export'] },
    { pageKey: 'queue.units', pageTitle: 'Current Units', allowedActions: ['access', 'add_quarters', 'edit', 'delete'] },
    { pageKey: 'allocations', pageTitle: 'Allocations', allowedActions: ['access'] },
    { pageKey: 'allocations.pending', pageTitle: 'Pending Approval', allowedActions: ['access', 'view_letter', 'approve', 'refuse'] },
    { pageKey: 'allocations.active', pageTitle: 'Active Allocations', allowedActions: ['access', 'view_letter', 'ejection_notice', 'transfer', 'post_out'] },
    { pageKey: 'allocations.past', pageTitle: 'Past Allocations', allowedActions: ['access', 'view_letter', 'delete'] },
    { pageKey: 'allocations.clearance', pageTitle: 'Clearance', allowedActions: ['access', 'inspect', 'generate_letter', 'delete'] },
    { pageKey: 'allocations.stamp-settings', pageTitle: 'Stamp Settings', allowedActions: ['access', 'add_stamp', 'edit', 'delete'] },
    { pageKey: 'directory', pageTitle: 'Directory', allowedActions: ['access', 'export_data'] },
    { pageKey: 'personnel', pageTitle: 'Personnel', allowedActions: ['access'] },
    { pageKey: 'personnel.manage', pageTitle: 'Manage Personnel', allowedActions: ['access', 'edit', 'delete', 'export'] },
    { pageKey: 'analytics', pageTitle: 'Analytics', allowedActions: ['access'] },
    { pageKey: 'analytics.queue', pageTitle: 'Queue Analytics', allowedActions: ['access', 'export_report'] },
    { pageKey: 'analytics.pending', pageTitle: 'Pending Allocation Analytics', allowedActions: ['access', 'export_report'] },
    { pageKey: 'analytics.active-allocations', pageTitle: 'Active Allocations', allowedActions: ['access', 'export_report'] },
    { pageKey: 'analytics.past-allocations', pageTitle: 'Past Allocations', allowedActions: ['access', 'export_report'] },
    { pageKey: 'accommodation', pageTitle: 'Accommodation', allowedActions: ['access'] },
    { pageKey: 'accommodation.units', pageTitle: 'DHQ Accommodation', allowedActions: ['access', 'add_quarters', 'edit', 'delete', 'import', 'export', 'view_history', 'maintenance_request', 'inventory'] },
    { pageKey: 'accommodation.types', pageTitle: 'Accommodation Types', allowedActions: ['access', 'add_type', 'edit', 'delete'] },
    { pageKey: 'maintenance', pageTitle: 'Maintenance', allowedActions: ['access'] },
    { pageKey: 'maintenance.tasks', pageTitle: 'Maintenance Tasks', allowedActions: ['access', 'new_task', 'edit', 'delete', 'mark_complete'] },
    { pageKey: 'maintenance.requests', pageTitle: 'Maintenance Requests', allowedActions: ['access', 'new_request', 'edit', 'delete', 'approve'] },
  ],
  // superadmin gets all permissions dynamically assigned
};

// Generate all permissions for superadmin
const generateSuperadminPermissions = () => {
  const allPages = [
    { key: 'dashboard', title: 'Dashboard', actions: ['access'] },
    { key: 'queue', title: 'Queue', actions: ['access'] },
    { key: 'queue.list', title: 'Queue List', actions: ['access', 'add_queue', 'edit', 'delete', 'allocate', 'export'] },
    { key: 'queue.units', title: 'Current Units', actions: ['access', 'add_quarters', 'edit', 'delete'] },
    { key: 'allocations', title: 'Allocations', actions: ['access'] },
    { key: 'allocations.pending', title: 'Pending Approval', actions: ['access', 'view_letter', 'approve', 'refuse'] },
    { key: 'allocations.active', title: 'Active Allocations', actions: ['access', 'view_letter', 'ejection_notice', 'transfer', 'post_out'] },
    { key: 'allocations.past', title: 'Past Allocations', actions: ['access', 'view_letter', 'delete'] },
    { key: 'allocations.clearance', title: 'Clearance', actions: ['access', 'inspect', 'generate_letter', 'delete'] },
    { key: 'allocations.stamp-settings', title: 'Stamp Settings', actions: ['access', 'add_stamp', 'edit', 'delete'] },
    { key: 'directory', title: 'Directory', actions: ['access', 'export_data'] },
    { key: 'personnel', title: 'Personnel', actions: ['access'] },
    { key: 'personnel.manage', title: 'Manage Personnel', actions: ['access', 'edit', 'delete', 'export'] },
    { key: 'analytics', title: 'Analytics', actions: ['access'] },
    { key: 'analytics.queue', title: 'Queue Analytics', actions: ['access', 'export_report'] },
    { key: 'analytics.pending', title: 'Pending Allocation Analytics', actions: ['access', 'export_report'] },
    { key: 'analytics.active-allocations', title: 'Active Allocations', actions: ['access', 'export_report'] },
    { key: 'analytics.past-allocations', title: 'Past Allocations', actions: ['access', 'export_report'] },
    { key: 'accommodation', title: 'Accommodation', actions: ['access'] },
    { key: 'accommodation.units', title: 'DHQ Accommodation', actions: ['access', 'add_quarters', 'edit', 'delete', 'import', 'export', 'view_history', 'maintenance_request', 'inventory'] },
    { key: 'accommodation.types', title: 'Accommodation Types', actions: ['access', 'add_type', 'edit', 'delete'] },
    { key: 'maintenance', title: 'Maintenance', actions: ['access'] },
    { key: 'maintenance.tasks', title: 'Maintenance Tasks', actions: ['access', 'new_task', 'edit', 'delete', 'mark_complete'] },
    { key: 'maintenance.requests', title: 'Maintenance Requests', actions: ['access', 'new_request', 'edit', 'delete', 'approve'] },
    { key: 'administration', title: 'Administration', actions: ['access'] },
    { key: 'administration.users', title: 'User Management', actions: ['access', 'create_user', 'edit_permissions', 'delete_user'] },
    { key: 'administration.roles', title: 'Role Profiles', actions: ['access', 'create_role', 'edit', 'delete'] },
    { key: 'administration.audit-logs', title: 'Audit Logs', actions: ['access', 'export_logs'] },
    { key: 'administration.auth-info', title: 'Authentication Info', actions: ['access', 'manage_sessions'] },
  ];

  return allPages.map(page => ({
    pageKey: page.key,
    pageTitle: page.title,
    allowedActions: page.actions,
  }));
};

const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
  role: z.enum(['user', 'moderator', 'admin', 'superadmin']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, fullName, role } = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);
    
    // Check if user is allowed to create users with specific roles
    const session = await getSession();
    let userRole: AppRole = AppRole.user; // Default role
    
    if (role && role !== 'user') {
      // Only superadmins can create users with roles other than 'user'
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required to create users with elevated roles' },
          { status: 401 }
        );
      }
      
      const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true }
      });
      
      if (currentUser?.profile?.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Only superadmins can create users with elevated roles' },
          { status: 403 }
        );
      }
      
      userRole = role as AppRole;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        hashedPassword,
        profile: {
          create: {
            fullName,
            role: userRole,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Assign default permissions based on role
    let permissions: Array<{
      pageKey: string;
      pageTitle: string;
      allowedActions: string[];
    }> = [];

    if (user.profile) {
      if (userRole === AppRole.superadmin) {
        permissions = generateSuperadminPermissions();
      } else if (userRole in DEFAULT_ROLE_PERMISSIONS) {
        permissions = DEFAULT_ROLE_PERMISSIONS[userRole as keyof typeof DEFAULT_ROLE_PERMISSIONS];
      }

      if (permissions.length > 0) {
        await prisma.pagePermission.createMany({
          data: permissions.map(perm => ({
            profileId: user.profile!.id,
            pageKey: perm.pageKey,
            pageTitle: perm.pageTitle,
            allowedActions: perm.allowedActions,
          })),
        });

        console.log(`Assigned ${permissions.length} default permissions to ${userRole} user: ${username}`);
      }
    }

    // Only create session if this is a self-signup (not created by admin)
    if (!session) {
      // Create session
      const token = await createSession(
        user.id,
        user.username,
        user.email,
        user.profile!.role,
        ipAddress,
        userAgent
      );

      // Set session cookie
      await setSessionCookie(token);
    }

    // Log signup action
    await AuditLogger.logAuth(
      session?.userId || user.id,
      'SIGNUP',
      { 
        username, 
        email, 
        role: userRole, 
        createdBy: session?.username,
        permissionsAssigned: permissions.length > 0 ? permissions.length : 0
      }
    );

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.profile!.fullName,
          role: user.profile!.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}