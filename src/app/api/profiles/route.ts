import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

export const dynamic = 'force-dynamic';

// GET: List all profiles
export async function GET() {
  try {
    // First, let's check how many users exist
    const userCount = await prisma.user.count();
    console.log(`[Profiles API] Total users in database: ${userCount}`);

    const profiles = await prisma.profile.findMany({
      include: {
        user: true,
        pagePermissions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[Profiles API] Found ${profiles.length} profiles`);
    console.log('[Profiles API] Environment:', process.env.NODE_ENV);
    
    // Log profile details for debugging
    profiles.forEach((profile, index) => {
      console.log(`[Profile ${index + 1}] User: ${profile.user.username}, Role: ${profile.role}`);
    });

    return NextResponse.json(profiles, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}