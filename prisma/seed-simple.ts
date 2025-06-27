import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data first (only tables that exist)
  console.log('🧹 Clearing existing data...')

  try {
    await prisma.$executeRaw`DELETE FROM allocation_requests`
    await prisma.$executeRaw`DELETE FROM past_allocations`
    await prisma.$executeRaw`DELETE FROM unit_occupants`
    await prisma.$executeRaw`DELETE FROM unit_history`
    await prisma.$executeRaw`DELETE FROM unit_inventory`
    await prisma.$executeRaw`DELETE FROM unit_maintenance`
    await prisma.$executeRaw`DELETE FROM dhq_living_units`
    await prisma.$executeRaw`DELETE FROM queue`
    await prisma.$executeRaw`DELETE FROM stamp_settings`
    await prisma.$executeRaw`DELETE FROM accommodation_types`
    await prisma.$executeRaw`DELETE FROM units`
    await prisma.$executeRaw`DELETE FROM profiles`
    await prisma.$executeRaw`DELETE FROM users`
  } catch (error) {
    console.error('Error clearing data:', error)
  }

  // Create a simple user and profile
  const hashedPassword = await bcrypt.hash('DAPlogin100%', 12)

  await prisma.$executeRaw`
    INSERT INTO users (id, email, hashed_password, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'admin@dhq.mil',
      ${hashedPassword},
      NOW(),
      NOW()
    )
  `

  const user = await prisma.$queryRaw<any[]>`
    SELECT id FROM users WHERE email = 'admin@dhq.mil' LIMIT 1
  `

  if (user && user[0]) {
    await prisma.$executeRaw`
      INSERT INTO profiles (id, user_id, username, full_name, role, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${user[0].id},
        'admin',
        'System Administrator',
        'superadmin',
        NOW(),
        NOW()
      )
    `
  }

  console.log('✅ Created admin user')

  // Create accommodation types
  const accommodationTypes = [
    { name: 'Duplex', description: 'Two-story residential unit' },
    { name: 'One Bedroom Flat', description: 'One bedroom apartment' },
    { name: 'One Bedroom Self Contained', description: 'Single bedroom with private facilities' },
    { name: 'Three Bedroom Flat', description: 'Three bedroom apartment' },
    { name: 'Two Bedroom Flat', description: 'Two bedroom apartment' }
  ]

  for (const type of accommodationTypes) {
    await prisma.$executeRaw`
      INSERT INTO accommodation_types (id, name, description, created_at)
      VALUES (gen_random_uuid(), ${type.name}, ${type.description}, NOW())
    `
  }

  console.log('✅ Created accommodation types')

  // Create units
  const units = [
    { name: 'DHQ', description: 'Defence Headquarters' },
    { name: 'DIA', description: 'Defence Intelligence Agency' },
    { name: 'DRDB', description: 'Defence Research and Development Bureau' },
    { name: 'DSA', description: 'Defence Space Administration' },
    { name: 'MPB', description: 'Military Police Battalion' }
  ]

  for (const unit of units) {
    await prisma.$executeRaw`
      INSERT INTO units (id, name, description, created_at)
      VALUES (gen_random_uuid(), ${unit.name}, ${unit.description}, NOW())
    `
  }

  console.log('✅ Created military units')

  // Add hasAllocationRequest column if it doesn't exist
  await prisma.$executeRaw`
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'queue' 
            AND column_name = 'has_allocation_request'
        ) THEN
            ALTER TABLE queue ADD COLUMN has_allocation_request BOOLEAN NOT NULL DEFAULT false;
        END IF;
    END $$;
  `

  console.log('✅ Added hasAllocationRequest column to queue table')

  // Create sample queue entries
  const queueEntries = [
    {
      fullName: 'Major Tunde Fashola',
      svcNo: 'NA/18234',
      gender: 'Male',
      armOfService: 'Nigerian Army',
      category: 'Officer',
      rank: 'Major',
      maritalStatus: 'Married',
      noOfAdultDependents: 1,
      noOfChildDependents: 3,
      currentUnit: '3 Division',
      appointment: 'Operations Officer',
      phone: '+2348098765432'
    },
    {
      fullName: 'Captain Salamatu Jibril',
      svcNo: 'NAF/29345',
      gender: 'Female',
      armOfService: 'Nigerian Air Force',
      category: 'Officer',
      rank: 'Captain',
      maritalStatus: 'Single',
      noOfAdultDependents: 0,
      noOfChildDependents: 0,
      currentUnit: '445 Air Mobility Group',
      appointment: 'Logistics Officer',
      phone: '+2348076543210'
    }
  ]

  let sequence = 1
  for (const entry of queueEntries) {
    await prisma.$executeRaw`
      INSERT INTO queue (
        id, sequence, full_name, svc_no, gender, arm_of_service, 
        category, rank, marital_status, no_of_adult_dependents, 
        no_of_child_dependents, current_unit, appointment, phone,
        has_allocation_request, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), ${sequence}, ${entry.fullName}, ${entry.svcNo}, 
        ${entry.gender}, ${entry.armOfService}, ${entry.category}, 
        ${entry.rank}, ${entry.maritalStatus}, ${entry.noOfAdultDependents}, 
        ${entry.noOfChildDependents}, ${entry.currentUnit}, ${entry.appointment}, 
        ${entry.phone}, false, NOW(), NOW()
      )
    `
    sequence++
  }

  console.log('✅ Created queue entries')

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