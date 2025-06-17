import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma-utils'

// GET: Fetch a single DHQ living unit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unit = await prisma.dhqLivingUnit.findUnique({
      where: { id: params.id },
      include: {
        accommodationType: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

// PUT: Update a DHQ living unit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const unit = await prisma.dhqLivingUnit.update({
      where: { id: params.id },
      data: {
        quarterName: body.quarterName,
        location: body.location,
        category: body.category,
        accomodationTypeId: body.accomodationTypeId,
        noOfRooms: body.noOfRooms,
        status: body.status,
        typeOfOccupancy: body.typeOfOccupancy,
        bq: body.bq,
        noOfRoomsInBq: body.noOfRoomsInBq,
        blockName: body.blockName,
        flatHouseRoomName: body.flatHouseRoomName,
        unitName: body.unitName,
        blockImageUrl: body.blockImageUrl,
        currentOccupantId: body.currentOccupantId,
        currentOccupantName: body.currentOccupantName,
        currentOccupantRank: body.currentOccupantRank,
        currentOccupantServiceNumber: body.currentOccupantServiceNumber,
        occupancyStartDate: body.occupancyStartDate ? new Date(body.occupancyStartDate) : null,
      },
      include: {
        accommodationType: true,
      },
    })

    return NextResponse.json(unit)
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

// DELETE: Delete a DHQ living unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if unit has any active allocations
    const activeAllocations = await prisma.allocationRequest.count({
      where: {
        unitId: params.id,
        status: { in: ['pending', 'approved'] },
      },
    })

    if (activeAllocations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete unit with active allocations' },
        { status: 400 }
      )
    }

    await prisma.dhqLivingUnit.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Unit deleted successfully' })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}