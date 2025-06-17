import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: List all accomodation types
export async function GET() {
  try {
    const housingTypes = await prisma.accommodationType.findMany({
      include: {
        _count: {
          select: {
            dhq_living_units: true
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

// POST: Create new accomodation type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const accommodationType = await prisma.accommodationType.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json(accommodationType, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}