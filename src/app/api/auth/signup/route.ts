import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, setSessionCookie, getClientInfo, getSession } from '@/lib/auth-utils';
import { AppRole } from '@prisma/client';
import { AuditLogger } from '@/lib/audit-logger';

const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
  role: z.enum(['user', 'moderator', 'admin', 'superadmin']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, fullName, role } = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);
    
    // Check if user is allowed to create users with specific roles
    const session = await getSession();
    let userRole: AppRole = AppRole.user; // Default role
    
    if (role && role !== 'user') {
      // Only superadmins can create users with roles other than 'user'
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required to create users with elevated roles' },
          { status: 401 }
        );
      }
      
      const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true }
      });
      
      if (currentUser?.profile?.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Only superadmins can create users with elevated roles' },
          { status: 403 }
        );
      }
      
      userRole = role as AppRole;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        hashedPassword,
        profile: {
          create: {
            fullName,
            role: userRole,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Only create session if this is a self-signup (not created by admin)
    if (!session) {
      // Create session
      const token = await createSession(
        user.id,
        user.username,
        user.email,
        user.profile!.role,
        ipAddress,
        userAgent
      );

      // Set session cookie
      await setSessionCookie(token);
    }

    // Log signup action
    await AuditLogger.logAuth(
      session?.userId || user.id,
      'SIGNUP',
      { username, email, role: userRole, createdBy: session?.username }
    );

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.profile!.fullName,
          role: user.profile!.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}