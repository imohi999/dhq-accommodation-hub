'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// REAL ACTIONS based on actual dashboard pages
const PAGE_ACTIONS = {
	dashboard: ["access"],
	queue: ["access"],
	"queue.list": ["access", "add_queue", "edit", "delete", "allocate", "export"],
	"queue.units": ["access", "add_quarters", "edit", "delete"],
	allocations: ["access"],
	"allocations.pending": ["access", "view_letter", "approve", "refuse"],
	"allocations.active": [
		"access",
		"view_letter",
		"ejection_notice",
		"transfer",
		"post_out",
	],
	"allocations.past": ["access", "view_letter", "delete"],
	"allocations.clearance": ["access", "inspect", "generate_letter", "delete"],
	"allocations.stamp-settings": ["access", "add_stamp", "edit", "delete"],
	directory: ["access", "export_data"],
	personnel: ["access"],
	"personnel.manage": ["access", "edit", "delete", "export"],
	analytics: ["access"],
	"analytics.queue": ["access", "export_report"],
	"analytics.pending": ["access", "export_report"],
	"analytics.active-allocations": ["access", "export_report"],
	"analytics.past-allocations": ["access", "export_report"],
	accommodation: ["access"],
	"accommodation.units": [
		"access",
		"add_quarters",
		"edit",
		"delete",
		"import",
		"export",
		"view_history",
		"maintenance_request",
		"inventory",
	],
	"accommodation.types": ["access", "add_type", "edit", "delete"],
	maintenance: ["access"],
	"maintenance.tasks": [
		"access",
		"new_task",
		"edit",
		"delete",
		"mark_complete",
	],
	"maintenance.requests": [
		"access",
		"new_request",
		"edit",
		"delete",
		"approve",
	],
	administration: ["access"],
	"administration.users": [
		"access",
		"create_user",
		"edit_permissions",
		"delete_user",
	],
	"administration.roles": ["access", "create_role", "edit", "delete"],
	"administration.audit-logs": ["access", "export_logs"],
	"administration.auth-info": ["access", "manage_sessions"],
};

// User-friendly action names
const ACTION_LABELS = {
	access: "Access",
	add_queue: "Add Queue",
	edit: "Edit",
	delete: "Delete",
	allocate: "Allocate",
	export: "Export",
	add_quarters: "Add Unit",
	view_letter: "View Letter",
	approve: "Approve",
	refuse: "Refuse",
	ejection_notice: "Ejection Notice",
	transfer: "Transfer",
	post_out: "Post Out",
	add_stamp: "Add Stamp",
	import: "Import",
	view_history: "View History",
	maintenance_request: "Maintenance Request",
	inventory: "Inventory",
	add_type: "Add Type",
	new_request: "New Request",
	new_task: "New Task",
	mark_complete: "Mark Complete",
	create_user: "Create User",
	edit_permissions: "Edit Permissions",
	delete_user: "Delete User",
	create_role: "Create Role",
	export_logs: "Export Logs",
	manage_sessions: "Manage Sessions",
	export_report: "Export Report",
	export_data: "Export Data",
	inspect: "Inspect",
	generate_letter: "Generate Letter",
};

// Page structure for hierarchy
const PAGES = [
	{
		key: "dashboard",
		title: "Dashboard",
		children: [],
	},
	{
		key: "queue",
		title: "Queue",
		children: [
			{ key: "queue.list", title: "Queue List" },
			{ key: "queue.units", title: "Current Units" },
		],
	},
	{
		key: "allocations",
		title: "Allocations",
		children: [
			{ key: "allocations.pending", title: "Pending Approval" },
			{ key: "allocations.active", title: "Active Allocations" },
			{ key: "allocations.past", title: "Past Allocations" },
			{ key: "allocations.clearance", title: "Clearance" },
			{ key: "allocations.stamp-settings", title: "Stamp Settings" },
		],
	},
	{
		key: "directory",
		title: "Directory",
		children: [],
	},
	{
		key: "personnel",
		title: "Personnel",
		children: [
			{ key: "personnel.manage", title: "Manage Personnel" },
		],
	},
	{
		key: "analytics",
		title: "Analytics",
		children: [
			{ key: "analytics.queue", title: "Queue Analytics" },
			{ key: "analytics.pending", title: "Pending Allocation Analytics" },
			{ key: "analytics.active-allocations", title: "Active Allocations" },
			{ key: "analytics.past-allocations", title: "Past Allocations" },
		],
	},
	{
		key: "accommodation",
		title: "Accommodation",
		children: [
			{ key: "accommodation.units", title: "DHQ Accommodation" },
			{ key: "accommodation.types", title: "Accommodation Types" },
		],
	},
	{
		key: "maintenance",
		title: "Maintenance",
		children: [
			{ key: "maintenance.tasks", title: "Maintenance Tasks" },
			{ key: "maintenance.requests", title: "Maintenance Requests" },
		],
	},
	{
		key: "administration",
		title: "Administration",
		children: [
			{ key: "administration.users", title: "User Management" },
			{ key: "administration.roles", title: "Role Profiles" },
			{ key: "administration.audit-logs", title: "Audit Logs" },
			{ key: "administration.auth-info", title: "Authentication Info" },
		],
	},
];

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

