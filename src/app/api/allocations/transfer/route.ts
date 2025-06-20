import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromUnitId, toUnitId } = body;

    if (!fromUnitId || !toUnitId) {
      return NextResponse.json(
        { error: "Both fromUnitId and toUnitId are required" },
        { status: 400 }
      );
    }

    if (fromUnitId === toUnitId) {
      return NextResponse.json(
        { error: "Cannot transfer to the same unit" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const fromUnit = await tx.dhqLivingUnit.findUnique({
        where: { id: fromUnitId },
        include: { accommodationType: true }
      });

      if (!fromUnit) {
        throw new Error("Source unit not found");
      }

      if (fromUnit.status !== "Occupied") {
        throw new Error("Source unit is not occupied");
      }

      // Get the to unit details
      const toUnit = await tx.dhqLivingUnit.findUnique({
        where: { id: toUnitId },
        include: { accommodationType: true }
      });

      if (!toUnit) {
        throw new Error("Destination unit not found");
      }

      if (toUnit.status !== "Vacant") {
        throw new Error("Destination unit is not vacant");
      }

      const currentOccupant = await tx.unitOccupant.findFirst({
        where: {
          unitId: fromUnitId,
          isCurrent: true
        }
      });

      // Since queueId is now required, we must have a valid occupant with queueId
      if (!currentOccupant || !currentOccupant.queueId) {
        throw new Error("Current occupant must have a valid queue ID");
      }


      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: fromUnit.currentOccupantId || fromUnit.id,
          queueId: currentOccupant.queueId,
          unitId: fromUnit.id,
          letterId: `DHQ/TRANSFER/${new Date().getFullYear()}/${Date.now()}`,
          personnelData: {
            id: fromUnit.currentOccupantId,
            fullName: fromUnit.currentOccupantName,
            rank: fromUnit.currentOccupantRank,
            svcNo: fromUnit.currentOccupantServiceNumber,
            category: fromUnit.category,
          },
          unitData: {
            id: fromUnit.id,
            quarterName: fromUnit.quarterName,
            location: fromUnit.location,
            category: fromUnit.category,
            blockName: fromUnit.blockName,
            flatHouseRoomName: fromUnit.flatHouseRoomName,
            noOfRooms: fromUnit.noOfRooms,
            accommodationType: fromUnit.accommodationType?.name || fromUnit.category,
          },
          allocationStartDate: fromUnit.occupancyStartDate || new Date(),
          allocationEndDate: new Date(),
          durationDays: fromUnit.occupancyStartDate
            ? Math.floor((new Date().getTime() - new Date(fromUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: `Transferred to ${toUnit.quarterName} ${toUnit.blockName} ${toUnit.flatHouseRoomName}`,
          deallocationDate: new Date(),
        }
      });

      await tx.dhqLivingUnit.update({
        where: { id: fromUnitId },
        data: {
          status: "Vacant",
          currentOccupantId: null,
          currentOccupantName: null,
          currentOccupantRank: null,
          currentOccupantServiceNumber: null,
          occupancyStartDate: null,
        }
      });

      const updatedToUnit = await tx.dhqLivingUnit.update({
        where: { id: toUnitId },
        data: {
          status: "Occupied",
          currentOccupantId: fromUnit.currentOccupantId,
          currentOccupantName: fromUnit.currentOccupantName,
          currentOccupantRank: fromUnit.currentOccupantRank,
          currentOccupantServiceNumber: fromUnit.currentOccupantServiceNumber,
          occupancyStartDate: new Date(),
        }
      });

      // Mark the occupant as not current in the old unit
      await tx.unitOccupant.updateMany({
        where: {
          unitId: fromUnitId,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });

      // Get the occupant details to transfer
      const occupantDetails = await tx.unitOccupant.findFirst({
        where: {
          unitId: fromUnitId,
          serviceNumber: fromUnit.currentOccupantServiceNumber || ""
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Create new occupant record for the new unit
      // Use the existing occupant's queueId since it's required
      if (!occupantDetails || !occupantDetails.queueId) {
        throw new Error("Occupant details must have a valid queue ID");
      }

      await tx.unitOccupant.create({
        data: {
          unitId: toUnitId,
          queueId: occupantDetails.queueId,
          fullName: fromUnit.currentOccupantName || "Unknown",
          rank: fromUnit.currentOccupantRank || "Unknown",
          serviceNumber: fromUnit.currentOccupantServiceNumber || "Unknown",
          phone: occupantDetails?.phone || null,
          email: occupantDetails?.email || null,
          emergencyContact: occupantDetails?.emergencyContact || null,
          occupancyStartDate: new Date(),
          isCurrent: true
        }
      });

      // Update the existing unit history record for the old unit
      await tx.unitHistory.updateMany({
        where: {
          unitId: fromUnitId,
          endDate: null
        },
        data: {
          endDate: new Date(),
          durationDays: fromUnit.occupancyStartDate
            ? Math.floor((new Date().getTime() - new Date(fromUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: `Transferred to ${toUnit.quarterName} ${toUnit.blockName} ${toUnit.flatHouseRoomName}`
        }
      });

      // Create new unit history record for the new unit
      await tx.unitHistory.create({
        data: {
          unitId: toUnitId,
          occupantName: fromUnit.currentOccupantName || "Unknown",
          rank: fromUnit.currentOccupantRank || "Unknown",
          serviceNumber: fromUnit.currentOccupantServiceNumber || "Unknown",
          startDate: new Date(),
          endDate: null,
          durationDays: null,
          reasonForLeaving: null
        }
      });


      return {
        fromUnit,
        toUnit: updatedToUnit,
        pastAllocation
      };
    }, {
      timeout: 100000
    });

    return NextResponse.json({
      message: "Transfer completed successfully",
      fromUnitId: result.fromUnit.id,
      toUnitId: result.toUnit.id,
      personnelName: result.fromUnit.currentOccupantName,
      transferDetails: {
        from: `${result.fromUnit.quarterName} ${result.fromUnit.blockName} ${result.fromUnit.flatHouseRoomName}`,
        to: `${result.toUnit.quarterName} ${result.toUnit.blockName} ${result.toUnit.flatHouseRoomName}`
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/allocations/transfer] Error processing transfer:', error);
    console.error('[POST /api/allocations/transfer] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process transfer' },
      { status: 500 }
    );
  }
}
