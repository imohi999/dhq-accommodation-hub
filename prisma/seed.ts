import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dhq.mil' },
    update: {},
    create: {
      email: 'admin@dhq.mil',
      hashedPassword,
      profile: {
        create: {
          username: 'admin',
          fullName: 'System Administrator',
          role: 'superadmin'
        }
      }
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create housing types
  const housingTypes = [
    { name: 'One Bedroom Flat', description: '1BR unit suitable for singles or couples' },
    { name: 'Two Bedroom Flat', description: '2BR unit suitable for small families' },
    { name: 'Three Bedroom Flat', description: '3BR unit suitable for larger families' },
    { name: 'Duplex', description: 'Two-story unit with multiple bedrooms' },
    { name: 'Self Contained', description: 'Studio-type accommodation' },
    { name: 'Boys Quarter', description: 'Auxiliary accommodation unit' }
  ]

  for (const ht of housingTypes) {
    await prisma.housingType.upsert({
      where: { name: ht.name },
      update: {},
      create: ht
    })
  }

  console.log('✅ Created housing types')

  // Create units
  const units = [
    { name: 'DHQ Command', description: 'Defence Headquarters Command' },
    { name: 'Army HQ', description: 'Army Headquarters' },
    { name: 'Navy HQ', description: 'Navy Headquarters' },
    { name: 'Air Force HQ', description: 'Air Force Headquarters' },
    { name: 'Admin Unit', description: 'Administrative Unit' },
    { name: 'Medical Corps', description: 'Medical Corps Unit' }
  ]

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit
    })
  }

  console.log('✅ Created military units')

  // Create sample living units
  const oneBedroom = await prisma.housingType.findFirst({ where: { name: 'One Bedroom Flat' } })
  const twoBedroom = await prisma.housingType.findFirst({ where: { name: 'Two Bedroom Flat' } })

  if (oneBedroom && twoBedroom) {
    const livingUnits = [
      {
        quarterName: 'Alpha Quarters',
        location: 'Main Base',
        category: 'Officer',
        housingTypeId: twoBedroom.id,
        noOfRooms: 2,
        status: 'Vacant',
        typeOfOccupancy: 'Single',
        blockName: 'Block A',
        flatHouseRoomName: 'Flat 101',
        unitName: 'Block A Flat 101'
      },
      {
        quarterName: 'Bravo Quarters',
        location: 'East Wing',
        category: 'Men',
        housingTypeId: oneBedroom.id,
        noOfRooms: 1,
        status: 'Vacant',
        typeOfOccupancy: 'Single',
        blockName: 'Block B',
        flatHouseRoomName: 'Room 201',
        unitName: 'Block B Room 201'
      }
    ]

    for (const lu of livingUnits) {
      await prisma.dhqLivingUnit.create({ data: lu })
    }

    console.log('✅ Created sample living units')
  }

  // Create stamp settings
  await prisma.stampSetting.create({
    data: {
      stampName: 'Maj Gen A.B. Johnson',
      stampRank: 'Major General',
      stampAppointment: 'Director, Personnel Management',
      stampNote: 'For and on behalf of the Chief of Defence Staff',
      isActive: true
    }
  })

  console.log('✅ Created stamp settings')

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })