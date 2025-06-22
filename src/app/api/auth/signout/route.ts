import { NextRequest, NextResponse } from 'next/server';
import { getSession, clearSessionCookie, deleteSession, getClientInfo } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const { ipAddress, userAgent } = getClientInfo(request);

    if (session) {
      // Delete session from database
      await deleteSession(session.sessionId);

      // Log signout action
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'LOGOUT',
          entityType: 'user',
          entityId: session.userId,
          ipAddress,
          userAgent,
        },
      });
    }

    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}