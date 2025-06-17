import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get single accomodation type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accommodationType = await prisma.accommodationType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            livingUnits: true
          }
        }
      }
    });

    if (!accommodationType) {
      return NextResponse.json({ error: "Accomodation type not found" }, { status: 404 });
    }

    return NextResponse.json(accommodationType);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update accomodation type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const accommodationType = await prisma.accommodationType.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json(accommodationType);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete accomodation type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if accomodation type has units
    const unitCount = await prisma.dhqLivingUnit.count({
      where: { accomodationTypeId: params.id }
    });

    if (unitCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete accomodation type with existing units" },
        { status: 400 }
      );
    }

    await prisma.accommodationType.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}