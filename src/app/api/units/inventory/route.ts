export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { AuditLogger } from "@/lib/audit-logger";

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

    const inventory = await prisma.unitInventory.findMany({
      where: { unitId },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend expectations
    const transformedInventory = inventory.map(item => ({
      id: item.id,
      unit_id: item.unitId,
      quantity: item.quantity,
      item_description: item.itemDescription,
      item_location: item.itemLocation,
      item_status: item.itemStatus,
      remarks: item.remarks,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));

    return NextResponse.json(transformedInventory);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { unit_id, quantity, item_description, item_location, item_status, remarks } = body;

    if (!unit_id || !item_description || !item_location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const inventory = await prisma.unitInventory.create({
      data: {
        unitId: unit_id,
        quantity: quantity || 1,
        itemDescription: item_description,
        itemLocation: item_location,
        itemStatus: item_status || "Functional",
        remarks: remarks || null,
      },
    });

    // Log the inventory creation
    await AuditLogger.logCreate(
      session.userId,
      'inventory',
      inventory.id,
      {
        unitId: unit_id,
        itemDescription: item_description,
        itemLocation: item_location,
        quantity: quantity || 1,
        itemStatus: item_status || "Functional"
      }
    );

    // Transform to match frontend expectations
    const transformedInventory = {
      id: inventory.id,
      unit_id: inventory.unitId,
      quantity: inventory.quantity,
      item_description: inventory.itemDescription,
      item_location: inventory.itemLocation,
      item_status: inventory.itemStatus,
      remarks: inventory.remarks,
      created_at: inventory.createdAt,
      updated_at: inventory.updatedAt,
    };

    return NextResponse.json(transformedInventory);
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}