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
        include: { housingType: true }
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
        include: { housingType: true }
      });

      if (!toUnit) {
        throw new Error("Destination unit not found");
      }

      if (toUnit.status !== "Vacant") {
        throw new Error("Destination unit is not vacant");
      }

      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: fromUnit.currentOccupantId || fromUnit.id,
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
            housingType: fromUnit.housingType?.name || fromUnit.category,
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

      await tx.unitHistory.create({
        data: {
          unitId: fromUnit.id,
          occupantName: fromUnit.currentOccupantName || "Unknown",
          rank: fromUnit.currentOccupantRank || "Unknown",
          serviceNumber: fromUnit.currentOccupantServiceNumber || "Unknown",
          startDate: fromUnit.occupancyStartDate || new Date(),
          endDate: new Date(),
          durationDays: fromUnit.occupancyStartDate
            ? Math.floor((new Date().getTime() - new Date(fromUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          reasonForLeaving: `Transferred to ${toUnit.quarterName}`,
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
