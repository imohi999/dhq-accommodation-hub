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

    console.log({ body: JSON.stringify(body) });

    const { unitId, reason } = body;

    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Reason for deallocation is required" },
        { status: 400 }
      );
    }

    // Get the unit details including occupant information
    const unit = await prisma.dhqLivingUnit.findUnique({
      where: { id: unitId },
      include: {
        accommodationType: true
      }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get current occupant's queueId
      const currentOccupant = await tx.unitOccupant.findFirst({
        where: {
          unitId: unitId,
          isCurrent: true
        }
      });

      // Since queueId is now required, we must have a valid occupant with queueId
      if (!currentOccupant || !currentOccupant.queueId) {
        throw new Error("Current occupant must have a valid queue ID for deallocation");
      }

      // Create a past allocation record
      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: unit.currentOccupantId || unit.id,
          queueId: currentOccupant.queueId,
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
            accommodationType: unit.accommodationType?.name || unit.category,
          },
          allocationStartDate: unit.occupancyStartDate || new Date(),
          allocationEndDate: new Date(),
          durationDays: unit.occupancyStartDate
            ? Math.floor((new Date().getTime() - new Date(unit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: reason.trim(),
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

      // Mark current occupant as not current
      await tx.unitOccupant.updateMany({
        where: {
          unitId: unitId,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });

      // Update the unit history record with end date
      const updatedHistory = await tx.unitHistory.updateMany({
        where: {
          unitId: unitId,
          endDate: null
        },
        data: {
          endDate: new Date(),
          durationDays: unit.occupancyStartDate
            ? Math.floor((new Date().getTime() - new Date(unit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: reason.trim()
        }
      });

      // If no history record was updated (edge case), create one
      if (updatedHistory.count === 0) {
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
            reasonForLeaving: reason.trim(),
          }
        });
      }

      return { updatedUnit, pastAllocation };
    }, {
      timeout: 100000 // 10 seconds
    });

    // Log the deallocation
    await AuditLogger.logAllocation(
      session.userId,
      'POSTED OUT',
      result.pastAllocation.id,
      {
        unitId: unit.id,
        unitName: unit.quarterName,
        occupantName: unit.currentOccupantName,
        occupantServiceNumber: unit.currentOccupantServiceNumber,
        reason: reason.trim(),
        deallocationDate: new Date(),
        occupancyDuration: unit.occupancyStartDate
          ? Math.floor((new Date().getTime() - new Date(unit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    );

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