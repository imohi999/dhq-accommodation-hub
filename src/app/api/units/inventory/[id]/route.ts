import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity, item_description, item_location, item_status, remarks } = body;

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
    await prisma.unitInventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}