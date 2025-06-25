import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { hash } from "bcryptjs";

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, fullName, role, permissions } = body;

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          hashedPassword,
          emailVerified: new Date(),
        }
      });

      // Create the profile
      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName,
          role: role || 'user'
        }
      });

      // Create page permissions if provided
      if (permissions && Array.isArray(permissions)) {
        // Filter out invalid permissions (ones without pageKey)
        const validPermissions = permissions.filter((perm: any) => 
          perm.pageKey && perm.pageTitle
        );
        
        if (validPermissions.length > 0) {
          await tx.pagePermission.createMany({
            data: validPermissions.map((perm: any) => ({
              profileId: newProfile.id,
              pageKey: perm.pageKey,
              pageTitle: perm.pageTitle,
              parentKey: perm.parentKey || null,
              canView: perm.canView || false,
              canEdit: perm.canEdit || false,
              canDelete: perm.canDelete || false
            }))
          });
        }
      }

      // Return user with profile
      return await tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          profile: true
        }
      });
    });

    // Remove sensitive data before sending response
    if (user && 'hashedPassword' in user) {
      const { hashedPassword: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}