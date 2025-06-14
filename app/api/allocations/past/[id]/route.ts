import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get single past allocation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pastAllocation = await prisma.pastAllocation.findUnique({
      where: { id: params.id }
    });

    if (!pastAllocation) {
      return NextResponse.json({ error: "Past allocation not found" }, { status: 404 });
    }

    return NextResponse.json(pastAllocation);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH: Update past allocation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const pastAllocation = await prisma.pastAllocation.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json(pastAllocation);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete past allocation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pastAllocation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}