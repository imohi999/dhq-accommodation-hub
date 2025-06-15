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
      note: item.note,
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
    const body = await request.json();
    const { unit_id, quantity, item_description, item_location, item_status, note } = body;

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
        note: note || null,
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
      note: inventory.note,
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