import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
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

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please provide an array of IDs to delete." },
        { status: 400 }
      );
    }

    // Get all clearance inspections to be deleted for audit log
    const inspectionsToDelete = await prisma.clearanceInspection.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        pastAllocation: {
          include: {
            queue: true,
            unit: true
          }
        }
      }
    });

    if (inspectionsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No valid clearance inspections found to delete" },
        { status: 404 }
      );
    }

    // Delete all clearance inspections in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete the clearance inspections
      const deleted = await tx.clearanceInspection.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });

      // Create audit log for bulk delete
      const forwarded = request.headers.get("x-forwarded-for");
      const ipAddress = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
      const userAgent = request.headers.get("user-agent") || undefined;

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "BULK_DELETE",
          entityType: "clearance_inspection",
          newData: {
            deletedCount: deleted.count,
            deletedIds: ids,
            inspections: inspectionsToDelete.map(i => ({
              id: i.id,
              pastAllocationId: i.pastAllocationId,
              inspectorName: i.inspectorName,
              inspectionDate: i.inspectionDate,
              personnelName: i.pastAllocation.queue.fullName,
              unitName: i.pastAllocation.unit.unitName
            }))
          },
          ipAddress,
          userAgent
        }
      });

      return deleted;
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully deleted ${result.count} clearance inspection(s)`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error("Error in bulk delete clearance inspections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}