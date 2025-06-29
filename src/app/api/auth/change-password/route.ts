import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyPassword, getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		// Validate authentication
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { userId, currentPassword, newPassword } = await request.json();

		// Get the authenticated user's profile
		const authUserProfile = await prisma.profile.findUnique({
			where: { userId: session.userId },
		});

		if (!authUserProfile) {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}

		// Check if user is trying to change their own password
		const isChangingOwnPassword = userId === session.userId;

		// Only superadmins can change other users' passwords
		if (!isChangingOwnPassword && authUserProfile.role !== "superadmin") {
			return NextResponse.json(
				{ error: "Only superadmins can change other users' passwords" },
				{ status: 403 }
			);
		}

		// If changing own password, verify current password
		if (isChangingOwnPassword && currentPassword) {
			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return NextResponse.json({ error: "User not found" }, { status: 404 });
			}

			const isValidPassword = await verifyPassword(
				currentPassword,
				user.hashedPassword
			);

			if (!isValidPassword) {
				return NextResponse.json(
					{ error: "Current password is incorrect" },
					{ status: 400 }
				);
			}
		}

		// Validate new password (basic validation since no external validation)
		if (!newPassword || newPassword.length < 8) {
			return NextResponse.json(
				{ error: "New password must be at least 8 characters long" },
				{ status: 400 }
			);
		}

		// Hash the new password
		const hashedPassword = await hashPassword(newPassword);

		// Update the user's password
		await prisma.user.update({
			where: { id: userId },
			data: { hashedPassword },
		});

		// Get client info for audit log
		const forwarded = request.headers.get('x-forwarded-for');
		const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
		const userAgent = request.headers.get('user-agent') || undefined;

		// Create audit log
		await prisma.auditLog.create({
			data: {
				userId: session.userId,
				action: isChangingOwnPassword ? "password.change.self" : "password.change.other",
				entityType: "user",
				entityId: userId,
				newData: { targetUserId: userId },
				ipAddress: ipAddress,
				userAgent: userAgent,
			},
		});

		return NextResponse.json({
			message: "Password changed successfully",
		});
	} catch (error) {
		console.error("Error changing password:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}