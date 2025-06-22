import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent auth-related logs for the user
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: session.userId,
        action: {
          in: ['LOGIN', 'LOGOUT', 'SIGNUP', 'FAILED_LOGIN'],
        },
      },
      select: {
        id: true,
        action: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}