// Simple permission row component
function PermissionRow({
  pageKey,
  pageTitle,
  userActions,
  onActionChange,
}: {
  pageKey: string;
  pageTitle: string;
  userActions: string[];
  onActionChange: (pageKey: string, action: string, checked: boolean) => void;
}) {
  const availableActions = PAGE_ACTIONS[
    pageKey as keyof typeof PAGE_ACTIONS
  ] || ["access"];

  const allActionsSelected = availableActions.every((action) =>
    userActions.includes(action)
  );

  const handleSelectAll = () => {
    if (allActionsSelected) {
      // Deselect all actions
      availableActions.forEach((action) => {
        onActionChange(pageKey, action, false);
      });
    } else {
      // Select all actions
      availableActions.forEach((action) => {
        if (!userActions.includes(action)) {
          onActionChange(pageKey, action, true);
        }
      });
    }
  };

  return (
    <div className='flex items-start justify-between py-3 border-b'>
      <div className='flex-1'>
        <h4 className='font-medium text-sm'>{pageTitle}</h4>
        <p className='text-xs text-muted-foreground mt-1'>
          {availableActions.length} action
          {availableActions.length !== 1 ? "s" : ""} available
        </p>
      </div>
      <div className='flex items-center space-x-3 flex-wrap gap-2 max-w-md'>
        {availableActions.length > 1 && (
          <>
            <div className='flex items-center space-x-1'>
              <Checkbox
                checked={allActionsSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label className='text-xs whitespace-nowrap font-medium'>
                Select All
              </Label>
            </div>
            <div className='w-px h-4 bg-border' />
          </>
        )}
        {availableActions.map((action) => (
          <div key={action} className='flex items-center space-x-1'>
            <Checkbox
              checked={userActions.includes(action)}
              onCheckedChange={(checked) =>
                onActionChange(pageKey, action, !!checked)
              }
            />
            <Label className='text-xs whitespace-nowrap'>
              {ACTION_LABELS[action as keyof typeof ACTION_LABELS]}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoleProfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const isSuperAdmin = user?.profile?.role === "superadmin";
  
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'superadmin',
      description: 'Full system access',
      permissions: ['all'],
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'admin',
      description: 'Administrative access',
      permissions: [
        'dashboard.access',
        'queue.access', 'queue.list.access', 'queue.list.add_queue', 'queue.list.edit', 'queue.list.delete', 'queue.list.allocate',
        'allocations.access', 'allocations.pending.access', 'allocations.pending.approve', 'allocations.pending.refuse',
        'allocations.active.access', 'allocations.active.transfer', 'allocations.active.post_out',
        'personnel.access', 'personnel.manage.access', 'personnel.manage.edit',
        'accommodation.access', 'accommodation.units.access', 'accommodation.units.edit'
      ],
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'moderator',
      description: 'Limited administrative access',
      permissions: [
        'dashboard.access',
        'queue.access', 'queue.list.access', 'queue.list.edit',
        'allocations.access', 'allocations.pending.access', 'allocations.active.access',
        'personnel.access', 'personnel.manage.access'
      ],
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'user',
      description: 'Basic user access',
      permissions: [
        'dashboard.access',
        'queue.access', 'queue.list.access',
        'directory.access'
      ],
      createdAt: '2024-01-01'
    }
  ]);

  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, string[]>>({});
  const [viewingPermissions, setViewingPermissions] = useState<Role | null>(null);
  const [isViewPermissionsModalOpen, setIsViewPermissionsModalOpen] = useState(false);

  const handleCreateRole = () => {
    // Convert page-based permissions to flat array
    const flatPermissions = Object.entries(newRolePermissions)
      .filter(([_, actions]) => actions.length > 0)
      .flatMap(([pageKey, actions]) => 
        actions.map(action => `${pageKey}.${action}`)
      );

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: flatPermissions,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', permissions: [] });
    setNewRolePermissions({});
    setIsCreateModalOpen(false);
  };

  const handleActionChange = (
    pageKey: string,
    action: string,
    checked: boolean
  ) => {
    setNewRolePermissions((prev) => {
      const newPermissions = { ...prev };
      const currentActions = newPermissions[pageKey] || [];

      if (checked) {
        // Add action if not present
        if (!currentActions.includes(action)) {
          newPermissions[pageKey] = [...currentActions, action];
        }

        // Auto-enable access if adding any action
        if (action !== "access" && !currentActions.includes("access")) {
          newPermissions[pageKey] = ["access", ...newPermissions[pageKey]];
        }

        // Auto-enable parent access for child pages
        const parent = PAGES.find((p) =>
          p.children.some((c) => c.key === pageKey)
        );
        if (parent && !newPermissions[parent.key]?.includes("access")) {
          newPermissions[parent.key] = ["access"];
        }
      } else {
        // Remove action
        newPermissions[pageKey] = currentActions.filter((a) => a !== action);

        // If removing access, remove all actions for this page
        if (action === "access") {
          newPermissions[pageKey] = [];

          // Also remove access from child pages
          const parentPage = PAGES.find((p) => p.key === pageKey);
          if (parentPage) {
            parentPage.children.forEach((child) => {
              newPermissions[child.key] = [];
            });
          }
        }
      }

      return newPermissions;
    });
  };

  if (authLoading) {
    return <LoadingState isLoading={true}>{null}</LoadingState>;
  }

  if (!isSuperAdmin) {
    return (
      <div className='flex justify-center p-8'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <Shield className='h-12 w-12 text-muted-foreground mx-auto' />
              <p className='text-lg font-semibold'>Access Denied</p>
              <p className='text-muted-foreground'>
                Only superadmins can manage roles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Role Profiles</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Page Permissions</Label>
                    <p className='text-sm text-muted-foreground'>
                      Configure which actions this role can perform on each page
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      const newPermissions: Record<string, string[]> = {};
                      PAGES.forEach((page) => {
                        const actions =
                          PAGE_ACTIONS[page.key as keyof typeof PAGE_ACTIONS] ||
                          [];
                        newPermissions[page.key] = [...actions];
                        page.children.forEach((child) => {
                          const childActions =
                            PAGE_ACTIONS[
                              child.key as keyof typeof PAGE_ACTIONS
                            ] || [];
                          newPermissions[child.key] = [...childActions];
                        });
                      });
                      setNewRolePermissions(newPermissions);
                    }}
                    className='text-xs'>
                    Grant All Permissions
                  </Button>
                </div>
                <ScrollArea className='h-[300px] border rounded-md p-4'>
                  <div className='space-y-1'>
                    {PAGES.map((page) => (
                      <div key={page.key}>
                        {/* Parent page permissions */}
                        <PermissionRow
                          pageKey={page.key}
                          pageTitle={page.title}
                          userActions={newRolePermissions[page.key] || []}
                          onActionChange={handleActionChange}
                        />

                        {/* Child page permissions */}
                        {page.children.map((child) => (
                          <div key={child.key} className='ml-6'>
                            <PermissionRow
                              pageKey={child.key}
                              pageTitle={child.title}
                              userActions={newRolePermissions[child.key] || []}
                              onActionChange={handleActionChange}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Button onClick={handleCreateRole} className="w-full">
                Create Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Permissions Modal */}
      <Dialog 
        open={isViewPermissionsModalOpen} 
        onOpenChange={(open) => {
          setIsViewPermissionsModalOpen(open);
          if (!open) {
            setViewingPermissions(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Permissions</DialogTitle>
          </DialogHeader>
          {viewingPermissions && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Shield className="w-3 h-3 mr-1" />
                    {viewingPermissions.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {viewingPermissions.permissions.length} permissions
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {viewingPermissions.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">All Permissions</Label>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {viewingPermissions.permissions.map((permission, index) => {
                      // Parse permission to show page and action
                      const parts = permission.split('.');
                      const pageKey = parts.slice(0, -1).join('.');
                      const action = parts[parts.length - 1];
                      
                      // Find page title
                      const page = PAGES.find(p => p.key === pageKey) || 
                                   PAGES.flatMap(p => p.children).find(c => c.key === pageKey);
                      const pageTitle = page?.title || pageKey;
                      
                      // Get action label
                      const actionLabel = ACTION_LABELS[action as keyof typeof ACTION_LABELS] || action;
                      
                      return (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{pageTitle}</span>
                            <span className="text-xs text-muted-foreground font-mono">{permission}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {actionLabel}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewPermissionsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">
                      <Shield className="w-3 h-3 mr-1" />
                      {role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                                onClick={() => {
                                  setViewingPermissions(role);
                                  setIsViewPermissionsModalOpen(true);
                                }}
                              >
                                +{role.permissions.length - 3} more
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to view all permissions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{role.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}