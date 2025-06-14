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
        personnel: true,
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
    const { personnelId, unitId, personnelData, unitData } = body;
    
    // Generate letter ID
    const count = await prisma.allocationRequest.count();
    const letterId = `DHQ/ACC/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
    
    const allocationRequest = await prisma.allocationRequest.create({
      data: {
        personnelId,
        unitId,
        letterId,
        personnelData,
        unitData,
        status: 'pending'
      },
      include: {
        personnel: true,
        unit: true
      }
    });
    
    return NextResponse.json(allocationRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating allocation request:', error);
    return NextResponse.json(
      { error: 'Failed to create allocation request' },
      { status: 500 }
    );
  }
}