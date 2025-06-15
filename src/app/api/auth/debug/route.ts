import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await auth()
  
  // Check database connection and admin user
  let dbInfo = {
    connected: false,
    userCount: 0,
    profileCount: 0,
    adminExists: false,
    adminHasPassword: false,
  }
  
  try {
    const userCount = await prisma.user.count()
    const profileCount = await prisma.profile.count()
    const adminProfile = await prisma.profile.findUnique({
      where: { username: 'admin' },
      include: { user: true }
    })
    
    dbInfo = {
      connected: true,
      userCount,
      profileCount,
      adminExists: !!adminProfile,
      adminHasPassword: !!(adminProfile?.user?.hashedPassword),
    }
  } catch (error) {
    console.error('Database error:', error)
  }
  
  // Check cookies
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('next-auth.session-token') || 
                      cookieStore.get('__Secure-next-auth.session-token')
  
  return NextResponse.json({
    session,
    database: dbInfo,
    cookies: {
      hasSessionToken: !!sessionToken,
      sessionTokenName: sessionToken?.name,
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    },
    environment: {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  })
}