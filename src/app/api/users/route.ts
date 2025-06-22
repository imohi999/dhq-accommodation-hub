import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { hash } from "bcryptjs";

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, fullName, role } = body;

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
          emailVerified: new Date(), // Since email_confirm was true in Supabase
        }
      });

      // Create the profile
      await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName,
          role: role || 'user'
        }
      });

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