import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { getSession } from "@/lib/auth-utils";

// DELETE: Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is superadmin
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    });

    if (!currentUser?.profile || currentUser.profile.role !== 'superadmin') {
      return NextResponse.json({ error: "Forbidden: Only superadmins can delete users" }, { status: 403 });
    }

    const userId = params.id;

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of superadmin users
    if (userToDelete.profile?.role === 'superadmin') {
      return NextResponse.json({ error: "Cannot delete superadmin users" }, { status: 403 });
    }

    // Prevent self-deletion
    if (userId === session.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete auth sessions
      await tx.authSession.deleteMany({
        where: { userId }
      });

      // Delete audit logs
      await tx.auditLog.deleteMany({
        where: { userId }
      });

      // Delete page permissions if profile exists
      if (userToDelete.profile) {
        await tx.pagePermission.deleteMany({
          where: { profileId: userToDelete.profile.id }
        });
      }

      // Delete profile
      await tx.profile.deleteMany({
        where: { userId }
      });

      // Delete user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE_USER',
        entityType: 'user',
        entityId: userId,
        oldData: { username: userToDelete.username, email: userToDelete.email, role: userToDelete.profile?.role },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}