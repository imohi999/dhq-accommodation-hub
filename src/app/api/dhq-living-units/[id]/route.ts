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

// DELETE: Delete a DHQ living unit with cascading delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use a transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (tx) => {
      // 1. Get past allocations IDs first for clearance inspections
      const pastAllocationsToDelete = await tx.pastAllocation.findMany({
        where: { unitId: params.id },
        select: { id: true }
      })
      
      // 2. Delete clearance inspections if there are past allocations
      if (pastAllocationsToDelete.length > 0) {
        await tx.clearanceInspection.deleteMany({
          where: { 
            pastAllocationId: { 
              in: pastAllocationsToDelete.map(pa => pa.id) 
            } 
          }
        })
      }

      // 3. Delete all related records in parallel where possible
      await Promise.all([
        tx.allocationRequest.deleteMany({
          where: { unitId: params.id }
        }),
        tx.pastAllocation.deleteMany({
          where: { unitId: params.id }
        }),
        tx.unitHistory.deleteMany({
          where: { unitId: params.id }
        }),
        tx.unitInventory.deleteMany({
          where: { unitId: params.id }
        }),
        tx.unitMaintenance.deleteMany({
          where: { unitId: params.id }
        }),
        tx.unitOccupant.deleteMany({
          where: { unitId: params.id }
        })
      ])

      // 4. Finally, delete the unit itself
      await tx.dhqLivingUnit.delete({
        where: { id: params.id }
      })
    }, {
      timeout: 30000 // 30 second timeout
    })

    return NextResponse.json({ 
      message: 'Unit and all related records deleted successfully' 
    })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    
    // Provide more user-friendly error message
    if (message.includes('foreign key constraint')) {
      return NextResponse.json({ 
        error: 'Failed to delete unit due to database constraints. Please contact support if this issue persists.'
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: message }, { status })
  }
}