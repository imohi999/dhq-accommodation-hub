import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: Get profile by user ID
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: params.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT: Update profile permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    const { permissions } = body;

    // Get the profile
    const profile = await prisma.profile.findUnique({
      where: { userId: params.userId }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update permissions in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.pagePermission.deleteMany({
        where: { profileId: profile.id }
      });

      // Create new permissions
      if (permissions && Array.isArray(permissions)) {
        // Filter out invalid permissions (ones without pageKey)
        const validPermissions = permissions.filter((perm: any) => 
          perm.pageKey && perm.allowedActions && Array.isArray(perm.allowedActions)
        );
        
        if (validPermissions.length > 0) {
          await tx.pagePermission.createMany({
            data: validPermissions.map((perm: any) => ({
              profileId: profile.id,
              pageKey: perm.pageKey,
              pageTitle: perm.pageTitle || perm.pageKey,
              parentKey: perm.parentKey || null,
              allowedActions: perm.allowedActions,
              // Keep legacy fields for backward compatibility
              canView: perm.allowedActions.includes('access') || perm.canView || false,
              canEdit: perm.allowedActions.includes('edit') || perm.canEdit || false,
              canDelete: perm.allowedActions.includes('delete') || perm.canDelete || false
            }))
          });
        }
      }
    });

    // Return updated profile with permissions
    const updatedProfile = await prisma.profile.findUnique({
      where: { userId: params.userId },
      include: {
        user: true,
        pagePermissions: true
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}