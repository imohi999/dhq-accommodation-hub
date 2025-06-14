
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  role: string;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch');
  }
  return res.json();
});

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const { data: profile, error, isLoading } = useSWR<UserProfile>(
    user?.id ? `/api/profiles/${user.id}` : null,
    fetcher
  );

  if (error) {
    console.error('Error fetching profile:', error);
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-[#DC143C] text-white';
      case 'admin':
        return 'bg-[#1B365D] text-white';
      case 'moderator':
        return 'bg-[#4F9CDB] text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#1B365D]">Loading profile...</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-[#1B365D] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-[#1B365D]">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile ? (
          <>
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <p className="text-[#1B365D] font-medium">{profile.username}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-[#1B365D] font-medium">{profile.fullName || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Primary Role</label>
              <div className="mt-1">
                <Badge className={getRoleColor(profile.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {profile.role.toUpperCase()}
                </Badge>
              </div>
            </div>

          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Profile data will be available after account confirmation</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">User ID: {user?.id}</p>
              <p className="text-sm text-gray-500">Email: {user?.email}</p>
            </div>
          </div>
        )}
        
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full mt-6 border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C] hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
