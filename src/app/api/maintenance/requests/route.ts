import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all maintenance requests (user-reported issues)
export async function GET() {
  try {
    const requests = await prisma.unitMaintenance.findMany({
      where: {
        recordType: 'request'
      },
      include: {
        unit: true
      },
      orderBy: {
        maintenanceDate: 'desc'
      }
    });

    // Transform to match frontend interface
    const transformedRequests = requests.map(request => ({
      id: request.id,
      unitId: request.unitId,
      unitName: request.unit?.unitName || 'Unknown Unit',
      issueCategory: request.maintenanceType,
      issueDescription: request.description,
      priorityLevel: request.priority,
      reportedBy: request.performedBy,
      reportedAt: request.maintenanceDate.toISOString(),
      status: request.status,
      remarks: request.remarks || '',
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedRequests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
  }
}

// POST: Create new maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRequest = await prisma.unitMaintenance.create({
      data: {
        unitId: body.unitId,
        recordType: 'request',
        maintenanceType: body.issueCategory,
        description: body.issueDescription,
        maintenanceDate: body.reportedAt ? new Date(body.reportedAt) : new Date(),
        performedBy: body.reportedBy,
        cost: 0, // Requests start with 0 cost
        status: body.status || 'Pending',
        priority: body.priorityLevel,
        remarks: body.remarks
      },
      include: {
        unit: true
      }
    });

    // Transform response to match frontend interface
    const transformedRequest = {
      id: newRequest.id,
      unitId: newRequest.unitId,
      unitName: newRequest.unit?.unitName || 'Unknown Unit',
      issueCategory: newRequest.maintenanceType,
      issueDescription: newRequest.description,
      priorityLevel: newRequest.priority,
      reportedBy: newRequest.performedBy,
      reportedAt: newRequest.maintenanceDate.toISOString(),
      status: newRequest.status,
      remarks: newRequest.remarks || '',
      createdAt: newRequest.createdAt.toISOString(),
      updatedAt: newRequest.updatedAt.toISOString()
    };

    return NextResponse.json(transformedRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance request' },
      { status: 500 }
    );
  }
}