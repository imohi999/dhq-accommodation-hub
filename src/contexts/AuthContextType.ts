import { createContext } from 'react';

export interface PagePermission {
  id: string;
  profileId: string;
  pageKey: string;
  pageTitle: string;
  parentKey: string | null;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  pagePermissions?: PagePermission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthError {
  message?: string;
  code?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (username: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, username: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);