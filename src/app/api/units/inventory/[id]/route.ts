import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { AuditLogger } from "@/lib/audit-logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quantity, item_description, item_location, item_status, remarks } = body;

    // Get old data for audit log
    const oldData = await prisma.unitInventory.findUnique({
      where: { id: params.id }
    });

    const inventory = await prisma.unitInventory.update({
      where: { id: params.id },
      data: {
        quantity: quantity || undefined,
        itemDescription: item_description || undefined,
        itemLocation: item_location || undefined,
        itemStatus: item_status || undefined,
        remarks,
      },
    });

    // Log the update
    await AuditLogger.logUpdate(
      session.userId,
      'inventory',
      params.id,
      oldData,
      inventory
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
    console.error("Failed to update inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get data before deletion for audit log
    const inventoryToDelete = await prisma.unitInventory.findUnique({
      where: { id: params.id }
    });

    if (!inventoryToDelete) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.unitInventory.delete({
      where: { id: params.id },
    });

    // Log the deletion
    await AuditLogger.logDelete(
      session.userId,
      'inventory',
      params.id,
      inventoryToDelete
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}