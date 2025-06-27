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
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }
    const requestData = await prisma.allocationRequest.findFirst({
      where: {
        id: requestId
      },
      include: {
        unit: true,
        queue: true
      }
    });

    if (!requestData) {
      return NextResponse.json(
        { error: "Allocation request not found" },
        { status: 404 }
      );
    }
    const unitId = requestData.unit.id;
    const personnelId = requestData.personnelId;
    const personnelData = requestData.personnelData as unknown as IPersonnelData;

    const result = await prisma.$transaction(async (tx) => {
      // Check if the occupant is currently occupying any unit
      const currentOccupiedUnit = await tx.dhqLivingUnit.findFirst({
        where: {
          currentOccupantServiceNumber: personnelData.svcNo,
          status: "Occupied"
        },
        include: {
          accommodationType: true
        }
      });

      let pastAllocation = null;

      // If occupant has a current unit, vacate it
      if (currentOccupiedUnit) {
        await tx.dhqLivingUnit.update({
          where: { id: currentOccupiedUnit.id },
          data: {
            status: "Vacant",
            currentOccupantId: null,
            currentOccupantName: null,
            currentOccupantRank: null,
            currentOccupantServiceNumber: null,
            occupancyStartDate: null,
          }
        });

        // Mark the previous unit occupant record as not current
        await tx.unitOccupant.updateMany({
          where: {
            unitId: currentOccupiedUnit.id,
            isCurrent: true
          },
          data: {
            isCurrent: false
          }
        });

        // Update unit history for the vacated unit
        await tx.unitHistory.updateMany({
          where: {
            unitId: currentOccupiedUnit.id,
            endDate: null
          },
          data: {
            endDate: new Date(),
            durationDays: currentOccupiedUnit.occupancyStartDate
              ? Math.floor((new Date().getTime() - new Date(currentOccupiedUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
            reasonForLeaving: `re-allocated to ${requestData.unit.quarterName} ${requestData.unit.blockName} ${requestData.unit.flatHouseRoomName}`
          }
        });

        pastAllocation = await tx.pastAllocation.create({
          data: {
            personnelId: currentOccupiedUnit.currentOccupantId || currentOccupiedUnit.id,
            queueId: requestData.queueId,
            unitId: currentOccupiedUnit.id,
            letterId: `DHQ/RE-ALLOCATE/${new Date().getFullYear()}/${Date.now()}`,
            personnelData: {
              id: currentOccupiedUnit.currentOccupantId,
              fullName: currentOccupiedUnit.currentOccupantName,
              rank: currentOccupiedUnit.currentOccupantRank,
              svcNo: currentOccupiedUnit.currentOccupantServiceNumber,
              category: currentOccupiedUnit.category,
            },
            unitData: {
              id: currentOccupiedUnit.id,
              quarterName: currentOccupiedUnit.quarterName,
              location: currentOccupiedUnit.location,
              category: currentOccupiedUnit.category,
              blockName: currentOccupiedUnit.blockName,
              flatHouseRoomName: currentOccupiedUnit.flatHouseRoomName,
              noOfRooms: currentOccupiedUnit.noOfRooms,
              accommodationType: currentOccupiedUnit.accommodationType?.name || currentOccupiedUnit.category,
            },
            allocationStartDate: currentOccupiedUnit.occupancyStartDate || new Date(),
            allocationEndDate: new Date(),
            durationDays: currentOccupiedUnit.occupancyStartDate
              ? Math.floor((new Date().getTime() - new Date(currentOccupiedUnit.occupancyStartDate).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
            reasonForLeaving: `Re-allocated to ${requestData.unit.quarterName} ${requestData.unit.blockName} ${requestData.unit.flatHouseRoomName}`,
            deallocationDate: new Date(),
          }
        });
      }

      const updatedRequest = await tx.allocationRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: session.userId
        }
      });

      await tx.dhqLivingUnit.update({
        where: {
          id: unitId
        },
        data: {
          status: "Occupied",
          currentOccupantId: personnelId,
          currentOccupantName: personnelData.fullName,
          currentOccupantRank: personnelData.rank,
          currentOccupantServiceNumber: personnelData.svcNo,
          occupancyStartDate: new Date()
        }
      });

      // Create UnitOccupant record for current occupant
      await tx.unitOccupant.create({
        data: {
          unitId: unitId,
          queueId: requestData.queueId,
          fullName: personnelData.fullName,
          rank: personnelData.rank,
          serviceNumber: personnelData.svcNo,
          phone: personnelData.phone || null,
          email: personnelData.email || null,
          emergencyContact: null,
          occupancyStartDate: new Date(),
          isCurrent: true
        }
      });

      // Create UnitHistory record for the new allocation
      await tx.unitHistory.create({
        data: {
          unitId: unitId,
          occupantName: personnelData.fullName,
          rank: personnelData.rank,
          serviceNumber: personnelData.svcNo,
          startDate: new Date(),
          endDate: null,
          durationDays: null,
          reasonForLeaving: null
        }
      });

      return {
        updatedRequest,
        vacatedUnit: currentOccupiedUnit,
        pastAllocation: pastAllocation
      };
    }, {
      timeout: 100000 // 10 seconds
    });

    // Log the allocation approval
    await AuditLogger.logAllocation(
      session.userId,
      'APPROVED',
      requestId,
      {
        personnelId,
        unitId,
        personnelName: personnelData.fullName,
        unitName: requestData.unit.quarterName,
        vacatedUnit: result.vacatedUnit ? {
          id: result.vacatedUnit.id,
          name: `${result.vacatedUnit.quarterName} ${result.vacatedUnit.blockName} ${result.vacatedUnit.flatHouseRoomName}`
        } : null
      }
    );

    return NextResponse.json({
      requestId,
      vacatedUnit: result.vacatedUnit ? {
        id: result.vacatedUnit.id,
        name: `${result.vacatedUnit.quarterName} ${result.vacatedUnit.blockName} ${result.vacatedUnit.flatHouseRoomName}`
      } : null
    }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/allocations/approve] Error approving allocation:', error);
    console.error('[POST /api/allocations/approve] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve allocation' },
      { status: 500 }
    );
  }
}

interface IPersonnelData {
  fullName: string;
  rank: string;
  svcNo: string;
  phone?: string;
  currentUnit?: string;
  armOfService?: string;
  email?: string;
}
