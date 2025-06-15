import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // Find user by username through profile
    const profile = await prisma.profile.findUnique({
      where: { username },
      include: { user: true },
    })
    
    if (!profile || !profile.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, profile.user.hashedPassword || '')
    
    return NextResponse.json({
      username,
      userFound: !!profile,
      hasUser: !!profile.user,
      hasPassword: !!profile.user.hashedPassword,
      passwordValid: isValid,
      userId: profile.user.id,
      email: profile.user.email,
      role: profile.role,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}