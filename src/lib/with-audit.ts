import { NextRequest, NextResponse } from 'next/server';
import { getSession, getClientInfo } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

interface AuditOptions {
  action: string;
  getEntityData?: (request: NextRequest, response: any) => {
    entityType?: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
  };
}

export function withAudit(options: AuditOptions, handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    const session = await getSession();
    const { ipAddress, userAgent } = getClientInfo(request);

    try {
      // Execute the handler
      const response = await handler(request, context);

      // Only log if user is authenticated and response is successful
      if (session && response.status >= 200 && response.status < 300) {
        try {
          // Get response data if needed
          let entityData = {};
          if (options.getEntityData) {
            const responseData = await response.clone().json();
            entityData = options.getEntityData(request, responseData);
          }

          // Create audit log
          await prisma.auditLog.create({
            data: {
              userId: session.userId,
              action: options.action,
              ...entityData,
              ipAddress,
              userAgent,
            },
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
          // Don't fail the request if audit logging fails
        }
      }

      return response;
    } catch (error) {
      // If the handler throws, still try to log failed attempts for certain actions
      if (session && (options.action.includes('CREATE') || options.action.includes('UPDATE') || options.action.includes('DELETE'))) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: session.userId,
              action: `FAILED_${options.action}`,
              ipAddress,
              userAgent,
            },
          });
        } catch (logError) {
          console.error('Failed to create audit log for failed action:', logError);
        }
      }
      throw error;
    }
  };
}