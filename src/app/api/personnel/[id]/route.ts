import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'
import { AuditLogger } from '@/lib/audit-logger'

interface RouteParams {
  params: {
    id: string
  }
}

// Dependent schema for validation
const dependentSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  age: z.number().int().min(0).max(120)
})

// Update schema for personnel validation
const updatePersonnelSchema = z.object({
  fullName: z.string().min(1),
  svcNo: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  armOfService: z.enum(['Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force']),
  category: z.enum(['NCOs', 'Officer']),
  rank: z.string().min(1),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  noOfAdultDependents: z.number().int().min(0).max(99).default(0),
  noOfChildDependents: z.number().int().min(0).max(99).default(0),
  dependents: z.array(dependentSchema).optional(),
  currentUnit: z.string().min(1, { message: "Current Unit is required" }),
  appointment: z.string().optional(),
  dateTos: z.string().min(1, { message: "Date TOS is required" }).transform(val => new Date(val)),
  dateSos: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
  phone: z.string().optional()
})

// GET /api/personnel/[id] - Get single personnel record
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personnel = await prisma.queue.findUnique({
      where: { id: params.id }
    })

    if (!personnel) {
      return NextResponse.json({ error: 'Personnel record not found' }, { status: 404 })
    }

    return NextResponse.json(personnel)
  } catch (error) {
    console.error('Error fetching personnel record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personnel record' },
      { status: 500 }
    )
  }
}

// PUT /api/personnel/[id] - Update personnel record
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = updatePersonnelSchema.parse(body)
    
    // Get old data for audit log
    const oldData = await prisma.queue.findUnique({
      where: { id: params.id }
    })

    if (!oldData) {
      return NextResponse.json({ error: 'Personnel record not found' }, { status: 404 })
    }

    const updated = await prisma.queue.update({
      where: { id: params.id },
      data: validatedData
    })

    // Log the update
    await AuditLogger.logUpdate(
      session.userId,
      'personnel',
      params.id,
      oldData,
      updated
    )

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating personnel record:', error)
    return NextResponse.json(
      { error: 'Failed to update personnel record' },
      { status: 500 }
    )
  }
}

// DELETE /api/personnel/[id] - Delete personnel record with cascading delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the personnel record before deletion for audit log and sequence
    const personnelToDelete = await prisma.queue.findUnique({
      where: { id: params.id }
    })

    if (!personnelToDelete) {
      return NextResponse.json({ error: 'Personnel record not found' }, { status: 404 })
    }

    // Start a transaction to handle cascading deletes with increased timeout
    await prisma.$transaction(async (tx) => {
      // 1. Delete related allocation requests
      await tx.allocationRequest.deleteMany({
        where: { queueId: params.id }
      })

      // 2. Delete related past allocations  
      await tx.pastAllocation.deleteMany({
        where: { queueId: params.id }
      })

      // 3. Delete related unit occupant records
      await tx.unitOccupant.deleteMany({
        where: { queueId: params.id }
      })

      // 4. Remove current occupant references from DHQ living units
      await tx.dhqLivingUnit.updateMany({
        where: { currentOccupantId: params.id },
        data: {
          currentOccupantId: null,
          currentOccupantName: null,
          currentOccupantRank: null,
          currentOccupantServiceNumber: null,
          occupancyStartDate: null,
          status: 'Vacant'
        }
      })

      // 5. Delete the main personnel record (queue entry)
      await tx.queue.delete({
        where: { id: params.id }
      })

      // 6. Reorder remaining queue sequences using CTE approach
      // First, update to temporary large values to avoid conflicts
      await tx.$executeRaw`
        UPDATE queue 
        SET sequence = sequence + 10000 
        WHERE sequence > ${personnelToDelete.sequence}
      `
      
      // Then update back to correct sequential values
      await tx.$executeRaw`
        WITH numbered_rows AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY sequence) + ${personnelToDelete.sequence} - 1 as new_sequence
          FROM queue 
          WHERE sequence > 10000
        )
        UPDATE queue 
        SET sequence = numbered_rows.new_sequence
        FROM numbered_rows 
        WHERE queue.id = numbered_rows.id
      `
    }, {
      timeout: 30000 // Increase timeout to 15 seconds
    })

    // Log the deletion
    await AuditLogger.logDelete(
      session.userId,
      'personnel',
      params.id,
      personnelToDelete
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Personnel record and all related data deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting personnel record:', error)
    return NextResponse.json(
      { error: 'Failed to delete personnel record' },
      { status: 500 }
    )
  }
}