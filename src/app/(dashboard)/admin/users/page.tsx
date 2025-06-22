'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingState } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PagePermission {
  pageKey: string;
  pageTitle: string;
  parentKey: string | null;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  pagePermissions?: PagePermission[];
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define all available pages structure
const pageStructure = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    children: []
  },
  {
    key: 'queue',
    title: 'Queue',
    children: [
      { key: 'queue.list', title: 'Queue List' },
      { key: 'queue.units', title: 'Current Units' }
    ]
  },
  {
    key: 'allocations',
    title: 'Allocations',
    children: [
      { key: 'allocations.pending', title: 'Pending Approval' },
      { key: 'allocations.active', title: 'Active Allocations' },
      { key: 'allocations.past', title: 'Past Allocations' },
      { key: 'allocations.stamp-settings', title: 'Stamp Settings' }
    ]
  },
  {
    key: 'directory',
    title: 'Directory',
    children: []
  },
  {
    key: 'analytics',
    title: 'Analytics',
    children: [
      { key: 'analytics.queue', title: 'Queue Analytics' },
      { key: 'analytics.pending', title: 'Pending Analytics' },
      { key: 'analytics.active-allocations', title: 'Active Allocations' },
      { key: 'analytics.past-allocations', title: 'Past Allocations' }
    ]
  },
  {
    key: 'accommodation',
    title: 'Accommodation',
    children: [
      { key: 'accommodation.units', title: 'DHQ Accommodation' },
      { key: 'accommodation.types', title: 'Accommodation Types' }
    ]
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    children: [
      { key: 'maintenance.tasks', title: 'Maintenance Tasks' },
      { key: 'maintenance.requests', title: 'Maintenance Requests' }
    ]
  },
  {
    key: 'administration',
    title: 'Administration',
    children: [
      { key: 'administration.users', title: 'User Management' },
      { key: 'administration.roles', title: 'Role Profiles' },
      { key: 'administration.audit-logs', title: 'Audit Logs' },
      { key: 'administration.auth-info', title: 'Authentication Info' }
    ]
  }
];

