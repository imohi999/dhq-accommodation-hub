import { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config without bcryptjs
export const authEdgeConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  providers: [], // No providers needed for middleware
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login')
      
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }
      
      return isLoggedIn
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}