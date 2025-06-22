import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { 
        profile: {
          include: {
            pagePermissions: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

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
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}