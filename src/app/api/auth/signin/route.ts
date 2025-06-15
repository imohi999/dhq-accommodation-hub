import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username in profile
    const profile = await prisma.profile.findUnique({
      where: { username },
      include: {
        user: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = profile.user;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await compare(password, user.hashedPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          role: profile.role
        }
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove sensitive data
    const { hashedPassword: _, ...userWithoutPassword } = user;

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        ...userWithoutPassword,
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          role: profile.role
        }
      },
      token
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}