import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to import
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile || !["superadmin", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data } = await request.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Get all existing units for case-insensitive mapping
    const existingUnits = await prisma.unit.findMany();
    const unitMap = new Map(
      existingUnits.map(unit => [unit.name.toLowerCase(), unit.name])
    );

    // Pre-check for existing service numbers to avoid transaction issues
    const existingServiceNumbers = await prisma.queue.findMany({
      where: {
        svcNo: {
          in: data.map(record => record.svcNo)
        }
      },
      select: { svcNo: true }
    });
    
    const existingSvcNoSet = new Set(existingServiceNumbers.map(q => q.svcNo));

    // Start transaction with increased timeout for large imports
    const result = await prisma.$transaction(async (tx) => {
      for (const record of data) {
        try {
          // Check if service number already exists (using pre-fetched data)
          if (existingSvcNoSet.has(record.svcNo)) {
            skipped++;
            errors.push(`Service number ${record.svcNo} already exists`);
            continue;
          }

          // Map unit name (case-insensitive)
          const mappedUnitName = record.currentUnit
            ? unitMap.get(record.currentUnit.toLowerCase()) || record.currentUnit
            : null;

          // Build dependents array from individual fields
          const dependents = [];
          for (let i = 1; i <= 6; i++) {
            const nameField = `dependent${i}Name`;
            const genderField = `dependent${i}Gender`;
            const ageField = `dependent${i}Age`;
            
            if (record[nameField]?.trim()) {
              dependents.push({
                name: record[nameField].trim(),
                gender: record[genderField]?.trim() || "Unknown",
                age: parseInt(record[ageField]) || 0,
              });
            }
          }

          // Calculate dependent counts from individual dependents
          let adultDependents = 0;
          let childDependents = 0;
          
          dependents.forEach(dep => {
            if (dep.age >= 18) {
              adultDependents++;
            } else {
              childDependents++;
            }
          });

          // Create queue entry
          const queueEntry = await tx.queue.create({
            data: {
              sequence: record.sequence,
              fullName: record.fullName,
              svcNo: record.svcNo,
              gender: record.gender,
              armOfService: record.armOfService,
              category: record.category,
              rank: record.rank,
              maritalStatus: record.maritalStatus,
              noOfAdultDependents: adultDependents || 0,
              noOfChildDependents: childDependents || 0,
              currentUnit: mappedUnitName,
              appointment: record.appointment,
              phone: record.phone,
              dateTos: new Date(), // Default date for imported records
              dependents: dependents.length > 0 ? dependents : undefined,
              hasAllocationRequest: true, // They're being allocated
            },
          });
          
          // Add to the set to prevent duplicates within the same import
          existingSvcNoSet.add(record.svcNo);

          // Find the unit (case-insensitive)
          let existingUnit = await tx.dhqLivingUnit.findFirst({
            where: {
              AND: [
                { blockName: { equals: record.blockName, mode: "insensitive" } },
                { flatHouseRoomName: { equals: record.flatHouseRoomName, mode: "insensitive" } },
                { quarterName: { equals: record.quarterName, mode: "insensitive" } },
                { location: { equals: record.location, mode: "insensitive" } },
              ],
            },
          });

          if (!existingUnit) {
            // Try to create the unit using data from similar units
            try {
              // Find a similar unit with the same quarterName and location to use as template
              const similarUnit = await tx.dhqLivingUnit.findFirst({
                where: {
                  quarterName: { equals: record.quarterName, mode: "insensitive" },
                  location: { equals: record.location, mode: "insensitive" },
                },
              });

              if (similarUnit) {
                // Create new unit based on similar unit's data
                existingUnit = await tx.dhqLivingUnit.create({
                  data: {
                    quarterName: record.quarterName,
                    location: record.location,
                    category: similarUnit.category,
                    accommodationTypeId: similarUnit.accommodationTypeId,
                    noOfRooms: similarUnit.noOfRooms,
                    status: "Vacant",
                    typeOfOccupancy: similarUnit.typeOfOccupancy,
                    bq: similarUnit.bq,
                    noOfRoomsInBq: similarUnit.noOfRoomsInBq,
                    blockName: record.blockName,
                    flatHouseRoomName: record.flatHouseRoomName,
                    unitName: `${record.blockName} ${record.flatHouseRoomName}`,
                    blockImageUrl: null,
                    currentOccupantId: null,
                    currentOccupantName: null,
                    currentOccupantRank: null,
                    currentOccupantServiceNumber: null,
                    occupancyStartDate: null,
                  },
                });
                console.log(`Created new unit: ${existingUnit.unitName}`);
              } else {
                // No similar unit found, create with default values
                // Try to determine category based on rank
                const isOfficer = ["Lt Col", "Col", "Brig Gen", "Maj Gen", "Lt Gen", "Gen", "Maj", "Capt", "Lt", "2nd Lt", "Lt Cdr", "Cdr", "Capt", "RAdm", "VAdm", "Adm", "Sqn Ldr", "Wg Cdr", "Gp Capt", "AVM", "AM", "ACM"].some(
                  rank => record.rank?.includes(rank)
                );
                const category = isOfficer ? "Officer" : "NCO";

                // Get or create a default accommodation type
                let accommodationType = await tx.accommodationType.findFirst({
                  where: { name: "Two Bedroom Flat" }
                });

                if (!accommodationType) {
                  accommodationType = await tx.accommodationType.create({
                    data: {
                      name: "Two Bedroom Flat",
                      description: "Two bedroom apartment"
                    }
                  });
                }

                existingUnit = await tx.dhqLivingUnit.create({
                  data: {
                    quarterName: record.quarterName,
                    location: record.location,
                    category: category,
                    accommodationTypeId: accommodationType.id,
                    noOfRooms: 2,
                    status: "Vacant",
                    typeOfOccupancy: "Single",
                    bq: false,
                    noOfRoomsInBq: 0,
                    blockName: record.blockName,
                    flatHouseRoomName: record.flatHouseRoomName,
                    unitName: `${record.blockName} ${record.flatHouseRoomName}`,
                    blockImageUrl: null,
                    currentOccupantId: null,
                    currentOccupantName: null,
                    currentOccupantRank: null,
                    currentOccupantServiceNumber: null,
                    occupancyStartDate: null,
                  },
                });
                console.log(`Created new unit with defaults: ${existingUnit.unitName}`);
              }
            } catch (createError: any) {
              console.error(`Failed to create unit for ${record.svcNo}:`, createError);
              errors.push(
                `Failed to create unit: ${record.quarterName} ${record.blockName} ${record.flatHouseRoomName} for ${record.svcNo}: ${createError.message}`
              );
              skipped++;
              continue;
            }
          }

          // Check if unit is already occupied
          if (existingUnit.status === "Occupied") {
            errors.push(
              `Unit ${existingUnit.unitName} is already occupied for ${record.svcNo}`
            );
            skipped++;
            continue;
          }

          // Update existing unit to occupied
          await tx.dhqLivingUnit.update({
            where: { id: existingUnit.id },
            data: {
              status: "Occupied",
              currentOccupantId: queueEntry.id,
              currentOccupantName: record.fullName,
              currentOccupantRank: record.rank,
              currentOccupantServiceNumber: record.svcNo,
              occupancyStartDate: new Date(),
            },
          });
          
          const unitId = existingUnit.id;

          // Create unit occupant record
          await tx.unitOccupant.create({
            data: {
              unitId: unitId,
              queueId: queueEntry.id,
              fullName: record.fullName,
              rank: record.rank,
              serviceNumber: record.svcNo,
              phone: record.phone,
              occupancyStartDate: new Date(),
              isCurrent: true,
            },
          });

          // Create unit history record
          await tx.unitHistory.create({
            data: {
              unitId: unitId,
              occupantName: record.fullName,
              rank: record.rank,
              serviceNumber: record.svcNo,
              startDate: new Date(),
            },
          });

          // Get accommodation type for the unit
          const accommodationType = await tx.accommodationType.findUnique({
            where: { id: existingUnit.accommodationTypeId },
          });

          // Generate allocation letter ID
          const currentYear = new Date().getFullYear();
          const count = await tx.allocationRequest.count();
          const paddedCount = (count + 1).toString().padStart(4, "0");
          const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;

          // Create allocation request (already approved)
          await tx.allocationRequest.create({
            data: {
              personnelId: queueEntry.id,
              queueId: queueEntry.id,
              unitId: unitId,
              letterId: letterId,
              status: "approved",
              approvedBy: session.userId,
              approvedAt: new Date(),
              personnelData: {
                id: queueEntry.id,
                fullName: record.fullName,
                svcNo: record.svcNo,
                rank: record.rank,
                category: record.category,
                gender: record.gender,
                armOfService: record.armOfService,
                maritalStatus: record.maritalStatus,
                noOfAdultDependents: adultDependents || 0,
                noOfChildDependents: childDependents || 0,
                phone: record.phone,
                currentUnit: mappedUnitName,
                appointment: record.appointment,
                sequence: record.sequence,
              },
              unitData: {
                quarterName: existingUnit.quarterName,
                location: existingUnit.location,
                unitName: existingUnit.unitName || "",
                accommodationType: accommodationType?.name || "Unknown",
                noOfRooms: existingUnit.noOfRooms,
              },
            },
          });

          imported++;
        } catch (error: any) {
          console.error(`Error processing record ${record.svcNo}:`, error);
          const errorMessage = error?.message || String(error);
          errors.push(`Failed to process ${record.svcNo}: ${errorMessage}`);
          skipped++;
        }
      }

      return { imported, skipped, errors };
    }, {
      maxWait: 6000000, // 60 seconds max wait
      timeout: 12000000, // 120 seconds timeout for the transaction
    });

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    
    // Handle Prisma transaction errors specifically
    if (error?.code === 'P2028') {
      return NextResponse.json(
        { error: "Transaction timeout. Please try importing fewer records at once." },
        { status: 500 }
      );
    }
    
    const errorMessage = error?.message || "Failed to import data";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}