export default function UserManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editLoading, setEditLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, PagePermission>>({});
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'user',
    password: ''
  });

  const { data: profiles = [], error, isLoading } = useSWR<Profile[]>(
    user?.profile?.role === 'superadmin' ? '/api/profiles' : null,
    fetcher
  );

  if (error) {
    console.error('Error fetching profiles:', error);
  }

  // Check if user is superadmin
  const isSuperAdmin = user?.profile?.role === 'superadmin';

  // Initialize permissions when creating new user
  useEffect(() => {
    if (isCreateModalOpen) {
      const initialPermissions: Record<string, PagePermission> = {};
      pageStructure.forEach(parent => {
        initialPermissions[parent.key] = {
          pageKey: parent.key,
          pageTitle: parent.title,
          parentKey: null,
          canView: false,
          canEdit: false,
          canDelete: false
        };
        parent.children.forEach(child => {
          initialPermissions[child.key] = {
            pageKey: child.key,
            pageTitle: child.title,
            parentKey: parent.key,
            canView: false,
            canEdit: false,
            canDelete: false
          };
        });
      });
      setSelectedPermissions(initialPermissions);
    }
  }, [isCreateModalOpen]);

  // Load permissions when editing user
  useEffect(() => {
    if (editingUser && editingUser.pagePermissions) {
      const initialPermissions: Record<string, PagePermission> = {};
      
      // First, initialize all permissions as false
      pageStructure.forEach(parent => {
        initialPermissions[parent.key] = {
          pageKey: parent.key,
          pageTitle: parent.title,
          parentKey: null,
          canView: false,
          canEdit: false,
          canDelete: false
        };
        parent.children.forEach(child => {
          initialPermissions[child.key] = {
            pageKey: child.key,
            pageTitle: child.title,
            parentKey: parent.key,
            canView: false,
            canEdit: false,
            canDelete: false
          };
        });
      });
      
      // Then, apply the actual permissions
      editingUser.pagePermissions.forEach(perm => {
        initialPermissions[perm.pageKey] = perm;
      });
      
      setSelectedPermissions(initialPermissions);
    }
  }, [editingUser]);

  const handlePermissionChange = (pageKey: string, permission: 'canView' | 'canEdit' | 'canDelete', checked: boolean) => {
    setSelectedPermissions(prev => {
      const newPermissions = { ...prev };
      
      // If enabling edit or delete, also enable view
      if ((permission === 'canEdit' || permission === 'canDelete') && checked) {
        newPermissions[pageKey] = {
          ...newPermissions[pageKey],
          canView: true,
          [permission]: checked
        };
      } else if (permission === 'canView' && !checked) {
        // If disabling view, also disable edit and delete
        newPermissions[pageKey] = {
          ...newPermissions[pageKey],
          canView: false,
          canEdit: false,
          canDelete: false
        };
      } else {
        newPermissions[pageKey] = {
          ...newPermissions[pageKey],
          [permission]: checked
        };
      }

      // Handle parent-child relationships
      const parentPage = pageStructure.find(p => p.key === pageKey);
      if (parentPage && parentPage.children.length > 0) {
        // If parent is checked/unchecked, update all children
        parentPage.children.forEach(child => {
          if (permission === 'canView' && !checked) {
            newPermissions[child.key] = {
              ...newPermissions[child.key],
              canView: false,
              canEdit: false,
              canDelete: false
            };
          } else if (permission === 'canView' && checked) {
            newPermissions[child.key] = {
              ...newPermissions[child.key],
              canView: true
            };
          }
        });
      }
      
      // If enabling a child, ensure parent is also enabled
      if (permission === 'canView' && checked) {
        // Find if this is a child page
        const childPage = pageStructure.find(p => 
          p.children.some(child => child.key === pageKey)
        );
        if (childPage) {
          newPermissions[childPage.key] = {
            ...newPermissions[childPage.key],
            canView: true
          };
        }
      }
      
      // If disabling a parent, disable all children
      if (permission === 'canView' && !checked) {
        const parent = pageStructure.find(p => p.key === pageKey);
        if (parent && parent.children.length > 0) {
          parent.children.forEach(child => {
            newPermissions[child.key] = {
              ...newPermissions[child.key],
              canView: false,
              canEdit: false,
              canDelete: false
            };
          });
        }
      }

      return newPermissions;
    });
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error("Username and password are required");
      return;
    }

    setCreating(true);
    try {
      const email = `${newUser.username}@dap.mil`;
      
      // Convert selectedPermissions to array format
      const permissions = Object.values(selectedPermissions).filter(p => p.canView);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: newUser.password,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          permissions: permissions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating user:', error);
        toast.error(error.error || "Failed to create user");
      } else {
        toast.success("User created successfully");
        setNewUser({ username: '', fullName: '', role: 'user', password: '' });
        setSelectedPermissions({});
        setIsCreateModalOpen(false);
        mutate('/api/profiles');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setEditLoading(editingUser.id);
    try {
      // Convert selectedPermissions to array format
      const permissions = Object.values(selectedPermissions).filter(p => p.canView);
      
      const response = await fetch(`/api/profiles/${editingUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: permissions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating user:', error);
        toast.error(error.error || "Failed to update user permissions");
      } else {
        toast.success("User permissions updated successfully");
        setIsEditModalOpen(false);
        setEditingUser(null);
        setSelectedPermissions({});
        mutate('/api/profiles');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setEditLoading(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (authLoading || isLoading) {
    return <LoadingState isLoading={true}>{null}</LoadingState>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-semibold">Access Denied</p>
              <p className="text-muted-foreground">Only superadmins can manage users.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">Error loading users. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Page Permissions</Label>
                <p className="text-sm text-muted-foreground">Select which pages this user can access</p>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <Accordion type="multiple" className="w-full">
                    {pageStructure.map((parent) => (
                      <AccordionItem key={parent.key} value={parent.key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{parent.title}</span>
                            <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center space-x-1">
                                <Checkbox
                                  checked={selectedPermissions[parent.key]?.canView || false}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(parent.key, 'canView', checked as boolean)
                                  }
                                />
                                <Label className="text-xs">View</Label>
                              </div>
                              {parent.children.length === 0 && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Checkbox
                                      checked={selectedPermissions[parent.key]?.canEdit || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(parent.key, 'canEdit', checked as boolean)
                                      }
                                    />
                                    <Label className="text-xs">Edit</Label>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Checkbox
                                      checked={selectedPermissions[parent.key]?.canDelete || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(parent.key, 'canDelete', checked as boolean)
                                      }
                                    />
                                    <Label className="text-xs">Delete</Label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        {parent.children.length > 0 && (
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {parent.children.map((child) => (
                                <div key={child.key} className="flex items-center justify-between py-2">
                                  <span className="text-sm">{child.title}</span>
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canView || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canView', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">View</Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canEdit || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canEdit', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">Edit</Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canDelete || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canDelete', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">Delete</Label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
              
              <LoadingButton onClick={handleCreateUser} className="w-full" loading={creating}>
                Create User
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.user.username}</TableCell>
                  <TableCell>{profile.fullName || 'N/A'}</TableCell>
                  <TableCell>{profile.user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(profile.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {profile.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <LoadingButton 
                        variant="outline" 
                        size="sm"
                        loading={editLoading === profile.id}
                        onClick={() => {
                          setEditingUser(profile);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </LoadingButton>
                      <LoadingButton 
                        variant="outline" 
                        size="sm"
                        loading={deleteLoading === profile.id}
                        onClick={() => {
                          setDeleteLoading(profile.id);
                          // TODO: Implement delete functionality
                          setTimeout(() => setDeleteLoading(null), 1000);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </LoadingButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">User: {editingUser.user.username}</p>
                <p className="text-sm text-muted-foreground">Email: {editingUser.user.email}</p>
                <p className="text-sm text-muted-foreground">Role: {editingUser.role}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Page Permissions</Label>
                <p className="text-sm text-muted-foreground">Select which pages this user can access</p>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <Accordion type="multiple" className="w-full">
                    {pageStructure.map((parent) => (
                      <AccordionItem key={parent.key} value={parent.key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{parent.title}</span>
                            <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center space-x-1">
                                <Checkbox
                                  checked={selectedPermissions[parent.key]?.canView || false}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(parent.key, 'canView', checked as boolean)
                                  }
                                />
                                <Label className="text-xs">View</Label>
                              </div>
                              {parent.children.length === 0 && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Checkbox
                                      checked={selectedPermissions[parent.key]?.canEdit || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(parent.key, 'canEdit', checked as boolean)
                                      }
                                    />
                                    <Label className="text-xs">Edit</Label>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Checkbox
                                      checked={selectedPermissions[parent.key]?.canDelete || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(parent.key, 'canDelete', checked as boolean)
                                      }
                                    />
                                    <Label className="text-xs">Delete</Label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        {parent.children.length > 0 && (
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {parent.children.map((child) => (
                                <div key={child.key} className="flex items-center justify-between py-2">
                                  <span className="text-sm">{child.title}</span>
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canView || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canView', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">View</Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canEdit || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canEdit', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">Edit</Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Checkbox
                                        checked={selectedPermissions[child.key]?.canDelete || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(child.key, 'canDelete', checked as boolean)
                                        }
                                      />
                                      <Label className="text-xs">Delete</Label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
              
              <LoadingButton onClick={handleEditUser} className="w-full" loading={editLoading === editingUser.id}>
                Update Permissions
              </LoadingButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}