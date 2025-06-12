
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (username: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user for demo purposes when Supabase auth is disabled
const createMockUser = (username: string): User => ({
  id: '00000000-0000-0000-0000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: `${username}@dap.mil`,
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'mock' },
  user_metadata: { username, role: 'superadmin' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false
});

const createMockSession = (user: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session first
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          // Check for mock session in localStorage
          const mockSession = localStorage.getItem('mock-session');
          if (mockSession) {
            const parsedSession = JSON.parse(mockSession);
            setSession(parsedSession);
            setUser(parsedSession.user);
          }
        }
      } catch (error) {
        console.log('Session check failed, using mock auth:', error);
        // Check for mock session in localStorage
        const mockSession = localStorage.getItem('mock-session');
        if (mockSession) {
          const parsedSession = JSON.parse(mockSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
        }
      }
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // First try Supabase auth
      const email = `${username}@dap.mil`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Supabase auth failed, using mock auth:', error.message);
        
        // Fallback to mock authentication for demo purposes
        if (username === 'superadmin' && password === 'admin123') {
          const mockUser = createMockUser(username);
          const mockSession = createMockSession(mockUser);
          
          // Store in localStorage for persistence
          localStorage.setItem('mock-session', JSON.stringify(mockSession));
          
          setUser(mockUser);
          setSession(mockSession);
          
          toast.success('Successfully signed in! (Demo Mode)');
          return { error: null };
        } else {
          toast.error('Invalid credentials');
          return { error: { message: 'Invalid credentials' } };
        }
      } else {
        toast.success('Successfully signed in!');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signUp = async (username: string, password: string, fullName?: string) => {
    try {
      const email = `${username}@dap.mil`;
      
      let role = 'user';
      if (username === 'superadmin') {
        role = 'superadmin';
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username,
            full_name: fullName || '',
            role: role
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('User already exists. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
      }

      return { error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Also clear mock session
      localStorage.removeItem('mock-session');
      setUser(null);
      setSession(null);
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      // Clear mock session even if Supabase fails
      localStorage.removeItem('mock-session');
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
