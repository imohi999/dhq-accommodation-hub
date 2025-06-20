import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update maintenance task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const updatedTask = await prisma.unitMaintenance.update({
      where: { id },
      data: {
        unitId: body.unitId,
        maintenanceType: body.taskName,
        description: body.taskDescription,
        maintenanceDate: body.lastPerformedDate ? new Date(body.lastPerformedDate) : new Date(),
        status: body.status,
        remarks: body.remarks,
        recordType: 'task'
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating maintenance task:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance task' },
      { status: 500 }
    );
  }
}

// DELETE: Delete maintenance task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.unitMaintenance.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance task:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance task' },
      { status: 500 }
    );
  }
}