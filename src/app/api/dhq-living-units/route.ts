export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/prisma-utils'

// GET: Fetch all DHQ living units with housing types
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const housingTypeId = searchParams.get('housingTypeId')
    const location = searchParams.get('location')

    const where: {
      OR?: Array<{
        quarterName?: { contains: string; mode: 'insensitive' }
        unitName?: { contains: string; mode: 'insensitive' }
        blockName?: { contains: string; mode: 'insensitive' }
        location?: { contains: string; mode: 'insensitive' }
      }>
      category?: string
      status?: string
      housingTypeId?: string
      location?: string
    } = {}

    if (search) {
      where.OR = [
        { quarterName: { contains: search, mode: 'insensitive' } },
        { unitName: { contains: search, mode: 'insensitive' } },
        { blockName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = category
    if (status) where.status = status
    if (housingTypeId) where.housingTypeId = housingTypeId
    if (location) where.location = location

    const units = await prisma.dhqLivingUnit.findMany({
      where,
      include: {
        housingType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(units)
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

// POST: Create a new DHQ living unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const unit = await prisma.dhqLivingUnit.create({
      data: {
        quarterName: body.quarterName,
        location: body.location,
        category: body.category,
        housingTypeId: body.housingTypeId,
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
        housingType: true,
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    const { message, status } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}