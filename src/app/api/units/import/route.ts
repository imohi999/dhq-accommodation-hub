import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format. Expected non-empty array." },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Insert new records, skipping duplicates
      const created = await tx.dhqLivingUnit.createMany({
        data: data.map(unit => ({
          quarterName: unit.quarter_name,
          location: unit.location,
          category: unit.category,
          accommodationTypeId: unit.accommodation_type_id,
          noOfRooms: unit.no_of_rooms,
          status: unit.status,
          typeOfOccupancy: unit.type_of_occupancy,
          bq: unit.bq,
          noOfRoomsInBq: unit.no_of_rooms_in_bq,
          blockName: unit.block_name,
          flatHouseRoomName: unit.flat_house_room_name,
          unitName: unit.unit_name,
        })),
        skipDuplicates: true,
      });

      return { created };
    });

    return NextResponse.json({
      success: true,
      count: result.created.count,
      message: `Successfully imported ${result.created.count} new records. Duplicates were skipped.`,
      details: {
        imported: result.created.count,
        totalInFile: data.length,
        skipped: data.length - result.created.count
      }
    });
  } catch (error) {
    console.error("Failed to import units:", error);

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && 'code' in error ? (error as any).code : undefined;

    return NextResponse.json(
      {
        error: "Failed to import units",
        details: errorMessage,
        code: errorDetails
      },
      { status: 500 }
    );
  }
}