export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma-utils'
import { getSession } from '@/lib/auth-utils'
import { AuditLogger } from '@/lib/audit-logger'

// GET: Fetch all DHQ  Accommodation with accommodation types, filtering, and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize
    
    // Filter parameters
    const search = searchParams.get('search')
    const quarterName = searchParams.get('quarterName')
    const location = searchParams.get('location')
    const category = searchParams.get('category')
    const accommodationTypeId = searchParams.get('accommodationTypeId')
    const status = searchParams.get('status')
    const typeOfOccupancy = searchParams.get('typeOfOccupancy')
    const blockName = searchParams.get('blockName')
    const flatHouseRoomName = searchParams.get('flatHouseRoomName')
    const unitName = searchParams.get('unitName')

    const where: any = {}

    // Search across multiple fields
    if (search) {
      where.OR = [
        { quarterName: { contains: search, mode: 'insensitive' } },
        { unitName: { contains: search, mode: 'insensitive' } },
        { blockName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { flatHouseRoomName: { contains: search, mode: 'insensitive' } },
        { currentOccupantName: { contains: search, mode: 'insensitive' } },
        { currentOccupantServiceNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Apply individual filters (only if not "all")
    if (quarterName && quarterName !== 'all') where.quarterName = quarterName
    if (location && location !== 'all') where.location = location
    if (category && category !== 'all') where.category = category
    if (accommodationTypeId && accommodationTypeId !== 'all') where.accommodationTypeId = accommodationTypeId
    if (status && status !== 'all') where.status = status
    if (typeOfOccupancy && typeOfOccupancy !== 'all') where.typeOfOccupancy = typeOfOccupancy
    if (blockName && blockName !== 'all') where.blockName = blockName
    if (flatHouseRoomName && flatHouseRoomName !== 'all') where.flatHouseRoomName = flatHouseRoomName
    if (unitName && unitName !== 'all') where.unitName = unitName

    // Get total count for pagination
    const totalCount = await prisma.dhqLivingUnit.count({ where })

    // Fetch paginated data
    const units = await prisma.dhqLivingUnit.findMany({
      where,
      include: {
        accommodationType: true,
        occupants: {
          include: {
            queue: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: pageSize,
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: units,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

// POST: Create a new DHQ living unit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const unit = await prisma.dhqLivingUnit.create({
      data: {
        quarterName: body.quarterName,
        location: body.location,
        category: body.category,
        accommodationTypeId: body.accommodationTypeId,
        noOfRooms: body.noOfRooms,
        status: body.status || 'Vacant',
        typeOfOccupancy: body.typeOfOccupancy,
        bq: body.bq || false,
        noOfRoomsInBq: body.noOfRoomsInBq || 0,
        blockName: body.blockName,
        flatHouseRoomName: body.flatHouseRoomName,
        unitName: body.unitName,
        blockImageUrl: body.blockImageUrl,
      },
      include: {
        accommodationType: true,
      },
    })

    // Log the unit creation
    await AuditLogger.logCreate(
      session.userId,
      'unit',
      unit.id,
      unit
    )

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}