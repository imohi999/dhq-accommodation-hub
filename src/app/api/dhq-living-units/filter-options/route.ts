export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/prisma-utils';

// GET: Fetch unique values for filter options
export async function GET(request: NextRequest) {
  try {
    // Get all unique values for filters
    const [
      quarterNames,
      locations,
      categories,
      blockNames,
      flatHouseRoomNames,
      unitNames,
    ] = await Promise.all([
      prisma.dhqLivingUnit.findMany({
        select: { quarterName: true },
        distinct: ['quarterName'],
        orderBy: { quarterName: 'asc' },
      }),
      prisma.dhqLivingUnit.findMany({
        select: { location: true },
        distinct: ['location'],
        orderBy: { location: 'asc' },
      }),
      prisma.dhqLivingUnit.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
      prisma.dhqLivingUnit.findMany({
        select: { blockName: true },
        distinct: ['blockName'],
        orderBy: { blockName: 'asc' },
      }),
      prisma.dhqLivingUnit.findMany({
        select: { flatHouseRoomName: true },
        distinct: ['flatHouseRoomName'],
        orderBy: { flatHouseRoomName: 'asc' },
      }),
      prisma.dhqLivingUnit.findMany({
        select: { unitName: true },
        distinct: ['unitName'],
        where: { unitName: { not: null } },
        orderBy: { unitName: 'asc' },
      }),
    ]);

    return NextResponse.json({
      quarterNames: quarterNames.map(item => item.quarterName),
      locations: locations.map(item => item.location),
      categories: categories.map(item => item.category),
      blockNames: blockNames.map(item => item.blockName),
      flatHouseRoomNames: flatHouseRoomNames.map(item => item.flatHouseRoomName).filter(Boolean),
      unitNames: unitNames.map(item => item.unitName).filter(Boolean),
      // Static options that don't need database queries
      statuses: ['Vacant', 'Occupied', 'Not In Use'],
      occupancyTypes: ['Single', 'Shared'],
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}