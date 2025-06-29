import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

// DELETE: Delete a clearance inspection
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

    // Check if user has permission to delete clearance inspections
    const canDelete = profile.role === "superadmin" || profile.role === "admin" || 
      profile.pagePermissions.some(p => 
        p.pageKey === "allocations.clearance" && p.allowedActions.includes("delete")
      );

    if (!canDelete) {
      return NextResponse.json(
        { error: "You do not have permission to delete clearance inspections" },
        { status: 403 }
      );
    }

    // Find the clearance inspection first to get data for audit log
    const clearanceInspection = await prisma.clearanceInspection.findUnique({
      where: { id: params.id },
      include: {
        pastAllocation: {
          include: {
            queue: true,
            unit: true
          }
        }
      }
    });

    if (!clearanceInspection) {
      return NextResponse.json(
        { error: "Clearance inspection not found" },
        { status: 404 }
      );
    }

    // Delete the clearance inspection
    await prisma.clearanceInspection.delete({
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
        entityType: "clearance_inspection",
        entityId: params.id,
        oldData: {
          ...clearanceInspection,
          pastAllocationPersonnel: clearanceInspection.pastAllocation.queue.fullName,
          pastAllocationUnit: clearanceInspection.pastAllocation.unit.unitName
        },
        ipAddress,
        userAgent
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Clearance inspection deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting clearance inspection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}