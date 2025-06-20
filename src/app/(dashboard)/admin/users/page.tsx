'use client';

import React, { useState } from 'react';
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
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface Profile {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editLoading, setEditLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'user',
    password: ''
  });

  const { data: profiles = [], error, isLoading } = useSWR<Profile[]>('/api/profiles', fetcher);

  if (error) {
    console.error('Error fetching profiles:', error);
  }

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error("Username and password are required");
      return;
    }

    setCreating(true);
    try {
      const email = `${newUser.username}@dap.mil`;
      
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
          role: newUser.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating user:', error);
        toast.error(error.error || "Failed to create user");
      } else {
        toast.success("User created successfully");
        setNewUser({ username: '', fullName: '', role: 'user', password: '' });
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

  if (isLoading) {
    return <LoadingState isLoading={true}>{null}</LoadingState>;
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
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
                  <TableCell className="font-medium">{profile.username}</TableCell>
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
                          setEditLoading(profile.id);
                          // TODO: Implement edit functionality
                          setTimeout(() => setEditLoading(null), 1000);
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
    </div>
  );
}