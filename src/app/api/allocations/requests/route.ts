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
            accommodationType: true
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

    const result = await prisma.$transaction(async (tx) => {
      const currentYear = new Date().getFullYear();

      // Get or create the sequence row for current year
      const sequence = await tx.allocationSequence.upsert({
        where: { id: 1 },
        update: { count: { increment: 1 } },
        create: { id: 1, year: currentYear, count: 1 }
      });

      const paddedCount = String(sequence.count).padStart(4, '0');

      // Construct letterId in the format DHQ/GAR/ABJ/2025/0001/LOG
      const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;

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
              accommodationType: true
            }
          }
        }
      });

      await tx.queue.delete({
        where: { id: personnelId }
      });

      return allocationRequest;
    }, {
      timeout: 10000 // 10 seconds
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