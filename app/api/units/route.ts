import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: List all units
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(units);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Create new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const unit = await prisma.unit.create({
      data: {
        name: body.name,
        description: body.description
      }
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update unit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }
    
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description
      }
    });

    return NextResponse.json(unit);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE: Delete unit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }
    
    await prisma.unit.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}