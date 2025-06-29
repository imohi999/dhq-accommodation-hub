import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { getSession } from "@/lib/auth-utils";

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
    // Validate authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile to check permissions
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: { pagePermissions: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if user has permission to delete past allocations
    const canDelete = profile.role === "superadmin" || profile.role === "admin" || 
      profile.pagePermissions.some(p => 
        p.pageKey === "allocations.past" && p.allowedActions.includes("delete")
      );

    if (!canDelete) {
      return NextResponse.json(
        { error: "You do not have permission to delete past allocations" },
        { status: 403 }
      );
    }

    // Find the past allocation first to get data for audit log
    const pastAllocation = await prisma.pastAllocation.findUnique({
      where: { id: params.id },
      include: {
        clearanceInspections: true
      }
    });

    if (!pastAllocation) {
      return NextResponse.json(
        { error: "Past allocation not found" },
        { status: 404 }
      );
    }

    // Delete the past allocation (clearance inspections will be cascade deleted)
    await prisma.pastAllocation.delete({
      where: { id: params.id }
    });

    // Create audit log
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE",
        entityType: "allocation",
        entityId: params.id,
        oldData: {
          ...pastAllocation,
          clearanceInspectionsCount: pastAllocation.clearanceInspections.length
        },
        ipAddress,
        userAgent
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Past allocation deleted successfully" 
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}