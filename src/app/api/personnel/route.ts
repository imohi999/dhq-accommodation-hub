export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'
import { AuditLogger } from '@/lib/audit-logger'

// Dependent schema for validation
const dependentSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  age: z.number().int().min(0).max(120)
})

// Personnel schema for validation (same as queue schema but for personnel context)
const personnelSchema = z.object({
  fullName: z.string().min(1),
  svcNo: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  armOfService: z.enum(['Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force']),
  category: z.enum(['NCO', 'Officer']),
  rank: z.string().min(1),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  noOfAdultDependents: z.number().int().min(0).max(99).default(0),
  noOfChildDependents: z.number().int().min(0).max(99).default(0),
  dependents: z.array(dependentSchema).optional(),
  currentUnit: z.string().min(1, { message: "Current Unit is required" }),
  appointment: z.string().min(1, { message: "Appointment is required" }),
  dateTos: z.string().min(1, { message: "Date TOS is required" }).transform(val => new Date(val)),
  dateSos: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
  phone: z.string().min(1, { message: "Phone is required" })
})

// GET /api/personnel - Get all personnel records
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
    const armOfService = searchParams.get('armOfService')
    const unit = searchParams.get('unit')
    
    const where = {
      AND: [
        search ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { svcNo: { contains: search, mode: 'insensitive' as const } },
            { currentUnit: { contains: search, mode: 'insensitive' as const } },
            { rank: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        gender ? { gender } : {},
        category ? { category } : {},
        maritalStatus ? { maritalStatus } : {},
        armOfService ? { armOfService } : {},
        unit ? { currentUnit: unit } : {}
      ]
    }

    const personnel = await prisma.queue.findMany({
      where,
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(personnel)
  } catch (error) {
    console.error('Error fetching personnel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personnel' },
      { status: 500 }
    )
  }
}

// POST /api/personnel - Add new personnel record
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received personnel data:', body)
    
    const validatedData = personnelSchema.parse(body)
    console.log('Validated personnel data:', validatedData)

    // Get the next sequence number
    const lastEntry = await prisma.queue.findFirst({
      orderBy: { sequence: 'desc' }
    })
    const nextSequence = (lastEntry?.sequence || 0) + 1

    const newPersonnel = await prisma.queue.create({
      data: {
        ...validatedData,
        sequence: nextSequence
      }
    })

    // Log the creation
    await AuditLogger.logCreate(
      session.userId,
      'personnel',
      newPersonnel.id,
      newPersonnel
    )

    return NextResponse.json(newPersonnel, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating personnel record:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    // Check for unique constraint violation
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `A personnel record with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create personnel record' },
      { status: 500 }
    )
  }
}