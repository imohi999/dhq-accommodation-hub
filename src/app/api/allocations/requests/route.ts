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
        },
        queue: true
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
    
    const MAX_RETRIES = 3;
    
    const tryCreateRequest = async (retryCount = 0): Promise<any> => {
      try {
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
          let letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;

          // If this is a retry, add a suffix to ensure uniqueness
          if (retryCount > 0) {
            letterId = `${letterId}-${retryCount}`;
          }

          const allocationRequest = await tx.allocationRequest.create({
            data: {
              personnelId,
              queueId: personnelId, // personnelId is actually the queue ID
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
              },
              queue: true
            }
          });

          // Mark the queue entry as having an allocation request
          await tx.queue.update({
            where: { id: personnelId },
            data: { hasAllocationRequest: true }
          });

          return allocationRequest;
        }, {
          timeout: 10000 // 10 seconds
        });

        return NextResponse.json(result, { status: 201 });
      } catch (error: any) {
        // Check if this is a unique constraint violation on letterId
        if (error?.code === 'P2002' && error?.meta?.target?.includes('letter_id')) {
          if (retryCount < MAX_RETRIES) {
            console.log(`[POST /api/allocations/requests] Retry ${retryCount + 1}/${MAX_RETRIES} due to duplicate letterId`);
            // Wait a bit before retrying to reduce collision probability
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
            return tryCreateRequest(retryCount + 1);
          } else {
            console.error('[POST /api/allocations/requests] Max retries exceeded for letter ID generation');
            return NextResponse.json(
              { error: 'Failed to generate unique letter ID after multiple attempts. Please try again.' },
              { status: 500 }
            );
          }
        }

        // Re-throw other errors
        throw error;
      }
    };

    return await tryCreateRequest();
  } catch (error) {
    console.error('[POST /api/allocations/requests] Error creating allocation request:', error);
    console.error('[POST /api/allocations/requests] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create allocation request' },
      { status: 500 }
    );
  }
}