import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const allocationRequest = await prisma.allocationRequest.findUnique({
      where: { id: params.id },
      include: {
        personnel: true,
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
    
    const updateData: any = { status };
    
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
        personnel: true,
        unit: true
      }
    });
    
    // If approved, update unit status
    if (status === 'approved') {
      const personnelData = allocationRequest.personnelData as any;
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