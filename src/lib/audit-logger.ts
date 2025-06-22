import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getSession, getClientInfo } from '@/lib/auth-utils';

export interface AuditLogData {
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
}

export async function createAuditLog(
  request: NextRequest,
  data: AuditLogData
) {
  try {
    const session = await getSession();
    const { ipAddress, userAgent } = getClientInfo(request);

    if (!session) {
      console.warn('Attempting to create audit log without session');
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failures shouldn't break the app
  }
}

// Helper function to create a middleware wrapper for API routes
export function withAuditLog<T extends any[], R>(
  action: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const request = args[0] as NextRequest;
    const result = await handler(...args);
    
    // Log after successful operation
    await createAuditLog(request, { action });
    
    return result;
  };
}