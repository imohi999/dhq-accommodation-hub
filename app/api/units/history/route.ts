import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get("unitId");
    
    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }

    const history = await prisma.unitHistory.findMany({
      where: { unitId },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch unit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit history" },
      { status: 500 }
    );
  }
}