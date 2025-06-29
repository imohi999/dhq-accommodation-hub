import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      quarterName,
      location,
      category,
      accommodationTypeId,
      noOfRooms,
      status,
      typeOfOccupancy,
      bq,
      noOfRoomsInBq,
      blockName,
      flatHouseRoomName,
      unitName,
      blockImageUrl,
      applyToAllUnits,
    } = body

    // Validate required fields
    if (!quarterName || typeof quarterName !== 'string' || quarterName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Quarter name is required' },
        { status: 400 }
      )
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    if (!accommodationTypeId || typeof accommodationTypeId !== 'string') {
      return NextResponse.json(
        { error: 'Accommodation type is required' },
        { status: 400 }
      )
    }

    if (!blockName || typeof blockName !== 'string' || blockName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Block name is required' },
        { status: 400 }
      )
    }

    if (!flatHouseRoomName || typeof flatHouseRoomName !== 'string' || flatHouseRoomName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Flat/House/Room name is required' },
        { status: 400 }
      )
    }

    // Check if accommodation type exists
    const accommodationType = await prisma.accommodationType.findUnique({
      where: { id: accommodationTypeId }
    })

    if (!accommodationType) {
      return NextResponse.json(
        { error: 'Invalid accommodation type' },
        { status: 400 }
      )
    }

    // Create new DHQ living unit
    const newUnit = await prisma.dhqLivingUnit.create({
      data: {
        quarterName: quarterName.trim(),
        location: location.trim(),
        category: category?.trim() || 'Other',
        accommodationTypeId,
        noOfRooms: noOfRooms || 1,
        status: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Vacant',
        typeOfOccupancy: typeOfOccupancy?.trim() || 'Single',
        bq: bq || false,
        noOfRoomsInBq: bq ? (noOfRoomsInBq || 0) : 0,
        blockName: blockName.trim(),
        flatHouseRoomName: flatHouseRoomName.trim(),
        unitName: unitName?.trim() || null,
        blockImageUrl: blockImageUrl?.trim() || null,
      },
      include: {
        accommodationType: true,
      }
    })

    // If applyToAllUnits is true and blockImageUrl is provided, update all units with the same quarterName
    if (applyToAllUnits && blockImageUrl && quarterName) {
      await prisma.dhqLivingUnit.updateMany({
        where: { 
          quarterName: quarterName.trim(),
          id: { not: newUnit.id } // Exclude the unit we just created
        },
        data: { blockImageUrl: blockImageUrl.trim() }
      })
    }

    return NextResponse.json(newUnit, { status: 201 })
  } catch (error) {
    console.error('Error creating DHQ living unit:', error)
    return NextResponse.json(
      { error: 'Failed to create accommodation unit' },
      { status: 500 }
    )
  }
}