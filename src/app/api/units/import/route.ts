import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { data, replaceExisting = false } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format. Expected non-empty array." },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replaceExisting is true, delete all existing records first
      if (replaceExisting) {
        await tx.dhqLivingUnit.deleteMany({});
      }

      // Insert new records
      const created = await tx.dhqLivingUnit.createMany({
        data: data.map(unit => ({
          quarterName: unit.quarter_name,
          location: unit.location,
          category: unit.category,
          accommodationTypeId: unit.accomodation_type_id,
          noOfRooms: unit.no_of_rooms,
          status: unit.status,
          typeOfOccupancy: unit.type_of_occupancy,
          bq: unit.bq,
          noOfRoomsInBq: unit.no_of_rooms_in_bq,
          blockName: unit.block_name,
          flatHouseRoomName: unit.flat_house_room_name,
          unitName: unit.unit_name,
        })),
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully imported ${result.count} records.`,
    });
  } catch (error) {
    console.error("Failed to import units:", error);
    return NextResponse.json(
      { error: "Failed to import units" },
      { status: 500 }
    );
  }
}