export const dynamic = "force-dynamic";

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

    // Map the data to match our TypeScript interface with snake_case
    const mappedHistory = history.map((record) => ({
      id: record.id,
      unit_id: record.unitId,
      occupant_name: record.occupantName,
      rank: record.rank,
      service_number: record.serviceNumber,
      start_date: record.startDate,
      end_date: record.endDate,
      duration_days: record.durationDays,
      reason_for_leaving: record.reasonForLeaving,
      created_at: record.createdAt,
    }));

    return NextResponse.json(mappedHistory);
  } catch (error) {
    console.error("Failed to fetch unit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit history" },
      { status: 500 }
    );
  }
}