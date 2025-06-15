import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";
import { Prisma } from "@prisma/client";

// GET: List all past allocations
export async function GET() {
  try {
    const pastAllocations = await prisma.pastAllocation.findMany({
      orderBy: {
        deallocationDate: 'desc'
      }
    });

    return NextResponse.json(pastAllocations);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Create new past allocation (when deallocating)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allocationId, reason, comments, directDeallocation } = body;

    // Start a transaction to handle deallocation
    const result = await prisma.$transaction(async (tx) => {
      // Handle direct deallocation (no allocation request)
      if (directDeallocation) {
        const { unitId, personnelData, unitData, startDate } = directDeallocation;
        
        // Create past allocation record directly
        const pastAllocation = await tx.pastAllocation.create({
          data: {
            personnelId: crypto.randomUUID(),
            unitId: unitId,
            allocationStartDate: startDate || new Date(),
            allocationEndDate: new Date(),
            deallocationDate: new Date(),
            reasonForLeaving: reason || "Manual deallocation",
            letterId: `DEALLOC-${Date.now()}`,
            personnelData: personnelData,
            unitData: unitData
          }
        });

        // Update unit status to vacant
        await tx.dhqLivingUnit.update({
          where: { id: unitId },
          data: { 
            status: 'Vacant',
            currentOccupantId: null,
            currentOccupantName: null,
            currentOccupantRank: null,
            currentOccupantServiceNumber: null,
            occupancyStartDate: null
          }
        });

        return pastAllocation;
      }
      
      // Get the current allocation
      const allocation = await tx.allocationRequest.findUnique({
        where: { id: allocationId },
        include: {
          unit: {
            include: {
              housingType: true
            }
          }
        }
      });

      if (!allocation) {
        throw new Error("Allocation not found");
      }

      // Create past allocation record
      const pastAllocation = await tx.pastAllocation.create({
        data: {
          personnelId: allocation.personnelId,
          unitId: allocation.unitId,
          allocationStartDate: allocation.approvedAt || allocation.createdAt,
          allocationEndDate: new Date(),
          deallocationDate: new Date(),
          reasonForLeaving: reason || "Deallocated",
          letterId: allocation.letterId,
          personnelData: allocation.personnelData as Prisma.InputJsonValue,
          unitData: allocation.unitData as Prisma.InputJsonValue
        }
      });

      // Update the allocation request status
      await tx.allocationRequest.update({
        where: { id: allocationId },
        data: {
          status: 'deallocated'
        }
      });

      // Update unit status to vacant
      await tx.dhqLivingUnit.update({
        where: { id: allocation.unitId },
        data: { 
          status: 'Vacant',
          currentOccupantId: null,
          currentOccupantName: null,
          currentOccupantRank: null,
          currentOccupantServiceNumber: null,
          occupancyStartDate: null
        }
      });

      return pastAllocation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Allocation not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}