export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Queue schema for validation
const queueSchema = z.object({
  fullName: z.string().min(1),
  svcNo: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  armOfService: z.enum(['Army', 'Navy', 'Air Force']),
  category: z.enum(['Men', 'Officer']),
  rank: z.string().min(1),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  noOfAdultDependents: z.number().int().min(0).max(99).default(0),
  noOfChildDependents: z.number().int().min(0).max(99).default(0),
  currentUnit: z.string().optional(),
  appointment: z.string().optional(),
  dateTos: z.string().optional().transform(val => val ? new Date(val) : null),
  dateSos: z.string().optional().transform(val => val ? new Date(val) : null),
  phone: z.string().optional()
})

// GET /api/queue - Get all queue entries
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
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
      orderBy: { sequence: 'asc' }
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
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = queueSchema.parse(body)

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

    // Emit real-time update via Socket.io (if implemented)
    // io.emit('queue:created', newEntry)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating queue entry:', error)
    return NextResponse.json(
      { error: 'Failed to create queue entry' },
      { status: 500 }
    )
  }
}