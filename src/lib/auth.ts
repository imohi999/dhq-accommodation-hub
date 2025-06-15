import NextAuth from 'next-auth'
import { authConfig } from './auth-config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Extend the built-in types
declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      role: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: string
  }
}