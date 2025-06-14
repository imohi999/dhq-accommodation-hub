import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: List all housing types
export async function GET() {
  try {
    const housingTypes = await prisma.housingType.findMany({
      include: {
        _count: {
          select: {
            livingUnits: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(housingTypes);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Create new housing type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const housingType = await prisma.housingType.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json(housingType, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}