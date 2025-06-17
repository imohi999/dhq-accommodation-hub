import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Unit name is required' },
        { status: 400 }
      )
    }

    // Check if unit already exists
    const existingUnit = await prisma.unit.findUnique({
      where: { name: name.trim() }
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Unit with this name already exists' },
        { status: 409 }
      )
    }

    // Create new unit
    const newUnit = await prisma.unit.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json(newUnit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}