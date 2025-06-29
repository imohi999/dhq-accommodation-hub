import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all maintenance tasks (scheduled/preventive maintenance)
export async function GET() {
  try {
    const tasks = await prisma.unitMaintenance.findMany({
      where: {
        recordType: 'task'
      },
      include: {
        unit: true
      },
      orderBy: {
        maintenanceDate: 'desc'
      }
    });

    // Transform to match our interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      unitId: task.unitId,
      unitName: task.unit?.unitName || 'Unknown Unit',
      quarterName: task.unit?.quarterName || '',
      location: task.unit?.location || '',
      blockName: task.unit?.blockName || '',
      taskName: task.maintenanceType,
      taskDescription: task.description,
      lastPerformedDate: task.maintenanceDate.toISOString().split('T')[0],
      nextDueDate: new Date(task.maintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 90 days later
      status: task.status,
      remarks: task.remarks || '',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance tasks' },
      { status: 500 }
    );
  }
}

// POST: Create new maintenance task(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks } = body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      );
    }

    const createdTasks = [];

    for (const task of tasks) {
      const createdTask = await prisma.unitMaintenance.create({
        data: {
          unitId: task.unitId,
          recordType: 'task',
          maintenanceType: task.taskName,
          description: task.taskDescription,
          maintenanceDate: task.lastPerformedDate ? new Date(task.lastPerformedDate) : new Date(),
          performedBy: 'System',
          status: task.status,
          priority: 'Medium',
          remarks: task.remarks,
          cost: 0
        },
        include: {
          unit: true
        }
      });
      createdTasks.push(createdTask);
    }

    return NextResponse.json(createdTasks, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance tasks' },
      { status: 500 }
    );
  }
}