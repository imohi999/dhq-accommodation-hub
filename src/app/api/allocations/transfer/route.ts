import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-utils';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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


      // Find the allocation request for this queue entry
      const allocationRequest = await tx.allocationRequest.findFirst({
        where: {
          queueId: currentOccupant.queueId,
          status: "approved"
        }
      });

      // Update the allocation request status if it exists
      if (allocationRequest) {
        await tx.allocationRequest.update({
          where: {
            id: allocationRequest.id
          },
          data: {
            status: "pending",
          }
        });
      }

      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: fromUnit.currentOccupantId || fromUnit.id,
          queueId: currentOccupant.queueId,
          unitId: fromUnit.id,
          letterId: `DHQ/RE-ALLOCATE/${new Date().getFullYear()}/${Date.now()}`,
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
      
      return {
        fromUnit,
        pastAllocation
      };
    }, {
      timeout: 100000
    });

    // Log the transfer operation
    await AuditLogger.logAllocation(
      session.userId,
      'RE-ALLOCATE',
      result.pastAllocation.id,
      {
        personnelId: result.fromUnit.currentOccupantId,
        personnelName: result.fromUnit.currentOccupantName,
        serviceNumber: result.fromUnit.currentOccupantServiceNumber,
        fromUnitId: result.fromUnit.id,
        fromUnitName: `${result.fromUnit.quarterName} ${result.fromUnit.blockName} ${result.fromUnit.flatHouseRoomName}`,
        transferDate: new Date(),
        occupancyDuration: result.fromUnit.occupancyStartDate
          ? Math.floor((new Date().getTime() - new Date(result.fromUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    );

    return NextResponse.json({
      message: "Transfer completed successfully",
      fromUnitId: result.fromUnit.id,
      personnelName: result.fromUnit.currentOccupantName,
      transferDetails: {
        from: `${result.fromUnit.quarterName} ${result.fromUnit.blockName} ${result.fromUnit.flatHouseRoomName}`,
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
