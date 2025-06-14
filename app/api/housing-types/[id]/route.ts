import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get single housing type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const housingType = await prisma.housingType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            livingUnits: true
          }
        }
      }
    });

    if (!housingType) {
      return NextResponse.json({ error: "Housing type not found" }, { status: 404 });
    }

    return NextResponse.json(housingType);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update housing type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const housingType = await prisma.housingType.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json(housingType);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete housing type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if housing type has units
    const unitCount = await prisma.dhqLivingUnit.count({
      where: { housingTypeId: params.id }
    });

    if (unitCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete housing type with existing units" },
        { status: 400 }
      );
    }

    await prisma.housingType.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}