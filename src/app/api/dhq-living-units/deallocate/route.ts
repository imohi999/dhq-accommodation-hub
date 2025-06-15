import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId } = body;

    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    // Get the unit details including occupant information
    const unit = await prisma.dhqLivingUnit.findUnique({
      where: { id: unitId },
      include: {
        housingType: true
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    if (unit.status !== "Occupied") {
      return NextResponse.json(
        { error: "Unit is not occupied" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create a past allocation record
      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: unit.currentOccupantId || unit.id,
          unitId: unit.id,
          letterId: `DHQ/DEALLOC/${new Date().getFullYear()}/${Date.now()}`,
          personnelData: {
            id: unit.currentOccupantId,
            fullName: unit.currentOccupantName,
            rank: unit.currentOccupantRank,
            svcNo: unit.currentOccupantServiceNumber,
            category: unit.category,
          },
          unitData: {
            id: unit.id,
            quarterName: unit.quarterName,
            location: unit.location,
            category: unit.category,
            blockName: unit.blockName,
            flatHouseRoomName: unit.flatHouseRoomName,
            noOfRooms: unit.noOfRooms,
            housingType: unit.housingType?.name || unit.category,
          },
          allocationStartDate: unit.occupancyStartDate || new Date(),
          allocationEndDate: new Date(),
          durationDays: unit.occupancyStartDate 
            ? Math.floor((new Date().getTime() - new Date(unit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: "Deallocated by admin",
          deallocationDate: new Date(),
        }
      });

      // Update the unit to vacant status
      const updatedUnit = await tx.dhqLivingUnit.update({
        where: { id: unitId },
        data: {
          status: "Vacant",
          currentOccupantId: null,
          currentOccupantName: null,
          currentOccupantRank: null,
          currentOccupantServiceNumber: null,
          occupancyStartDate: null,
        }
      });

      // Create a unit history record
      await tx.unitHistory.create({
        data: {
          unitId: unit.id,
          occupantName: unit.currentOccupantName || "Unknown",
          rank: unit.currentOccupantRank || "Unknown",
          serviceNumber: unit.currentOccupantServiceNumber || "Unknown",
          startDate: unit.occupancyStartDate || new Date(),
          endDate: new Date(),
          durationDays: unit.occupancyStartDate 
            ? Math.floor((new Date().getTime() - new Date(unit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: "Deallocated by admin",
        }
      });

      return { updatedUnit, pastAllocation };
    }, {
      timeout: 10000 // 10 seconds
    });

    return NextResponse.json({ 
      message: "Unit deallocated successfully",
      unitId: result.updatedUnit.id,
      pastAllocationId: result.pastAllocation.id
    }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/dhq-living-units/deallocate] Error deallocating unit:', error);
    console.error('[POST /api/dhq-living-units/deallocate] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deallocate unit' },
      { status: 500 }
    );
  }
}