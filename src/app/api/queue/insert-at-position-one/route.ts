import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'

// Schema for queue entry at position one
const queuePositionOneSchema = z.object({
  personnelId: z.string().uuid(),
  fullName: z.string().min(1),
  svcNo: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  armOfService: z.enum(['Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force']),
  category: z.enum(['NCO', 'Officer']),
  rank: z.string().min(1),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  noOfAdultDependents: z.number().int().min(0).max(99).default(0),
  noOfChildDependents: z.number().int().min(0).max(99).default(0),
  currentUnit: z.string().optional(),
  appointment: z.string().optional(),
  dateTos: z.string().optional(),
  dateSos: z.string().optional(),
  phone: z.string().optional(),
  imageUrl: z.string().nullable().optional()
})

// POST /api/queue/insert-at-position-one - Insert at queue position #1
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role for this special operation
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = queuePositionOneSchema.parse(body)

    // Transaction to update sequences and insert new entry
    const result = await prisma.$transaction(async (tx) => {
      // Increment all existing sequences by 1
      await tx.$executeRaw`UPDATE "queue" SET "sequence" = "sequence" + 1`

      // Create new entry at sequence 1
      const newEntry = await tx.queue.create({
        data: {
          id: validatedData.personnelId,
          fullName: validatedData.fullName,
          svcNo: validatedData.svcNo,
          gender: validatedData.gender,
          armOfService: validatedData.armOfService,
          category: validatedData.category,
          rank: validatedData.rank,
          maritalStatus: validatedData.maritalStatus,
          noOfAdultDependents: validatedData.noOfAdultDependents,
          noOfChildDependents: validatedData.noOfChildDependents,
          currentUnit: validatedData.currentUnit ?? '',
          appointment: validatedData.appointment ?? '',
          dateTos: validatedData.dateTos ? new Date(validatedData.dateTos) : new Date('2020-01-01'),
          dateSos: validatedData.dateSos ? new Date(validatedData.dateSos) : null,
          phone: validatedData.phone ?? '',
          imageUrl: validatedData.imageUrl || null,
          sequence: 1
        }
      })

      return newEntry
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error inserting at position one:', error)
    return NextResponse.json(
      { error: 'Failed to insert at position one' },
      { status: 500 }
    )
  }
}