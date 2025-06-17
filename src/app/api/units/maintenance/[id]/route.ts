import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      maintenance_type,
      description,
      maintenance_date,
      performed_by,
      cost,
      status,
      priority,
      remarks
    } = body;

    const maintenance = await prisma.unitMaintenance.update({
      where: { id: params.id },
      data: {
        maintenanceType: maintenance_type || undefined,
        description: description || undefined,
        maintenanceDate: maintenance_date ? new Date(maintenance_date) : undefined,
        performedBy: performed_by || undefined,
        cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : undefined,
        status: status || undefined,
        priority: priority || undefined,
        remarks,
      },
    });

    // Transform to match frontend expectations
    const transformedMaintenance = {
      id: maintenance.id,
      unit_id: maintenance.unitId,
      maintenance_type: maintenance.maintenanceType,
      description: maintenance.description,
      maintenance_date: maintenance.maintenanceDate.toISOString().split('T')[0],
      performed_by: maintenance.performedBy,
      cost: maintenance.cost,
      status: maintenance.status,
      priority: maintenance.priority,
      remarks: maintenance.remarks,
      created_at: maintenance.createdAt,
      updated_at: maintenance.updatedAt,
    };

    return NextResponse.json(transformedMaintenance);
  } catch (error) {
    console.error("Failed to update maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.unitMaintenance.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance record" },
      { status: 500 }
    );
  }
}