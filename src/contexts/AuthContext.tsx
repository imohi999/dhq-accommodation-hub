
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import { AuthContext, User, Session } from './AuthContextType';

const sessionFetcher = (url: string) => 
  fetch(url)
    .then((res) => res.json())
    .then((data) => data);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Use SWR to check session
  const { data: sessionData, isLoading } = useSWR(
    '/api/auth/session',
    sessionFetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user);
      setSession(sessionData.session);
    } else {
      setUser(null);
      setSession(null);
    }
  }, [sessionData]);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Auth failed:', data.error);
        toast.error(data.error || 'Invalid credentials. Please check your username and password.');
        return { error: data.error };
      } else {
        // Update local state
        setUser(data.user);
        setSession({
          user: data.user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        
        // Trigger SWR revalidation
        await mutate('/api/auth/session');
        
        toast.success('Successfully signed in!');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const signUp = async (email: string, username: string, password: string, fullName?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Sign up error:', data.error);
        if (data.error === 'Username or email already exists') {
          toast.error('Username or email already exists. Please sign in instead.');
        } else {
          toast.error(data.error || 'Failed to create account');
        }
        return { error: data.error };
      } else {
        // Update local state after successful signup
        setUser(data.user);
        setSession({
          user: data.user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        
        // Trigger SWR revalidation
        await mutate('/api/auth/session');
        
        toast.success('Account created successfully!');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Sign out error');
        toast.error('Error signing out');
      } else {
        // Clear local state
        setUser(null);
        setSession(null);
        
        // Trigger SWR revalidation
        await mutate('/api/auth/session');
        
        toast.success('Signed out successfully');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear state even if request fails
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    }
  };

  const changePassword = async (userId: string, currentPassword: string | null, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Change password error:', data.error);
        toast.error(data.error || 'Failed to change password');
        return { error: data.error };
      } else {
        toast.success('Password changed successfully');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected change password error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    changePassword,
    loading: isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
