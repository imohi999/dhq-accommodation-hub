export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'
import { withAudit } from '@/lib/with-audit'
import { AuditLogger } from '@/lib/audit-logger'

// Dependent schema for validation
const dependentSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  age: z.number().int().min(0).max(120)
})

// Queue schema for validation
const queueSchema = z.object({
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
  appointment: z.string().nullable().optional(),
  dateTos: z.string().min(1, { message: "Date TOS is required" }).transform(val => new Date(val)),
  dateSos: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
  phone: z.string().nullable().optional()
})

// GET /api/queue - Get all queue entries
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const gender = searchParams.get('gender')
    const category = searchParams.get('category')
    const maritalStatus = searchParams.get('maritalStatus')
    const where = {
      AND: [
        { hasAllocationRequest: false }, // Only show queue entries without allocation requests
        search ? {
          OR: [
            { fullName: { contains: search } },
            { svcNo: { contains: search } },
            { currentUnit: { contains: search } }
          ]
        } : {},
        gender ? { gender } : {},
        category ? { category } : {},
        maritalStatus ? { maritalStatus } : {}
      ]
    }

    const queue = await prisma.queue.findMany({
      where,
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(queue)
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}

// POST /api/queue - Add new queue entry
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received body:', body)
    
    const validatedData = queueSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Get the next sequence number
    const lastEntry = await prisma.queue.findFirst({
      orderBy: { sequence: 'desc' }
    })
    const nextSequence = (lastEntry?.sequence || 0) + 1

    const newEntry = await prisma.queue.create({
      data: {
        ...validatedData,
        sequence: nextSequence
      }
    })

    // Log the creation
    await AuditLogger.logCreate(
      session.userId,
      'queue',
      newEntry.id,
      newEntry
    )

    // Emit real-time update via Socket.io (if implemented)
    // io.emit('queue:created', newEntry)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating queue entry:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    // Check for unique constraint violation
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `A record with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create queue entry' },
      { status: 500 }
    )
  }
}