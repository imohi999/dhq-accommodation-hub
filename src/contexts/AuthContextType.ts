import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  profile?: {
    id: string;
    userId: string;
    username: string;
    fullName: string | null;
    role: string;
  };
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
  signUp: (username: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);