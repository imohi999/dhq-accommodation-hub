import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;
    const requestData = await prisma.allocationRequest.findFirst({
      where: {
        id: requestId
      },
      include: {
        unit: true
      }
    })

    const unitId = requestData?.unit.id
    const personnelId = requestData?.personnelId
    const personnelData = requestData?.personnelData as unknown as IPersonnelData

    const result = await prisma.$transaction(async (tx) => {

      await tx.allocationRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: "approved"
        }
      })

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
      })

    }, {
      timeout: 10000 // 10 seconds
    });

    return NextResponse.json({ requestId }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/allocations/requests] Error creating allocation request:', error);
    console.error('[POST /api/allocations/requests] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create allocation request' },
      { status: 500 }
    );
  }
}

interface IPersonnelData {
  fullName: string;
  rank: string;
  svcNo: string;
}
