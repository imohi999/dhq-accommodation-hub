export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma-utils'
import { getSession } from '@/lib/auth-utils'
import { AuditLogger } from '@/lib/audit-logger'

// GET: Fetch all DHQ Accommodation units (returns all data for client-side filtering)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Check for specific filters that other parts of the app might still use
    const status = searchParams.get('status')
    const occupied = searchParams.get('occupied')
    
    const where: any = {}
    
    // Apply status filter if provided (for backward compatibility)
    if (status && status !== 'all') {
      where.status = status
    }
    
    // Handle occupied filter (for backward compatibility)
    if (occupied === 'true') {
      where.status = 'Occupied'
    }

    // Fetch all units
    const units = await prisma.dhqLivingUnit.findMany({
      where,
      include: {
        accommodationType: true,
        occupants: {
          include: {
            queue: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json({
      data: units,
    })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

// POST: Create a new DHQ living unit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const unit = await prisma.dhqLivingUnit.create({
      data: {
        quarterName: body.quarterName,
        location: body.location,
        category: body.category,
        accommodationTypeId: body.accommodationTypeId,
        noOfRooms: body.noOfRooms,
        status: body.status || 'Vacant',
        typeOfOccupancy: body.typeOfOccupancy,
        bq: body.bq || false,
        noOfRoomsInBq: body.noOfRoomsInBq || 0,
        blockName: body.blockName,
        flatHouseRoomName: body.flatHouseRoomName,
        unitName: body.unitName,
        blockImageUrl: body.blockImageUrl,
      },
      include: {
        accommodationType: true,
      },
    })

    // Log the unit creation
    await AuditLogger.logCreate(
      session.userId,
      'unit',
      unit.id,
      unit
    )

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}