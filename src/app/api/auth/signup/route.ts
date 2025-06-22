import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, setSessionCookie, getClientInfo } from '@/lib/auth-utils';

const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
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

    const { username, email, password, fullName } = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);

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
            role: 'user',
          },
        },
      },
      include: {
        profile: true,
      },
    });

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
    await setSessionCookie(token);

    // Log signup action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP',
        entityType: 'user',
        entityId: user.id,
        newData: { username, email },
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.profile?.fullName,
          role: user.profile?.role,
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