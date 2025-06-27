import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityId, oldData, newData, metadata } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Log the client action
    await AuditLogger.log({
      userId: session.userId,
      action: action as any,
      entityType: entityType as any,
      entityId,
      oldData,
      newData: {
        ...newData,
        metadata,
        source: 'client',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging client audit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}