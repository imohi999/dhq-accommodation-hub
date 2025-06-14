import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

// GET: List all stamp settings
export async function GET() {
  try {
    const stampSettings = await prisma.stampSetting.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(stampSettings);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Create new stamp setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stampName, stampRank, stampAppointment, stampNote } = body;

    // Deactivate all other stamps if this one is active
    if (body.isActive !== false) {
      await prisma.stampSetting.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const stampSetting = await prisma.stampSetting.create({
      data: {
        stampName,
        stampRank,
        stampAppointment,
        stampNote,
        isActive: body.isActive !== false
      }
    });

    return NextResponse.json(stampSetting, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}