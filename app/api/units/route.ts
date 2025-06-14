import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, paginate, searchFilter } from "@/lib/prisma-utils";

// GET: List all units with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const housingTypeId = searchParams.get('housingTypeId');
    const category = searchParams.get('category');
    
    // Build where clause
    const where = {
      AND: [
        search ? searchFilter(search, ['unitName', 'quarterName', 'location', 'blockName']) : {},
        status ? { status } : {},
        housingTypeId ? { housingTypeId } : {},
        category ? { category } : {}
      ]
    };
    
    const { skip, take } = paginate(page, limit);
    
    const [units, total] = await Promise.all([
      prisma.dhqLivingUnit.findMany({
        skip,
        take,
        where,
        include: {
          housingType: true,
          occupants: {
            where: { isCurrent: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.dhqLivingUnit.count({ where })
    ]);
    
    return NextResponse.json({
      data: units,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Create new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate unit name if not provided
    const unitName = body.unitName || `${body.blockName} ${body.flatHouseRoomName}`;
    
    const unit = await prisma.dhqLivingUnit.create({
      data: {
        ...body,
        unitName
      },
      include: {
        housingType: true
      }
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}