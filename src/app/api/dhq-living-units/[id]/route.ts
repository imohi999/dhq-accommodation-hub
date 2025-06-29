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
    const { applyToAllUnits, ...updateData } = body

    // If applyToAllUnits is true and blockImageUrl is provided, update all units with the same quarterName
    if (applyToAllUnits && updateData.blockImageUrl && updateData.quarterName) {
      await prisma.dhqLivingUnit.updateMany({
        where: { quarterName: updateData.quarterName },
        data: { blockImageUrl: updateData.blockImageUrl }
      })
    }

    const unit = await prisma.dhqLivingUnit.update({
      where: { id: params.id },
      data: {
        quarterName: updateData.quarterName,
        location: updateData.location,
        category: updateData.category,
        accommodationTypeId: updateData.accommodationTypeId,
        noOfRooms: updateData.noOfRooms,
        status: updateData.status,
        typeOfOccupancy: updateData.typeOfOccupancy,
        bq: updateData.bq,
        noOfRoomsInBq: updateData.noOfRoomsInBq,
        blockName: updateData.blockName,
        flatHouseRoomName: updateData.flatHouseRoomName,
        unitName: updateData.unitName,
        blockImageUrl: updateData.blockImageUrl,
        currentOccupantId: updateData.currentOccupantId,
        currentOccupantName: updateData.currentOccupantName,
        currentOccupantRank: updateData.currentOccupantRank,
        currentOccupantServiceNumber: updateData.currentOccupantServiceNumber,
        occupancyStartDate: updateData.occupancyStartDate ? new Date(updateData.occupancyStartDate) : null,
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