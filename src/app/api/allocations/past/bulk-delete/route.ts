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

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please provide an array of IDs to delete." },
        { status: 400 }
      );
    }

    // Get all allocations to be deleted for audit log
    const allocationsToDelete = await prisma.pastAllocation.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        clearanceInspections: true
      }
    });

    if (allocationsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No valid allocations found to delete" },
        { status: 404 }
      );
    }

    // Delete all allocations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete the allocations (clearance inspections will be cascade deleted)
      const deleted = await tx.pastAllocation.deleteMany({
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
          entityType: "allocation",
          newData: {
            deletedCount: deleted.count,
            deletedIds: ids,
            allocations: allocationsToDelete.map(a => ({
              id: a.id,
              personnelId: a.personnelId,
              unitId: a.unitId,
              clearanceInspectionsCount: a.clearanceInspections.length
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
      message: `Successfully deleted ${result.count} allocation(s)`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}