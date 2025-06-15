import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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
        unit: true
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

      const updatedRequest = await tx.allocationRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: "approved",
          approvedAt: new Date()
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

      return updatedRequest;
    }, {
      timeout: 10000 // 10 seconds
    });

    return NextResponse.json({ requestId }, { status: 200 });
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
}
