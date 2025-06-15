export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET);
    
    // Check if decoded is an object with id
    if (typeof decoded === 'string' || !('id' in decoded)) {
      return NextResponse.json({ user: null });
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Remove sensitive data
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      session: {
        user: userWithoutPassword,
        expires: 'exp' in decoded && typeof decoded.exp === 'number' 
          ? new Date(decoded.exp * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}