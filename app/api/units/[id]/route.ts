import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get single unit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unit = await prisma.dhqLivingUnit.findUnique({
      where: { id: params.id },
      include: {
        housingType: true,
        occupants: {
          where: { isCurrent: true }
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        inventory: {
          orderBy: { createdAt: 'desc' }
        },
        maintenance: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update unit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Generate unit name if block or flat changed
    if (body.blockName || body.flatHouseRoomName) {
      const currentUnit = await prisma.dhqLivingUnit.findUnique({
        where: { id: params.id }
      });
      
      if (currentUnit) {
        body.unitName = `${body.blockName || currentUnit.blockName} ${body.flatHouseRoomName || currentUnit.flatHouseRoomName}`;
      }
    }

    const unit = await prisma.dhqLivingUnit.update({
      where: { id: params.id },
      data: body,
      include: {
        housingType: true,
        occupants: {
          where: { isCurrent: true }
        }
      }
    });

    return NextResponse.json(unit);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if unit is occupied
    const unit = await prisma.dhqLivingUnit.findUnique({
      where: { id: params.id }
    });

    if (unit?.status === 'Occupied') {
      return NextResponse.json(
        { error: "Cannot delete occupied unit" },
        { status: 400 }
      );
    }

    await prisma.dhqLivingUnit.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}