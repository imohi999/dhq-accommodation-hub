import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { paginate, searchFilter, handlePrismaError } from '@/lib/prisma-utils'

// GET /api/accommodations - Get all living units with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filters
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const housingType = searchParams.get('housingType')
    const category = searchParams.get('category')

    // Build where clause
    const where = {
      AND: [
        search ? searchFilter(search, ['quarterName', 'location', 'unitName', 'blockName']) : {},
        status ? { status } : {},
        housingType ? { housingTypeId: housingType } : {},
        category ? { category } : {},
      ]
    }

    // Get paginated results with housing type relation
    const { skip, take } = paginate(page, limit)
    
    const [units, total] = await Promise.all([
      prisma.dhqLivingUnit.findMany({
        skip,
        take,
        where,
        orderBy: { unitName: 'asc' },
        include: {
          housingType: true,
          _count: {
            select: {
              history: true,
              inventory: true,
              maintenance: true,
            }
          }
        }
      }),
      prisma.dhqLivingUnit.count({ where })
    ])
    
    const result = {
      data: units,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching accommodations:', error)
    const { message } = handlePrismaError(error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// POST /api/accommodations - Create new living unit
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const schema = z.object({
      quarterName: z.string().min(1),
      location: z.string().min(1),
      category: z.string().min(1),
      housingTypeId: z.string().uuid(),
      noOfRooms: z.number().int().min(0).default(0),
      status: z.enum(['Vacant', 'Occupied', 'Not In Use']).default('Vacant'),
      typeOfOccupancy: z.enum(['Single', 'Shared']).default('Single'),
      bq: z.boolean().default(false),
      noOfRoomsInBq: z.number().int().min(0).default(0),
      blockName: z.string().min(1),
      flatHouseRoomName: z.string().min(1),
      blockImageUrl: z.string().url().optional(),
    })

    const validatedData = schema.parse(body)

    // Generate unit name if not provided
    const unitName = `${validatedData.blockName} ${validatedData.flatHouseRoomName}`

    const newUnit = await prisma.dhqLivingUnit.create({
      data: {
        ...validatedData,
        unitName,
      },
      include: {
        housingType: true
      }
    })

    return NextResponse.json(newUnit, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    const { message } = handlePrismaError(error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}