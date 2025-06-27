// app/api/queue/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'

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

// Update schema for validation
const updateQueueSchema = z.object({
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

// GET /api/queue/[id] - Get single queue entry
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.queue.findUnique({
      where: { id: params.id }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching queue entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue entry' },
      { status: 500 }
    )
  }
}

// PUT /api/queue/[id] - Update queue entry
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = updateQueueSchema.parse(body)
    
    const updated = await prisma.queue.update({
      where: { id: params.id },
      data: validatedData
    })

    // Emit real-time update
    // io.emit('queue:updated', updated)

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating queue entry:', error)
    return NextResponse.json(
      { error: 'Failed to update queue entry' },
      { status: 500 }
    )
  }
}

// DELETE /api/queue/[id] - Delete queue entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role for delete permission
    // const profile = await prisma.profile.findUnique({
    //   where: { userId: session.user.id }
    // })

    // if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // Get the deleted entry's sequence for reordering
    const deletedEntry = await prisma.queue.delete({
      where: { id: params.id }
    })

    // Reorder remaining entries
    await prisma.$executeRaw`
      UPDATE Queue 
      SET sequence = sequence - 1 
      WHERE sequence > ${deletedEntry.sequence}
    `

    // Emit real-time update
    // io.emit('queue:deleted', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting queue entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete queue entry' },
      { status: 500 }
    )
  }
}