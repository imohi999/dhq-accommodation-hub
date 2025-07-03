export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/prisma-utils';

// GET: Fetch accommodation summary statistics
export async function GET(request: NextRequest) {
  try {
    // Get counts by status
    const [total, vacant, occupied, notInUse] = await Promise.all([
      prisma.dhqLivingUnit.count(),
      prisma.dhqLivingUnit.count({ where: { status: 'Vacant' } }),
      prisma.dhqLivingUnit.count({ where: { status: 'Occupied' } }),
      prisma.dhqLivingUnit.count({ where: { status: 'Not In Use' } }),
    ]);

    // Get counts by category
    const [men, nco, officer] = await Promise.all([
      prisma.dhqLivingUnit.count({ where: { category: 'Men' } }),
      prisma.dhqLivingUnit.count({ where: { category: 'NCO' } }),
      prisma.dhqLivingUnit.count({ where: { category: 'Officer' } }),
    ]);

    return NextResponse.json({
      total,
      vacant,
      occupied,
      notInUse,
      byCategory: {
        men,
        nco,
        officer,
      },
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}