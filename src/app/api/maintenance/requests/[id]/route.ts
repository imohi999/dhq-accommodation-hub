import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update maintenance request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const updatedRequest = await prisma.unitMaintenance.update({
      where: { id },
      data: {
        maintenanceType: body.issueCategory,
        description: body.issueDescription,
        priority: body.priorityLevel,
        performedBy: body.reportedBy,
        status: body.status,
        notes: body.notes,
        ...(body.reportedAt && {
          maintenanceDate: new Date(body.reportedAt)
        })
      },
      include: {
        unit: true
      }
    });

    // Transform response to match frontend interface
    const transformedRequest = {
      id: updatedRequest.id,
      unitId: updatedRequest.unitId,
      unitName: updatedRequest.unit?.unitName || 'Unknown Unit',
      issueCategory: updatedRequest.maintenanceType,
      issueDescription: updatedRequest.description,
      priorityLevel: updatedRequest.priority,
      reportedBy: updatedRequest.performedBy,
      reportedAt: updatedRequest.maintenanceDate.toISOString(),
      status: updatedRequest.status,
      notes: updatedRequest.notes || '',
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString()
    };

    return NextResponse.json(transformedRequest);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance request' },
      { status: 500 }
    );
  }
}

// DELETE: Remove maintenance request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.unitMaintenance.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance request' },
      { status: 500 }
    );
  }
}