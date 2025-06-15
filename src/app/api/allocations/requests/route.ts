export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const requests = await prisma.allocationRequest.findMany({
      where,
      include: {
        unit: {
          include: {
            housingType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching allocation requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocation requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personnelId, unitId, personnelData, unitData, letterId: providedLetterId } = body;

    console.log({ body });


    const result = await prisma.$transaction(async (tx) => {

      let letterId = providedLetterId;
      if (!letterId) {
        const count = await tx.allocationRequest.count();
        letterId = `DHQ/ACC/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
      }
      const allocationRequest = await tx.allocationRequest.create({
        data: {
          personnelId,
          unitId,
          letterId,
          personnelData,
          unitData,
          status: 'pending'
        },
        include: {
          unit: {
            include: {
              housingType: true
            }
          }
        }
      });
      await tx.queue.delete({
        where: { id: personnelId }
      });
    
      return allocationRequest;
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot
      timeout: 10000, // Maximum time allowed for the transaction
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/allocations/requests] Error creating allocation request:', error);
    console.error('[POST /api/allocations/requests] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create allocation request' },
      { status: 500 }
    );
  }
}