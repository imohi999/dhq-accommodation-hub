import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, fullName } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Construct email from username
    const email = `${username}@dap.mil`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = await prisma.profile.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Determine role based on username
    let role = 'user';
    if (username === 'superadmin') {
      role = 'superadmin';
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email,
          hashedPassword,
          emailVerified: new Date(),
        }
      });

      // Create the profile
      await tx.profile.create({
        data: {
          userId: newUser.id,
          username,
          fullName: fullName || '',
          role
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

    // Remove sensitive data
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Account created successfully!"
    }, { status: 201 });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 }
    );
  }
}