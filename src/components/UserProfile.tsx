
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: string;
  roles: string[];
}

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { _user_id: user.id });

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data && data.length > 0) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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
              <p className="text-[#1B365D] font-medium">{profile.full_name || 'Not provided'}</p>
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

            {profile.roles && profile.roles.length > 1 && (
              <div>
                <label className="text-sm font-medium text-gray-600">All Roles</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.roles.map((role, index) => (
                    <Badge key={index} className={getRoleColor(role)}>
                      {role.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
