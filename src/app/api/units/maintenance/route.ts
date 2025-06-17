export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get("unitId");

    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    const maintenance = await prisma.unitMaintenance.findMany({
      where: { unitId },
      orderBy: { maintenanceDate: "desc" },
    });

    // Transform to match frontend expectations
    const transformedMaintenance = maintenance.map(item => ({
      id: item.id,
      unit_id: item.unitId,
      maintenance_type: item.maintenanceType,
      description: item.description,
      maintenance_date: item.maintenanceDate.toISOString().split('T')[0],
      performed_by: item.performedBy,
      cost: item.cost,
      status: item.status,
      priority: item.priority,
      remarks: item.remarks,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));

    return NextResponse.json(transformedMaintenance);
  } catch (error) {
    console.error("Failed to fetch maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      unit_id,
      maintenance_type,
      description,
      maintenance_date,
      performed_by,
      cost,
      status,
      priority,
      remarks
    } = body;

    if (!unit_id || !maintenance_type || !description || !performed_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const maintenance = await prisma.unitMaintenance.create({
      data: {
        unitId: unit_id,
        maintenanceType: maintenance_type,
        description,
        maintenanceDate: new Date(maintenance_date),
        performedBy: performed_by,
        cost: cost ? parseFloat(cost) : null,
        status: status || "Completed",
        priority: priority || "Medium",
        remarks: remarks || null,
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
    console.error("Failed to create maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    );
  }
}