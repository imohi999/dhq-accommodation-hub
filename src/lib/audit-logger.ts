import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SIGNUP'
  | 'FAILED_LOGIN'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVED'
  | 'NOT APPROVED'
  | 'ASSIGN_ROLE'
  | 'REMOVE_ROLE'
  | 'ALLOCATE'
  | 'POSTED OUT'
  | 'RE-ALLOCATE'
  | 'INSPECT'
  | 'MAINTAIN'
  | 'IMPORT'
  | 'IMPORT ACCOMMODATION UNITS'

export type EntityType =
  | 'user'
  | 'profile'
  | 'queue'
  | 'allocation'
  | 'unit'
  | 'maintenance'
  | 'inventory'
  | 'stamp_setting'
  | 'clearance_inspection'
  | 'IMPORT ACCOMMODATION UNITS'

interface AuditLogOptions {
  userId: string;
  action: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(options: AuditLogOptions): Promise<void> {
    try {
      // Get MAC address and user agent from headers if not provided
      const headersList = headers();
      const ipAddress = options.ipAddress ||
        headersList.get('x-forwarded-for')?.split(',')[0] ||
        headersList.get('x-real-ip') ||
        '00:00:00:00:00:00';

      const userAgent = options.userAgent || headersList.get('user-agent') || null;

      await prisma.auditLog.create({
        data: {
          userId: options.userId,
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId,
          oldData: options.oldData,
          newData: options.newData,
          ipAddress: ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break main operations
      console.error('Failed to create audit log:', error);
    }
  }

  static async logCreate(
    userId: string,
    entityType: EntityType,
    entityId: string,
    data: any
  ): Promise<void> {
    await this.log({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      newData: data,
    });
  }

  static async logUpdate(
    userId: string,
    entityType: EntityType,
    entityId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.log({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      oldData,
      newData,
    });
  }

  static async logDelete(
    userId: string,
    entityType: EntityType,
    entityId: string,
    data: any
  ): Promise<void> {
    await this.log({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      oldData: data,
    });
  }

  static async logAuth(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'FAILED_LOGIN',
    additionalData?: any
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType: 'user',
      entityId: userId,
      newData: additionalData,
    });
  }

  static async logAllocation(
    userId: string,
    action: 'ALLOCATE' | 'POSTED OUT' | 'RE-ALLOCATE' | 'APPROVED' | 'NOT APPROVED',
    allocationId: string,
    data: any
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType: 'allocation',
      entityId: allocationId,
      newData: data,
    });
  }

  static async logMaintenance(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MAINTAIN',
    maintenanceId: string,
    data: any
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType: 'maintenance',
      entityId: maintenanceId,
      newData: data,
    });
  }

  // Bulk operations logging
  static async logBulkOperation(
    userId: string,
    action: AuditAction,
    entityType: EntityType,
    entityIds: string[],
    data?: any
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType,
      newData: {
        bulkOperation: true,
        entityIds,
        count: entityIds.length,
        ...data,
      },
    });
  }

  // Import operations logging
  static async logImport(
    userId: string,
    entityType: EntityType,
    importDetails: {
      totalRecords: number;
      imported: number;
      skipped: number;
      source?: string;
    }
  ): Promise<void> {
    await this.log({
      userId,
      action: 'IMPORT ACCOMMODATION UNITS',
      entityType,
      newData: {
        importOperation: true,
        ...importDetails,
      },
    });
  }
}

// Prisma extension for automatic audit logging
export const auditExtension = {
  model: {
    $allModels: {
      async createWithAudit<T>(
        this: T,
        args: any & { userId: string }
      ): Promise<any> {
        const { userId, ...createArgs } = args;
        const modelName = (this as any).name.toLowerCase();

        const result = await (this as any).create(createArgs);

        await AuditLogger.logCreate(
          userId,
          modelName as EntityType,
          result.id,
          result
        );

        return result;
      },

      async updateWithAudit<T>(
        this: T,
        args: any & { userId: string; where: any }
      ): Promise<any> {
        const { userId, where, ...updateArgs } = args;
        const modelName = (this as any).name.toLowerCase();

        // Get old data
        const oldData = await (this as any).findUnique({ where });

        // Perform update
        const result = await (this as any).update({
          where,
          ...updateArgs,
        });

        await AuditLogger.logUpdate(
          userId,
          modelName as EntityType,
          result.id,
          oldData,
          result
        );

        return result;
      },

      async deleteWithAudit<T>(
        this: T,
        args: any & { userId: string; where: any }
      ): Promise<any> {
        const { userId, where } = args;
        const modelName = (this as any).name.toLowerCase();

        // Get data before deletion
        const data = await (this as any).findUnique({ where });

        // Perform deletion
        const result = await (this as any).delete({ where });

        await AuditLogger.logDelete(
          userId,
          modelName as EntityType,
          data.id,
          data
        );

        return result;
      },
    },
  },
};