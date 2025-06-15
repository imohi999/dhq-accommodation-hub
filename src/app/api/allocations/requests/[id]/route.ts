import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const allocationRequest = await prisma.allocationRequest.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            housingType: true
          }
        }
      }
    });

    if (!allocationRequest) {
      return NextResponse.json(
        { error: 'Allocation request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(allocationRequest);
  } catch (error) {
    console.error('Error fetching allocation request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocation request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, approvedBy, refusalReason } = body;

    const updateData: Prisma.AllocationRequestUpdateInput = { status };

    if (status === 'approved') {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    } else if (status === 'refused') {
      updateData.refusalReason = refusalReason;
    }

    const allocationRequest = await prisma.allocationRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        unit: {
          include: {
            housingType: true
          }
        }
      }
    });

    // If approved, handle allocation or transfer
    if (status === 'approved') {
      // Type assertion for JSON field
      interface PersonnelData {
        fullName?: string;
        full_name?: string;
        rank: string;
        svcNo?: string;
        svc_no?: string;
      }
      const personnelData = allocationRequest.personnelData as unknown as PersonnelData;
      
      // Check if this personnel is already occupying another unit (transfer case)
      const currentOccupiedUnit = await prisma.dhqLivingUnit.findFirst({
        where: {
          currentOccupantServiceNumber: personnelData.svcNo || personnelData.svc_no,
          status: 'Occupied'
        }
      });

      // If this is a transfer (personnel already occupies another unit)
      if (currentOccupiedUnit) {
        // Create past allocation record for the old unit
        await prisma.pastAllocation.create({
          data: {
            personnelId: allocationRequest.personnelId,
            unitId: currentOccupiedUnit.id,
            letterId: `TRANSFER-${Date.now()}`,
            personnelData: allocationRequest.personnelData as Prisma.InputJsonValue,
            unitData: {
              id: currentOccupiedUnit.id,
              quarterName: currentOccupiedUnit.quarterName,
              location: currentOccupiedUnit.location,
              blockName: currentOccupiedUnit.blockName,
              flatHouseRoomName: currentOccupiedUnit.flatHouseRoomName,
              noOfRooms: currentOccupiedUnit.noOfRooms,
              category: currentOccupiedUnit.category
            } as Prisma.InputJsonValue,
            allocationStartDate: currentOccupiedUnit.occupancyStartDate || new Date(),
            allocationEndDate: new Date(),
            deallocationDate: new Date(),
            reasonForLeaving: 'Transfer to another unit'
          }
        });

        // Clear the old unit
        await prisma.dhqLivingUnit.update({
          where: { id: currentOccupiedUnit.id },
          data: {
            status: 'Vacant',
            currentOccupantId: null,
            currentOccupantName: null,
            currentOccupantRank: null,
            currentOccupantServiceNumber: null,
            occupancyStartDate: null
          }
        });
      }

      // Update the new unit
      await prisma.dhqLivingUnit.update({
        where: { id: allocationRequest.unitId },
        data: {
          status: 'Occupied',
          currentOccupantId: allocationRequest.personnelId,
          currentOccupantName: personnelData.fullName || personnelData.full_name,
          currentOccupantRank: personnelData.rank,
          currentOccupantServiceNumber: personnelData.svcNo || personnelData.svc_no,
          occupancyStartDate: new Date()
        }
      });
    }

    return NextResponse.json(allocationRequest);
  } catch (error) {
    console.error('Error updating allocation request:', error);
    return NextResponse.json(
      { error: 'Failed to update allocation request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.allocationRequest.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Allocation request deleted successfully' });
  } catch (error) {
    console.error('Error deleting allocation request:', error);
    return NextResponse.json(
      { error: 'Failed to delete allocation request' },
      { status: 500 }
    );
  }
}