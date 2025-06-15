import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { username, password } = loginSchema.parse(credentials)

          // Find user by username through profile
          const profile = await prisma.profile.findUnique({
            where: { username },
            include: { user: true },
          })

          if (!profile || !profile.user || !profile.user.hashedPassword) {
            console.log('User not found or no password')
            return null
          }

          const isPasswordValid = await compare(password, profile.user.hashedPassword)

          if (!isPasswordValid) {
            console.log('Invalid password')
            return null
          }

          // Return user object that matches NextAuth expected format
          const user = {
            id: profile.user.id,
            email: profile.user.email!,
            name: profile.fullName || profile.username,
            image: profile.user.image,
          }
          
          // Store role in a way that can be accessed in callbacks
          return user
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Initial sign in
        token.id = user.id || ''
        
        // Fetch the user's role from the database
        const profile = await prisma.profile.findFirst({
          where: { userId: user.id },
        })
        
        token.role = profile?.role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}