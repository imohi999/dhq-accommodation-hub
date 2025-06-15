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

export default function RoleProfilesPage() {
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
      permissions: ['user_management', 'queue_management', 'allocations_management'],
      createdAt: '2024-01-01'
    }
  ]);

  const [permissions] = useState<Permission[]>([
    { id: 'dashboard_view', module: 'Dashboard', action: 'View', description: 'View dashboard' },
    { id: 'queue_view', module: 'Queue', action: 'View', description: 'View queue' },
    { id: 'queue_edit', module: 'Queue', action: 'Edit', description: 'Edit queue items' },
    { id: 'queue_delete', module: 'Queue', action: 'Delete', description: 'Delete queue items' },
    { id: 'allocations_view', module: 'Allocations', action: 'View', description: 'View allocations' },
    { id: 'allocations_edit', module: 'Allocations', action: 'Edit', description: 'Edit allocations' },
    { id: 'allocations_delete', module: 'Allocations', action: 'Delete', description: 'Delete allocations' },
    { id: 'user_management', module: 'Users', action: 'Manage', description: 'Manage users' },
    { id: 'role_management', module: 'Roles', action: 'Manage', description: 'Manage roles' },
    { id: 'audit_view', module: 'Audit', action: 'View', description: 'View audit trail' },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleCreateRole = () => {
    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', permissions: [] });
    setIsCreateModalOpen(false);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setNewRole({ ...newRole, permissions: [...newRole.permissions, permissionId] });
    } else {
      setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permissionId) });
    }
  };

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
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={newRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        <div className="font-medium">{permission.module} - {permission.action}</div>
                        <div className="text-muted-foreground">{permission.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateRole} className="w-full">
                Create Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
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