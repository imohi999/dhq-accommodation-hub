import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession, setSessionCookie, getClientInfo } from '@/lib/auth-utils';
import { AuditLogger } from '@/lib/audit-logger';

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: {
        profile: {
          include: {
            pagePermissions: true
          }
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.hashedPassword);
    if (!isValidPassword) {
      // Log failed login attempt
      await AuditLogger.logAuth(
        user.id,
        'FAILED_LOGIN',
        { username }
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession(
      user.id,
      user.username,
      user.email,
      user.profile?.role || 'user',
      ipAddress,
      userAgent
    );

    // Set session cookie
    try {
      await setSessionCookie(token);
    } catch (cookieError) {
      console.error('Failed to set session cookie:', cookieError);
      // Still continue with the response as the session was created
    }

    // Log successful login
    await AuditLogger.logAuth(
      user.id,
      'LOGIN',
      { username: user.username, ipAddress }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile ? {
          id: user.profile.id,
          userId: user.profile.userId,
          fullName: user.profile.fullName,
          role: user.profile.role,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
          pagePermissions: user.profile.pagePermissions
        } : undefined,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}