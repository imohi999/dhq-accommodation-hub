import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { getSession } from "@/lib/auth-utils";
import { AuditLogger } from "@/lib/audit-logger";

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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const unit = await prisma.unit.create({
      data: {
        name: body.name,
        description: body.description
      }
    });

    // Log the creation
    await AuditLogger.log({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'unit',
      entityId: unit.id,
      newData: {
        name: unit.name,
        description: unit.description
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }
    
    // Get old data for audit log
    const oldUnit = await prisma.unit.findUnique({
      where: { id }
    });

    if (!oldUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description
      }
    });

    // Log the update
    await AuditLogger.log({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'unit',
      entityId: unit.id,
      oldData: {
        name: oldUnit.name,
        description: oldUnit.description
      },
      newData: {
        name: unit.name,
        description: unit.description
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }
    
    // Get unit data before deletion for audit log
    const unitToDelete = await prisma.unit.findUnique({
      where: { id }
    });

    if (!unitToDelete) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    await prisma.unit.delete({
      where: { id }
    });

    // Log the deletion
    await AuditLogger.log({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'unit',
      entityId: id,
      oldData: {
        name: unitToDelete.name,
        description: unitToDelete.description
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}