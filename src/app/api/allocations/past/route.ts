import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { Prisma } from "@prisma/client";

// GET: List all past allocations
export async function GET() {
  try {
    const pastAllocations = await prisma.pastAllocation.findMany({
      include: {
        queue: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(pastAllocations);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}