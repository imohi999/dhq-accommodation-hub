import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pastAllocationId = searchParams.get('pastAllocationId');
    
    // Build the where clause
    const where = pastAllocationId ? { id: pastAllocationId } : {};
    
    // Get past allocations with their clearance inspections
    const pastAllocations = await prisma.pastAllocation.findMany({
      where,
      include: {
        queue: true,
        unit: {
          include: {
            accommodationType: true,
            inventory: {
              orderBy: {
                itemDescription: 'asc'
              }
            }
          }
        },
        clearanceInspections: {
          orderBy: {
            inspectionDate: 'desc'
          }
        }
      },
      orderBy: {
        allocationEndDate: 'desc'
      }
    });

    // Transform the data to match the expected format (camelCase)
    const transformedData = pastAllocations.map((allocation) => ({
      id: allocation.id,
      personnelId: allocation.personnelId,
      queueId: allocation.queueId,
      unitId: allocation.unitId,
      letterId: allocation.letterId,
      personnelData: allocation.personnelData,
      unitData: allocation.unitData,
      allocationStartDate: allocation.allocationStartDate,
      allocationEndDate: allocation.allocationEndDate,
      durationDays: allocation.durationDays,
      reasonForLeaving: allocation.reasonForLeaving,
      deallocationDate: allocation.deallocationDate,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
      queue: allocation.queue,
      unit: {
        ...allocation.unit,
        accommodationType: allocation.unit.accommodationType
      },
      clearance_inspections: allocation.clearanceInspections.map(inspection => ({
        id: inspection.id,
        past_allocation_id: inspection.pastAllocationId,
        inspector_svc_no: inspection.inspectorSvcNo,
        inspector_name: inspection.inspectorName,
        inspector_rank: inspection.inspectorRank,
        inspector_category: inspection.inspectorCategory,
        inspector_appointment: inspection.inspectorAppointment,
        inspection_date: inspection.inspectionDate,
        remarks: inspection.remarks,
        inventory_status: inspection.inventoryStatus,
        created_at: inspection.createdAt,
        updated_at: inspection.updatedAt
      })),
      inventory: allocation.unit.inventory.map(item => ({
        id: item.id,
        unit_id: item.unitId,
        quantity: item.quantity,
        item_description: item.itemDescription,
        item_location: item.itemLocation,
        item_status: item.itemStatus,
        remarks: item.remarks,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }))
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in clearance API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      past_allocation_id,
      inspector_svc_no,
      inspector_name,
      inspector_rank,
      inspector_category,
      inspector_appointment,
      inspection_date,
      remarks,
      inventory_status
    } = body;

    const inspection = await prisma.clearanceInspection.create({
      data: {
        pastAllocationId: past_allocation_id,
        inspectorSvcNo: inspector_svc_no,
        inspectorName: inspector_name,
        inspectorRank: inspector_rank,
        inspectorCategory: inspector_category,
        inspectorAppointment: inspector_appointment,
        inspectionDate: new Date(inspection_date),
        remarks: remarks || null,
        inventoryStatus: inventory_status || {}
      }
    });

    // Transform the response to match expected format
    const response = {
      id: inspection.id,
      past_allocation_id: inspection.pastAllocationId,
      inspector_svc_no: inspection.inspectorSvcNo,
      inspector_name: inspection.inspectorName,
      inspector_rank: inspection.inspectorRank,
      inspector_category: inspection.inspectorCategory,
      inspector_appointment: inspection.inspectorAppointment,
      inspection_date: inspection.inspectionDate,
      remarks: inspection.remarks,
      inventory_status: inspection.inventoryStatus,
      created_at: inspection.createdAt,
      updated_at: inspection.updatedAt
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in clearance POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}