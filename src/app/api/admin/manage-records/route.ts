import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'
import { AuditLogger } from '@/lib/audit-logger'

// DELETE /api/admin/database-management - Delete all records from a specified table
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is superadmin
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    })

    if (!user?.profile || user.profile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied. Superadmin only.' }, { status: 403 })
    }

    const body = await request.json()
    const { table } = body

    if (!table) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }

    let count = 0

    // Use a transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (tx) => {
      switch (table) {
        case 'queue':
          // First count the records
          count = await tx.queue.count()
          
          // Delete related records first
          await tx.clearanceInspection.deleteMany({
            where: {
              pastAllocation: {
                queueId: { not: undefined }
              }
            }
          })
          await tx.pastAllocation.deleteMany({})
          await tx.allocationRequest.deleteMany({})
          await tx.unitOccupant.deleteMany({})
          
          // Update DHQ living units to remove current occupants
          await tx.dhqLivingUnit.updateMany({
            where: { currentOccupantId: { not: null } },
            data: {
              currentOccupantId: null,
              currentOccupantName: null,
              currentOccupantRank: null,
              currentOccupantServiceNumber: null,
              occupancyStartDate: null,
              status: 'Vacant'
            }
          })
          
          // Finally delete queue records
          await tx.queue.deleteMany({})
          break

        case 'dhqLivingUnit':
          count = await tx.dhqLivingUnit.count()
          
          // Delete all related records first
          await tx.clearanceInspection.deleteMany({
            where: {
              pastAllocation: {
                unitId: { not: undefined }
              }
            }
          })
          await tx.pastAllocation.deleteMany({})
          await tx.allocationRequest.deleteMany({})
          await tx.unitHistory.deleteMany({})
          await tx.unitInventory.deleteMany({})
          await tx.unitMaintenance.deleteMany({})
          await tx.unitOccupant.deleteMany({})
          
          // Finally delete units
          await tx.dhqLivingUnit.deleteMany({})
          break

        case 'allocationRequest':
          count = await tx.allocationRequest.count()
          await tx.allocationRequest.deleteMany({})
          break

        case 'pastAllocation':
          count = await tx.pastAllocation.count()
          // Delete clearance inspections first
          await tx.clearanceInspection.deleteMany({})
          await tx.pastAllocation.deleteMany({})
          break

        case 'unitHistory':
          count = await tx.unitHistory.count()
          await tx.unitHistory.deleteMany({})
          break

        case 'unitInventory':
          count = await tx.unitInventory.count()
          await tx.unitInventory.deleteMany({})
          break

        case 'unitMaintenance':
          count = await tx.unitMaintenance.count()
          await tx.unitMaintenance.deleteMany({})
          break

        case 'clearanceInspection':
          count = await tx.clearanceInspection.count()
          await tx.clearanceInspection.deleteMany({})
          break

        case 'stampSetting':
          count = await tx.stampSetting.count()
          await tx.stampSetting.deleteMany({})
          break

        case 'auditLog':
          count = await tx.auditLog.count()
          await tx.auditLog.deleteMany({})
          break

        default:
          throw new Error(`Invalid table: ${table}`)
      }
    }, {
      timeout: 60000 // 60 second timeout for large deletions
    })

    // Log this critical action (outside of transaction to ensure it's recorded)
    try {
      await AuditLogger.log({
        userId: session.userId,
        action: 'DELETE',
        entityType: 'database' as any, // Custom entity type for database operations
        entityId: table,
        newData: { 
          table, 
          recordsDeleted: count,
          performedBy: user.username,
          performedAt: new Date().toISOString(),
          operation: 'DATABASE_RECORDS_DELETED'
        }
      })
    } catch (auditError) {
      console.error('Failed to log audit:', auditError)
      // Continue even if audit logging fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${count} records from ${table}`,
      count 
    })
  } catch (error) {
    console.error('Error deleting table data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete table data' },
      { status: 500 }
    )
  }
}