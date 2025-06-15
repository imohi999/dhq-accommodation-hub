import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

/**
 * Soft delete middleware
 * Automatically filters out soft-deleted records
 */
export function softDeleteMiddleware() {
  prisma.$use(async (params, next) => {
    // Check for soft delete models
    const softDeleteModels = ['Queue', 'DhqLivingUnit'] // Add your models here

    if (softDeleteModels.includes(params.model || '')) {
      // Exclude soft-deleted records for find queries
      if (params.action === 'findFirst' || params.action === 'findMany') {
        params.args.where = {
          ...params.args.where,
          deletedAt: null
        }
      }

      // Exclude soft-deleted records for findUnique
      if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
        params.action = params.action === 'findUniqueOrThrow' ? 'findFirstOrThrow' : 'findFirst'
        params.args.where = {
          ...params.args.where,
          deletedAt: null
        }
      }

      // Convert delete to soft delete
      if (params.action === 'delete') {
        params.action = 'update'
        params.args.data = { deletedAt: new Date() }
      }

      // Convert deleteMany to soft delete
      if (params.action === 'deleteMany') {
        params.action = 'updateMany'
        params.args.data = { deletedAt: new Date() }
      }
    }

    return next(params)
  })
}

/**
 * Logging middleware
 * Logs all database operations in development
 */
export function loggingMiddleware() {
  if (process.env.NODE_ENV === 'development') {
    prisma.$use(async (params, next) => {
      const before = Date.now()
      const result = await next(params)
      const after = Date.now()

      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
      
      return result
    })
  }
}

/**
 * Audit trail middleware
 * Automatically tracks changes to specified models
 */
export function auditMiddleware(userId?: string) {
  prisma.$use(async (params, next) => {
    const auditModels = ['Queue', 'DhqLivingUnit', 'AllocationRequest']
    
    if (auditModels.includes(params.model || '')) {
      const action = params.action
      const model = params.model
      
      // Store the original data for updates
      let originalData: any = null
      
      if (action === 'update' || action === 'updateMany') {
        // Fetch original data before update
        if (action === 'update' && model) {
          const modelName = model.toLowerCase() as any
          originalData = await (prisma as any)[modelName].findUnique({
            where: params.args.where
          })
        }
      }
      
      // Execute the operation
      const result = await next(params)
      
      // Log the audit trail
      if (action === 'create' || action === 'update' || action === 'delete') {
        // You would create an audit log here
        // Example:
        // await prisma.auditLog.create({
        //   data: {
        //     model,
        //     action,
        //     userId,
        //     originalData: originalData ? JSON.stringify(originalData) : null,
        //     newData: result ? JSON.stringify(result) : null,
        //     timestamp: new Date()
        //   }
        // })
      }
      
      return result
    }
    
    return next(params)
  })
}

/**
 * Initialize all middleware
 */
export function initializePrismaMiddleware() {
  // Order matters - middleware runs in the order they are added
  softDeleteMiddleware()
  loggingMiddleware()
  // auditMiddleware() - Enable when you have user context
}