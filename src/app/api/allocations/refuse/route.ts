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

    console.log({ requestData });

    const unitId = requestData.unit.id;
    const personnelId = requestData.personnelId;
    const personnelData = requestData.personnelData as unknown as IPersonnelData;

    const result = await prisma.$transaction(async (tx) => {

      const updatedRequest = await tx.allocationRequest.delete({
        where: {
          id: requestId
        }
      });


      // Extract personnel data from the allocation request
      const queueData = {
        fullName: personnelData.fullName,
        svcNo: personnelData.svcNo,
        gender: personnelData.gender || 'Male',
        armOfService: personnelData.armOfService || 'Army',
        category: personnelData.category,
        rank: personnelData.rank,
        maritalStatus: personnelData.maritalStatus,
        noOfAdultDependents: personnelData.noOfAdultDependents || 0,
        noOfChildDependents: personnelData.noOfChildDependents || 0,
        dependents: (personnelData as any).dependents || [],
        currentUnit: personnelData.currentUnit,
        appointment: personnelData.appointment || '',
        dateTos: personnelData.dateTos || null,
        dateSos: personnelData.dateSos || null,
        phone: personnelData.phone,
        entryDateTime: new Date()
      };

      // Get the current max sequence to update from highest to lowest
      const maxSequence = await tx.queue.aggregate({
        _max: {
          sequence: true
        }
      });

      // Update sequences in descending order to avoid unique constraint conflicts
      if (maxSequence._max.sequence) {
        for (let i = maxSequence._max.sequence; i >= 1; i--) {
          await tx.queue.updateMany({
            where: { sequence: i },
            data: { sequence: i + 1 }
          });
        }
      }

      // Check if the personnel already exists in the queue by ID or service number
      const existingQueueEntry = await tx.queue.findFirst({
        where: {
          OR: [
            { id: personnelId },
            { svcNo: queueData.svcNo }
          ]
        }
      });

      if (existingQueueEntry) {
        // If they exist, update their record and set sequence to 1
        await tx.queue.update({
          where: { id: existingQueueEntry.id },
          data: {
            sequence: 1,
            entryDateTime: new Date(), // Update entry time
            updatedAt: new Date()
          }
        });
      } else {
        // Create new entry at sequence 1
        const newQueueEntry = await tx.queue.create({
          data: {
            id: personnelId, // Use the original personnel ID
            fullName: queueData.fullName,
            svcNo: queueData.svcNo,
            gender: queueData.gender,
            armOfService: queueData.armOfService,
            category: queueData.category,
            rank: queueData.rank,
            maritalStatus: queueData.maritalStatus,
            noOfAdultDependents: queueData.noOfAdultDependents,
            noOfChildDependents: queueData.noOfChildDependents,
            dependents: queueData.dependents,
            currentUnit: queueData.currentUnit,
            appointment: queueData.appointment,
            dateTos: queueData.dateTos ? new Date(queueData.dateTos) : null,
            dateSos: queueData.dateSos ? new Date(queueData.dateSos) : null,
            phone: queueData.phone,
            entryDateTime: queueData.entryDateTime,
            sequence: 1
          }
        });
        console.log('[REFUSE] Created new queue entry:', newQueueEntry);
      }

      // Verify the queue entry exists
      const verifyEntry = await tx.queue.findUnique({
        where: { id: personnelId }
      });
      console.log('[REFUSE] Verification - Queue entry exists:', !!verifyEntry);

      return updatedRequest;
    }, {
      timeout: 100000 // 10 seconds
    });

    return NextResponse.json({ 
      requestId, 
      message: "Allocation request refused and personnel returned to queue at position 1" 
    }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/allocations/refuse] Error refusing allocation:', error);
    console.error('[POST /api/allocations/refuse] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refuse allocation' },
      { status: 500 }
    );
  }
}

interface IPersonnelData {
  fullName: string;
  rank: string;
  svcNo: string;
  phone: string;
  category: string;
  currentUnit: string;
  maritalStatus: string;
  gender?: string;
  armOfService?: string;
  appointment?: string;
  noOfAdultDependents?: number;
  noOfChildDependents?: number;
  dependents?: Array<{
    name: string;
    gender: string;
    age: number;
  }>;
  dateTos?: string | null;
  dateSos?: string | null;
}
