import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get single stamp setting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stampSetting = await prisma.stampSetting.findUnique({
      where: { id: params.id }
    });

    if (!stampSetting) {
      return NextResponse.json({ error: "Stamp setting not found" }, { status: 404 });
    }

    return NextResponse.json(stampSetting);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update stamp setting
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // If activating this stamp, deactivate all others
    if (body.isActive === true) {
      await prisma.stampSetting.updateMany({
        where: { 
          isActive: true,
          id: { not: params.id }
        },
        data: { isActive: false }
      });
    }

    const stampSetting = await prisma.stampSetting.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json(stampSetting);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete stamp setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stampSetting.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}