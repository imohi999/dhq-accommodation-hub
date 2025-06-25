import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data first
  console.log('🧹 Clearing existing data...')
  
  // Clear in correct order to avoid foreign key constraints
  try {
    // Try to delete clearance inspections if table exists
    try {
      await prisma.clearanceInspection.deleteMany({})
    } catch (e) {
      console.log('⚠️  ClearanceInspection table not found, skipping...')
    }
    
    await prisma.allocationRequest.deleteMany({})
    await prisma.pastAllocation.deleteMany({})
    await prisma.unitOccupant.deleteMany({})
    await prisma.unitHistory.deleteMany({})
    await prisma.unitInventory.deleteMany({})
    await prisma.unitMaintenance.deleteMany({})
    await prisma.dhqLivingUnit.deleteMany({})
    await prisma.queue.deleteMany({})
    await prisma.stampSetting.deleteMany({})
    await prisma.accommodationType.deleteMany({})
    await prisma.unit.deleteMany({})
    
    // Try to delete page permissions if table exists
    try {
      await prisma.pagePermission.deleteMany({})
    } catch (e) {
      console.log('⚠️  PagePermission table not found, skipping...')
    }
    
    // Clear auth-related tables
    try {
      await prisma.auditLog.deleteMany({})
    } catch (e) {
      console.log('⚠️  AuditLog table not found, skipping...')
    }
    
    try {
      await prisma.authSession.deleteMany({})
    } catch (e) {
      console.log('⚠️  AuthSession table not found, skipping...')
    }
    
    try {
      await prisma.userRole.deleteMany({})
    } catch (e) {
      console.log('⚠️  UserRole table not found, skipping...')
    }
    
    await prisma.profile.deleteMany({})
    await prisma.user.deleteMany({})
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  }

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@dhq.mil',
      hashedPassword,
      emailVerified: new Date(),
      profile: {
        create: {
          fullName: 'System Administrator',
          role: 'superadmin'
        }
      }
    }
  })

  console.log('✅ Created superadmin user:')
  console.log('   Email:', adminUser.email)
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('   Role: superadmin')

  // Define all available pages/menu items
  const allPages = [
    { pageKey: 'dashboard', pageTitle: 'Dashboard', parentKey: null },
    { pageKey: 'queue', pageTitle: 'Queue', parentKey: null },
    { pageKey: 'queue.list', pageTitle: 'Queue List', parentKey: 'queue' },
    { pageKey: 'queue.units', pageTitle: 'Current Units', parentKey: 'queue' },
    { pageKey: 'allocations', pageTitle: 'Allocations', parentKey: null },
    { pageKey: 'allocations.pending', pageTitle: 'Pending Approval', parentKey: 'allocations' },
    { pageKey: 'allocations.active', pageTitle: 'Active Allocations', parentKey: 'allocations' },
    { pageKey: 'allocations.past', pageTitle: 'Past Allocations', parentKey: 'allocations' },
    { pageKey: 'allocations.clearance', pageTitle: 'Clearance', parentKey: 'allocations' },
    { pageKey: 'allocations.stamp-settings', pageTitle: 'Stamp Settings', parentKey: 'allocations' },
    { pageKey: 'directory', pageTitle: 'Directory', parentKey: null },
    { pageKey: 'analytics', pageTitle: 'Analytics', parentKey: null },
    { pageKey: 'analytics.queue', pageTitle: 'Queue Analytics', parentKey: 'analytics' },
    { pageKey: 'analytics.pending', pageTitle: 'Pending Allocation Analytics', parentKey: 'analytics' },
    { pageKey: 'analytics.active-allocations', pageTitle: 'Active Allocations', parentKey: 'analytics' },
    { pageKey: 'analytics.past-allocations', pageTitle: 'Past Allocations', parentKey: 'analytics' },
    { pageKey: 'accommodation', pageTitle: 'Accommodation', parentKey: null },
    { pageKey: 'accommodation.units', pageTitle: 'DHQ Accommodation', parentKey: 'accommodation' },
    { pageKey: 'accommodation.types', pageTitle: 'Accommodation Types', parentKey: 'accommodation' },
    { pageKey: 'maintenance', pageTitle: 'Maintenance', parentKey: null },
    { pageKey: 'maintenance.tasks', pageTitle: 'Maintenance Tasks', parentKey: 'maintenance' },
    { pageKey: 'maintenance.requests', pageTitle: 'Maintenance Requests', parentKey: 'maintenance' },
    { pageKey: 'administration', pageTitle: 'Administration', parentKey: null },
    { pageKey: 'administration.users', pageTitle: 'User Management', parentKey: 'administration' },
    { pageKey: 'administration.roles', pageTitle: 'Role Profiles', parentKey: 'administration' },
    { pageKey: 'administration.audit-logs', pageTitle: 'Audit Logs', parentKey: 'administration' },
    { pageKey: 'administration.auth-info', pageTitle: 'Authentication Info', parentKey: 'administration' },
  ]

  // Get the admin's profile
  const adminProfile = await prisma.profile.findUnique({
    where: { userId: adminUser.id }
  })

  // Give superadmin all permissions
  if (adminProfile) {
    try {
      for (const page of allPages) {
        await prisma.pagePermission.create({
          data: {
            profileId: adminProfile.id,
            pageKey: page.pageKey,
            pageTitle: page.pageTitle,
            parentKey: page.parentKey,
            canView: true,
            canEdit: true,
            canDelete: true
          }
        })
      }
      console.log('✅ Created page permissions for superadmin')
    } catch (e) {
      console.log('⚠️  Could not create page permissions, table might not exist')
    }
  }

  // Create accommodation types
  const housingTypesData = [
    {
      id: "d403ff01-4ac9-40e5-bcea-8a3a04c89899",
      name: "Duplex",
      description: "Two-story residential unit"
    },
    {
      id: "6775548e-9191-4e12-b8ac-626e38d15403",
      name: "One Bedroom Flat",
      description: "One bedroom apartment"
    },
    {
      id: "301e92b3-1083-4340-a800-f4e21a20b9c7",
      name: "One Bedroom Self Contained",
      description: "Single bedroom with private facilities"
    },
    {
      id: "e325e19c-f673-4cb2-b36c-0345c2f9f206",
      name: "Three Bedroom Flat",
      description: "Three bedroom apartment"
    },
    {
      id: "644aa118-5dbb-40ef-8e9d-e79873662859",
      name: "Two Bedroom Flat",
      description: "Two bedroom apartment"
    }
  ]

  for (const ht of housingTypesData) {
    await prisma.accommodationType.create({ data: ht })
  }

  console.log('✅ Created accommodation types')

  // Create units
  const unitsData = [
    {
      id: "a1388c62-a98d-4e47-a793-a4191c2504e5",
      name: "DHQ",
      description: "Defence Headquarters"
    },
    {
      id: "6de56f99-ae3c-4c2d-910e-98129fc27e04",
      name: "DIA",
      description: "Defence Intelligence Agency"
    },
    {
      id: "94f35caf-3130-48fd-a0b3-e3fd9cd4868c",
      name: "DRDB",
      description: "Defence Research and Development Bureau"
    },
    {
      id: "e72edc78-6cb9-4c17-be1a-8b68fca83399",
      name: "DSA",
      description: "Defence Space Administration"
    },
    {
      id: "22aba0fb-64bf-4b37-b048-6277264ea8c0",
      name: "MPB",
      description: "Military Police Battalion"
    }
  ]

  for (const unit of unitsData) {
    await prisma.unit.create({ data: unit })
  }

  console.log('✅ Created military units')

  // Create stamp settings
  await prisma.stampSetting.create({
    data: {
      id: "28fee2cd-8f5d-415a-8c04-9fb31d7a1c39",
      stampName: "IB OKAFOR",
      stampRank: "Capt.",
      stampAppointment: "Ag QM",
      stampNote: "for Comd",
      copyTo: "1. Chief of Staff\n2. Director of Operations\n3. Adjutant General",
      isActive: true
    }
  })

  console.log('✅ Created stamp settings')

  // Create queue entries
  const queueData = [
    {
      id: "c935e9e1-6829-4a5e-be78-763e5daeb670",
      sequence: 1,
      fullName: "Aisha Okafor",
      svcNo: "NA/17127/79",
      gender: "Female",
      armOfService: "Nigerian Army",
      category: "Officer",
      rank: "Sqn Ldr",
      maritalStatus: "Married",
      noOfAdultDependents: 1,
      noOfChildDependents: 1,
      dependents: [
        { name: "John Okafor", gender: "Male", age: 35 },
        { name: "Sarah Okafor", gender: "Female", age: 8 }
      ],
      currentUnit: "Naval Command",
      appointment: "Staff Officer",
      phone: "+234-8044233738",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "0cc97e1e-0f52-48ad-8ea5-35a5a321dec0",
      sequence: 2,
      fullName: "Emeka Adebayo",
      svcNo: "AF/84591/22",
      gender: "Male",
      armOfService: "Nigerian Air Force",
      category: "Officer",
      rank: "Sqn Ldr",
      maritalStatus: "Single",
      noOfAdultDependents: 1,
      noOfChildDependents: 2,
      dependents: [
        { name: "Mary Adebayo", gender: "Female", age: 65 },
        { name: "David Adebayo", gender: "Male", age: 12 },
        { name: "Grace Adebayo", gender: "Female", age: 10 }
      ],
      currentUnit: "Naval Command",
      appointment: "Staff Officer",
      phone: "+234-8093386438",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "59d3081d-9625-42e0-9ef7-0a547d39996d",
      sequence: 3,
      fullName: "Oluwaseun Balogun",
      svcNo: "NN/65461/71",
      gender: "Male",
      armOfService: "Nigerian Navy",
      category: "Officer",
      rank: "Lt Cdr",
      maritalStatus: "Married",
      noOfAdultDependents: 0,
      noOfChildDependents: 0,
      dependents: [],
      currentUnit: "Medical Corps",
      appointment: "Staff Officer",
      phone: "+234-8090141298",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "e4b5fed3-7972-48c8-b08d-ee1dd6c39c6e",
      sequence: 4,
      fullName: "Ibrahim Mohammed",
      svcNo: "NN/62775/20",
      gender: "Male",
      armOfService: "Nigerian Navy",
      category: "Officer",
      rank: "Lt",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 1,
      dependents: [
        { name: "Amina Mohammed", gender: "Female", age: 6 }
      ],
      currentUnit: "Air Defence",
      appointment: "Staff Officer",
      phone: "+234-8042714278",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "cdebec59-931b-4565-ba8f-d677b0a362b3",
      sequence: 5,
      fullName: "Chijioke Eze",
      svcNo: "AF/56838/94",
      gender: "Male",
      armOfService: "Nigerian Air Force",
      category: "Officer",
      rank: "Lt Col",
      maritalStatus: "Married",
      noOfAdultDependents: 0,
      noOfChildDependents: 0,
      currentUnit: "Naval Command",
      appointment: "Technician",
      phone: "+234-8035863891",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "180d800e-ff6f-4cb5-83e0-0320b6377acc",
      sequence: 6,
      fullName: "Yakubu Danjuma",
      svcNo: "AF/94452/88",
      gender: "Male",
      armOfService: "Nigerian Air Force",
      category: "NCOs",
      rank: "SSgt",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 2,
      currentUnit: "Air Defence",
      appointment: "Technician",
      phone: "+234-808426565",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "71d533d4-c355-4122-898c-b337a5112192",
      sequence: 7,
      fullName: "Funke Ogunleye",
      svcNo: "AF/62542/50",
      gender: "Female",
      armOfService: "Nigerian Air Force",
      category: "NCOs",
      rank: "SSgt",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 0,
      currentUnit: "Medical Corps",
      appointment: "Technician",
      phone: "+234-8032973381",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "863065bb-bfb0-42cf-86e8-d1031abaf677",
      sequence: 8,
      fullName: "Blessing Akpan",
      svcNo: "AF/43765/72",
      gender: "Female",
      armOfService: "Nigerian Air Force",
      category: "NCOs",
      rank: "FS",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 1,
      currentUnit: "Naval Command",
      appointment: "Technician",
      phone: "+234-8093388219",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    }
  ]

  // Add 72 more queue entries to make 80 total
  const additionalQueueEntries = []
  const nigerianNames = [
    { male: "Adewale Ogunbiyi", female: "Fatima Abdullahi" },
    { male: "Chukwudi Nwosu", female: "Amina Yusuf" },
    { male: "Babatunde Akinwale", female: "Ngozi Okoro" },
    { male: "Musa Garba", female: "Halima Suleiman" },
    { male: "Olumide Fasanya", female: "Folake Adeyemi" },
    { male: "Usman Aliyu", female: "Zainab Hassan" },
    { male: "Ikechukwu Obi", female: "Bukola Adeleke" },
    { male: "Ahmed Bello", female: "Chioma Nwankwo" },
    { male: "Ayodele Oladipo", female: "Safiya Umar" },
    { male: "Emmanuel Ekwueme", female: "Yetunde Bakare" },
    { male: "Sani Abubakar", female: "Adaeze Igwe" },
    { male: "Tayo Olatunji", female: "Hauwa Ibrahim" }
  ]

  for (let i = 9; i <= 20; i++) {
    const isOfficer = i <= 12
    const isMale = i % 2 === 0
    const nameIndex = (i - 9) % nigerianNames.length
    const fullName = isMale ? nigerianNames[nameIndex].male : nigerianNames[nameIndex].female
    const maritalStatus = ['Single', 'Married', 'Divorced', 'Widowed'][i % 4]
    const noOfAdultDependents = i % 3
    const noOfChildDependents = i % 4

    // Generate dependents based on marital status and dependent counts
    const dependents = []
    if (maritalStatus === 'Married' && !isMale) {
      // Add spouse for married females
      dependents.push({
        name: `${fullName.split(' ')[1]} ${['James', 'John', 'Peter', 'Paul'][i % 4]}`,
        gender: 'Male' as const,
        age: 35 + (i % 10)
      })
    }

    // Add children based on child count
    for (let c = 0; c < noOfChildDependents; c++) {
      dependents.push({
        name: `${['Emma', 'Joy', 'David', 'Grace', 'Samuel', 'Faith'][c % 6]} ${fullName.split(' ')[1]}`,
        gender: c % 2 === 0 ? 'Male' as const : 'Female' as const,
        age: 5 + (c * 3)
      })
    }

    // Add adult dependents (parents, siblings, etc)
    for (let a = 0; a < noOfAdultDependents && dependents.filter(d => d.age >= 18).length < noOfAdultDependents; a++) {
      dependents.push({
        name: `${['Mr.', 'Mrs.'][a % 2]} ${fullName.split(' ')[1]}`,
        gender: a % 2 === 0 ? 'Male' as const : 'Female' as const,
        age: 55 + (a * 5)
      })
    }

    additionalQueueEntries.push({
      sequence: i,
      fullName: fullName,
      svcNo: `${['NA', 'NN', 'AF'][i % 3]}/${Math.floor(Math.random() * 90000) + 10000}/${Math.floor(Math.random() * 30) + 70}`,
      gender: isMale ? 'Male' : 'Female',
      armOfService: ['Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force'][i % 3],
      category: isOfficer ? 'Officer' : 'NCOs',
      rank: isOfficer
        ? ['Maj', 'Capt', 'Sqn Ldr', 'Lt Col'][i % 4]
        : ['Cpl', 'Sgt', 'SSgt', 'WO'][i % 4],
      maritalStatus: maritalStatus,
      noOfAdultDependents: noOfAdultDependents,
      noOfChildDependents: noOfChildDependents,
      dependents: dependents,
      currentUnit: ['DHQ', 'Naval Command', 'Air Defence', 'Medical Corps', 'MPB'][i % 5],
      appointment: isOfficer ? 'Staff Officer' : 'Technician',
      phone: `+234-80${Math.floor(Math.random() * 90000000) + 10000000}`,
      entryDateTime: new Date()
    })
  }

  for (const entry of [...queueData, ...additionalQueueEntries]) {
    await prisma.queue.create({ 
      data: {
        ...entry,
        hasAllocationRequest: false // Initialize all queue entries without allocation requests
      }
    })
  }

  console.log('✅ Created 20 queue entries')

  // Create DHQ  Accommodation (first batch from your data)
  const dhqLivingUnitsData = [
    {
      id: "702adbb3-ecea-4b6c-9d57-14c2fd615b9d",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 1",
      unitName: "Block 1 Flat 1"
    },
    {
      id: "f8b8a84a-edec-4919-858d-8f8de9b902eb",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 2",
      unitName: "Block 1 Flat 2"
    },
    {
      id: "1f39b183-022f-4d3b-8242-0d4d45b86a07",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 3",
      unitName: "Block 1 Flat 3"
    },
    {
      id: "aeb4712a-a398-4d88-928e-f804203a2df5",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 4",
      unitName: "Block 1 Flat 4"
    },
    {
      id: "c856c4df-1da9-4664-b759-1ab5ae8c3977",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 5",
      unitName: "Block 1 Flat 5"
    },
    {
      id: "a9ba6df5-0cac-4290-9071-25a113fc4795",
      quarterName: "Dike Officers Quarters Mogadishu Cantonment",
      location: "Mogadishu Cantonment",
      category: "Officer",
      accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
      noOfRooms: 1,
      status: "Occupied",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 1",
      flatHouseRoomName: "Flat 6",
      unitName: "Block 1 Flat 6",
      currentOccupantName: "Fatima Lawal",
      currentOccupantRank: "Capt",
      currentOccupantServiceNumber: "NA/12347/88",
      occupancyStartDate: new Date("2025-06-12")
    }
  ]

  // Add more varied living units to make 20 total
  const additionalLivingUnits = []

  // Add two bedroom flats (Block 3) - 2 occupied, 3 vacant
  for (let i = 1; i <= 5; i++) {
    additionalLivingUnits.push({
      quarterName: "Eagle Officers Quarters Lagos Cantonment",
      location: "Lagos Cantonment",
      category: "Officer",
      accommodationTypeId: "644aa118-5dbb-40ef-8e9d-e79873662859", // Two Bedroom Flat
      noOfRooms: 2,
      status: i <= 2 ? "Occupied" : "Vacant", // First 2 are occupied
      typeOfOccupancy: "Family",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 3",
      flatHouseRoomName: `Flat ${i}`,
      unitName: `Block 3 Flat ${i}`,
      ...(i === 1 && {
        currentOccupantName: "Adewale Ogunbiyi",
        currentOccupantRank: "Lt Col",
        currentOccupantServiceNumber: "NA/45678/91",
        occupancyStartDate: new Date("2025-04-15")
      }),
      ...(i === 2 && {
        currentOccupantName: "Oluwole Adeyinka",
        currentOccupantRank: "Maj",
        currentOccupantServiceNumber: "NN/34567/84",
        occupancyStartDate: new Date("2025-05-01")
      })
    })
  }

  // Add three bedroom flats (Block 4) - 3 occupied, 1 vacant
  for (let i = 1; i <= 4; i++) {
    additionalLivingUnits.push({
      quarterName: "Senior Officers Quarters Abuja",
      location: "Abuja FCT",
      category: "Officer",
      accommodationTypeId: "e325e19c-f673-4cb2-b36c-0345c2f9f206", // Three Bedroom Flat
      noOfRooms: 3,
      status: i <= 3 ? "Occupied" : "Vacant", // First 3 are occupied
      typeOfOccupancy: "Family",
      bq: true,
      noOfRoomsInBq: 1,
      blockName: "Block 4",
      flatHouseRoomName: `House ${i}`,
      unitName: `Block 4 House ${i}`,
      ...(i === 1 && {
        currentOccupantName: "Chukwudi Nwosu",
        currentOccupantRank: "Col",
        currentOccupantServiceNumber: "NA/12345/85",
        occupancyStartDate: new Date("2025-03-10")
      }),
      ...(i === 2 && {
        currentOccupantName: "Folake Adeyemi",
        currentOccupantRank: "Lt Col",
        currentOccupantServiceNumber: "NN/54321/87",
        occupancyStartDate: new Date("2025-04-01")
      }),
      ...(i === 3 && {
        currentOccupantName: "Halima Suleiman",
        currentOccupantRank: "Maj",
        currentOccupantServiceNumber: "AF/67890/89",
        occupancyStartDate: new Date("2025-05-10")
      })
    })
  }

  // Add duplexes (Block 5) - 1 occupied, 2 vacant 
  for (let i = 1; i <= 3; i++) {
    additionalLivingUnits.push({
      quarterName: "Command Officers Estate",
      location: "Ikeja Cantonment",
      category: "Officer",
      accommodationTypeId: "d403ff01-4ac9-40e5-bcea-8a3a04c89899", // Duplex
      noOfRooms: 4,
      status: i === 1 ? "Occupied" : "Vacant", // Only first duplex is occupied
      typeOfOccupancy: "Family",
      bq: true,
      noOfRoomsInBq: 2,
      blockName: "Estate A",
      flatHouseRoomName: `Duplex ${i}`,
      unitName: `Estate A Duplex ${i}`,
      ...(i === 1 && {
        currentOccupantName: "Nkechi Okonkwo",
        currentOccupantRank: "Col",
        currentOccupantServiceNumber: "AF/78901/82",
        occupancyStartDate: new Date("2025-03-15")
      })
    })
  }

  // Add self-contained units for NCOs category (Block 6) - 2 occupied
  for (let i = 1; i <= 2; i++) {
    additionalLivingUnits.push({
      quarterName: "Other Ranks Quarters",
      location: "Mogadishu Cantonment",
      category: "NCOs",
      accommodationTypeId: "301e92b3-1083-4340-a800-f4e21a20b9c7", // Self Contained
      noOfRooms: 1,
      status: "Occupied", // Both NCO units are occupied
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 6",
      flatHouseRoomName: `Room ${i}`,
      unitName: `Block 6 Room ${i}`,
      ...(i === 1 && {
        currentOccupantName: "Yakubu Danjuma",
        currentOccupantRank: "SSgt",
        currentOccupantServiceNumber: "AF/94452/88",
        occupancyStartDate: new Date("2025-05-15")
      }),
      ...(i === 2 && {
        currentOccupantName: "Funke Ogunleye",
        currentOccupantRank: "FS",
        currentOccupantServiceNumber: "AF/62542/50",
        occupancyStartDate: new Date("2025-05-25")
      })
    })
  }

  for (const unit of [...dhqLivingUnitsData, ...additionalLivingUnits]) {
    await prisma.dhqLivingUnit.create({ data: unit })
  }

  console.log('✅ Created 20 DHQ  Accommodation (10 occupied, 10 vacant)')

  // Create unit occupants and history for occupied units
  const occupiedUnits = await prisma.dhqLivingUnit.findMany({
    where: { status: 'Occupied' }
  })

  console.log(`Creating unit occupants and history for ${occupiedUnits.length} occupied units...`)

  for (const unit of occupiedUnits) {
    if (unit.currentOccupantName && unit.currentOccupantServiceNumber) {
      const unitIndex = occupiedUnits.indexOf(unit);
      const hasDependents = unitIndex % 2 === 0; // Every other occupant has dependents

      // Generate dependents for half of the occupants
      const dependents = [];
      let noOfAdultDependents = 0;
      let noOfChildDependents = 0;

      if (hasDependents) {
        // Add spouse
        const isMarried = true;
        if (isMarried) {
          const spouseGender = unit.currentOccupantName.includes("Nkechi") ||
            unit.currentOccupantName.includes("Amina") ||
            unit.currentOccupantName.includes("Folake") ||
            unit.currentOccupantName.includes("Bukola") ||
            unit.currentOccupantName.includes("Fatima") ? "Male" : "Female";
          const spouseName = spouseGender === "Male" ?
            `${unit.currentOccupantName.split(' ')[1]} James` :
            `${unit.currentOccupantName.split(' ')[1]} Grace`;

          dependents.push({
            name: spouseName,
            gender: spouseGender,
            age: 30 + unitIndex
          });
          noOfAdultDependents++;
        }

        // Add children based on unit type
        const childCount = unit.noOfRooms >= 3 ? 3 : unit.noOfRooms >= 2 ? 2 : 1;
        noOfChildDependents = childCount;

        for (let c = 0; c < childCount; c++) {
          dependents.push({
            name: `${['David', 'Sarah', 'Michael', 'Joy'][c % 4]} ${unit.currentOccupantName.split(' ')[1]}`,
            gender: c % 2 === 0 ? 'Male' : 'Female',
            age: 5 + (c * 4)
          });
        }

        // Some may have elderly parents
        if (unitIndex % 3 === 0) {
          dependents.push({
            name: `Mrs. ${unit.currentOccupantName.split(' ')[1]} Senior`,
            gender: 'Female',
            age: 65 + unitIndex
          });
          noOfAdultDependents++;
        }
      }

      // First, create a queue entry for this occupant
      const occupantQueue = await prisma.queue.create({
        data: {
          sequence: 90000 + unitIndex, // High sequence numbers for seeded occupants
          fullName: unit.currentOccupantName,
          svcNo: `${unit.currentOccupantServiceNumber}-ACT-${unitIndex}`, // Make it unique
          gender: unit.currentOccupantName.includes("Nkechi") ||
            unit.currentOccupantName.includes("Amina") ||
            unit.currentOccupantName.includes("Folake") ||
            unit.currentOccupantName.includes("Bukola") ||
            unit.currentOccupantName.includes("Fatima") ? 'Female' : 'Male',
          armOfService: unit.currentOccupantServiceNumber.startsWith('NA') ? 'Nigerian Army' :
            unit.currentOccupantServiceNumber.startsWith('NN') ? 'Nigerian Navy' : 'Nigerian Air Force',
          category: 'Officer',
          rank: unit.currentOccupantRank || 'Unknown',
          maritalStatus: hasDependents ? 'Married' : 'Single',
          noOfAdultDependents: noOfAdultDependents,
          noOfChildDependents: noOfChildDependents,
          dependents: dependents.length > 0 ? dependents : undefined,
          currentUnit: ['DHQ', 'Naval Command', 'Air Defence', 'Medical Corps', 'MPB'][unitIndex % 5],
          appointment: 'Staff Officer',
          entryDateTime: unit.occupancyStartDate || new Date(),
          createdAt: unit.occupancyStartDate || new Date(),
          updatedAt: new Date(),
          hasAllocationRequest: true // These are active occupants, so they have allocations
        }
      })

      // Create unit occupant record
      await prisma.unitOccupant.create({
        data: {
          unitId: unit.id,
          fullName: unit.currentOccupantName,
          rank: unit.currentOccupantRank || 'Unknown',
          serviceNumber: unit.currentOccupantServiceNumber,
          phone: `+234-80${Math.floor(Math.random() * 90000000) + 10000000}`,
          occupancyStartDate: unit.occupancyStartDate || new Date(),
          isCurrent: true,
          queueId: occupantQueue.id
        }
      })

      // Update the DhqLivingUnit to set currentOccupantId to the queueId
      await prisma.dhqLivingUnit.update({
        where: { id: unit.id },
        data: {
          currentOccupantId: occupantQueue.id
        }
      })

      // Create unit history record
      await prisma.unitHistory.create({
        data: {
          unitId: unit.id,
          occupantName: unit.currentOccupantName,
          rank: unit.currentOccupantRank || 'Unknown',
          serviceNumber: unit.currentOccupantServiceNumber,
          startDate: unit.occupancyStartDate || new Date(),
          endDate: null,
          durationDays: null,
          reasonForLeaving: null
        }
      })
    }
  }

  console.log(`✅ Created unit occupants and history for occupied units (${Math.ceil(occupiedUnits.length / 2)} with dependents, ${Math.floor(occupiedUnits.length / 2)} without)`)

  // Create past allocations (20 entries)
  const pastAllocations = []
  const pastOccupants = [
    { name: "Adebayo Olanrewaju", rank: "Lt Col", svcNo: "NA/45678/85" },
    { name: "Hauwa Bello", rank: "Maj", svcNo: "NN/34567/90" },
    { name: "Chinedu Okeke", rank: "Capt", svcNo: "AF/23456/92" },
    { name: "Folasade Akintola", rank: "Sqn Ldr", svcNo: "AF/12345/88" },
    { name: "Emeka Nnamdi", rank: "Cdr", svcNo: "NN/67890/87" },
    { name: "Aisha Danjuma", rank: "Lt", svcNo: "NA/54321/95" },
    { name: "Babajide Ogunlana", rank: "WO", svcNo: "NA/98765/80" },
    { name: "Zainab Abdullahi", rank: "FS", svcNo: "AF/87654/82" },
    { name: "Obinna Chukwu", rank: "Lt", svcNo: "NN/76543/85" },
    { name: "Kemi Adegbite", rank: "SSgt", svcNo: "AF/65432/89" }
  ]

  const dhqUnits = await prisma.dhqLivingUnit.findMany({ take: 10 })

  const currentYear = new Date().getFullYear();

  function generateRandomFourDigitNumber() {
    return Math.floor(1000 + Math.random() * 9000);
  }


  for (let i = 0; i < 20; i++) {
    const paddedCount = generateRandomFourDigitNumber();
    const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;
    const occupant = pastOccupants[i % pastOccupants.length]
    const unit = dhqUnits[i % dhqUnits.length]
    const startDate = new Date(2023, i % 12, (i % 28) + 1)
    const endDate = new Date(2024, (i + 6) % 12, (i % 28) + 1)

    // Generate realistic data for past allocations
    const isFemale = occupant.name.includes('Hauwa') || occupant.name.includes('Folasade') ||
      occupant.name.includes('Aisha') || occupant.name.includes('Zainab') ||
      occupant.name.includes('Kemi');
    const gender = isFemale ? 'Female' : 'Male';
    const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
    const maritalStatus = maritalStatuses[i % 4];

    // Some past allocations should have dependents (about 40% of them)
    const hasDependents = i % 5 < 2; // 2 out of 5 (40%) have dependents
    let noOfAdultDependents = 0;
    let noOfChildDependents = 0;
    let dependents = [];

    if (hasDependents && maritalStatus === 'Married') {
      // Add spouse
      noOfAdultDependents = 1;
      dependents.push({
        name: isFemale ? `${occupant.name.split(' ')[1]} James` : `${occupant.name.split(' ')[1]} Grace`,
        gender: isFemale ? 'Male' : 'Female',
        age: 30 + (i % 15)
      });

      // Add children based on index
      noOfChildDependents = Math.min((i % 3) + 1, 3); // 1-3 children
      for (let c = 0; c < noOfChildDependents; c++) {
        dependents.push({
          name: `${['David', 'Sarah', 'Michael', 'Joy', 'Samuel', 'Faith'][c % 6]} ${occupant.name.split(' ')[1]}`,
          gender: c % 2 === 0 ? 'Male' : 'Female',
          age: 5 + (c * 3) + (i % 8) // Ages 5-20
        });
      }

      // Some may have elderly parents
      if (i % 7 === 0) {
        dependents.push({
          name: `Mrs. ${occupant.name.split(' ')[1]} Senior`,
          gender: 'Female',
          age: 65 + (i % 10)
        });
        noOfAdultDependents++;
      }
    }

    // Create a queue entry for past allocation with unique service number
    const pastQueue = await prisma.queue.create({
      data: {
        sequence: 80000 + i, // Past allocation sequences
        fullName: occupant.name,
        svcNo: `${occupant.svcNo}-PAST-${i}`, // Make it unique by adding suffix
        gender: gender,
        armOfService: ['Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force'][i % 3],
        category: i < 15 ? "Officer" : "NCOs",
        rank: occupant.rank,
        maritalStatus: maritalStatus,
        noOfAdultDependents: noOfAdultDependents,
        noOfChildDependents: noOfChildDependents,
        dependents: dependents.length > 0 ? dependents : undefined,
        currentUnit: ['DHQ', 'Naval Command', 'Air Defence', 'Medical Corps', 'MPB'][i % 5],
        appointment: i < 15 ? 'Staff Officer' : 'Technician',
        entryDateTime: startDate,
        createdAt: startDate,
        updatedAt: new Date(),
        hasAllocationRequest: false // Past allocations don't have active requests
      }
    })

    pastAllocations.push({
      personnelId: `past-${i}`, // Dummy ID as these are past allocations
      queueId: pastQueue.id,
      unitId: unit.id,
      letterId: letterId,
      personnelData: {
        fullName: occupant.name,
        rank: occupant.rank,
        serviceNumber: occupant.svcNo,
        phone: `+234-80${Math.floor(Math.random() * 90000000) + 10000000}`,
        category: i < 15 ? "Officer" : "NCOs"
      },
      unitData: {
        quarterName: unit.quarterName,
        location: unit.location,
        unitName: unit.unitName,
        accommodationType: (await prisma.accommodationType.findUnique({ where: { id: unit.accommodationTypeId } }))?.name
      },
      allocationStartDate: startDate,
      allocationEndDate: endDate,
      durationDays: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      reasonForLeaving: ["Transfer", "Retirement", "Course", "Deployment", "Promotion"][i % 5]
    })
  }

  for (const allocation of pastAllocations) {
    await prisma.pastAllocation.create({ data: allocation })
  }

  console.log('✅ Created 20 past allocations')

  // Create allocation requests (10 entries) from queue personnel
  const allocationRequests = []
  const requestStatuses = ['pending', 'approved', 'refused']
  const vacantUnits = await prisma.dhqLivingUnit.findMany({ where: { status: 'Vacant' }, take: 10 })

  // Get some queue entries to create allocation requests from
  const queueForAllocations = await prisma.queue.findMany({
    take: 10,
    orderBy: { sequence: 'asc' }
  })

  for (let i = 0; i < 10 && i < queueForAllocations.length; i++) {
    const queueEntry = queueForAllocations[i]
    const paddedCount = generateRandomFourDigitNumber();
    const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;
    const requestedUnit = vacantUnits[i % vacantUnits.length]
    const accommodationType = await prisma.accommodationType.findUnique({ where: { id: requestedUnit.accommodationTypeId } })

    allocationRequests.push({
      personnelId: queueEntry.id, // Use actual queue ID
      queueId: queueEntry.id, // Reference to queue
      unitId: requestedUnit.id,
      letterId: letterId,
      status: requestStatuses[i % 3],
      personnelData: {
        id: queueEntry.id,
        fullName: queueEntry.fullName,
        svcNo: queueEntry.svcNo,
        rank: queueEntry.rank,
        category: queueEntry.category,
        gender: queueEntry.gender,
        armOfService: queueEntry.armOfService,
        maritalStatus: queueEntry.maritalStatus,
        noOfAdultDependents: queueEntry.noOfAdultDependents,
        noOfChildDependents: queueEntry.noOfChildDependents,
        phone: queueEntry.phone,
        currentUnit: queueEntry.currentUnit,
        appointment: queueEntry.appointment,
        entryDateTime: queueEntry.entryDateTime,
        sequence: queueEntry.sequence
      },
      unitData: {
        quarterName: requestedUnit.quarterName,
        location: requestedUnit.location,
        unitName: requestedUnit.unitName,
        accommodationType: accommodationType?.name,
        noOfRooms: requestedUnit.noOfRooms
      },
      ...(requestStatuses[i % 3] === 'approved' && {
        approvedBy: "admin",
        approvedAt: new Date()
      }),
      ...(requestStatuses[i % 3] === 'refused' && {
        refusalReason: ["Unit not suitable", "Ineligible", "Pending documentation"][i % 3]
      })
    })
  }

  for (const request of allocationRequests) {
    await prisma.allocationRequest.create({ data: request })
    
    // Mark the queue entry as having an allocation request if status is pending
    if (request.status === 'pending') {
      await prisma.queue.update({
        where: { id: request.queueId },
        data: { hasAllocationRequest: true }
      })
    }
  }

  console.log(`✅ Created ${allocationRequests.length} allocation requests`)

  // Create maintenance tasks (scheduled/preventive maintenance)
  const maintenanceData = [
    {
      unitId: dhqUnits[0].id,
      recordType: "task",
      maintenanceType: "AC Servicing",
      description: "Quarterly air conditioner maintenance and filter replacement",
      maintenanceDate: new Date('2025-01-15'),
      performedBy: "HVAC Team",
      cost: 15000.00,
      status: "Completed",
      priority: "Medium",
      remarks: "All units serviced, filters replaced"
    },
    {
      unitId: dhqUnits[1].id,
      recordType: "task",
      maintenanceType: "Plumbing Repair",
      description: "Fix leaking faucet in kitchen area",
      maintenanceDate: new Date('2025-02-10'),
      performedBy: "Plumbing Team",
      cost: 8500.00,
      status: "Completed",
      priority: "High",
      remarks: "Replaced faulty valve"
    },
    {
      unitId: dhqUnits[2].id,
      recordType: "task",
      maintenanceType: "Electrical Inspection",
      description: "Annual electrical safety inspection",
      maintenanceDate: new Date('2025-03-05'),
      performedBy: "Electrical Team",
      cost: 12000.00,
      status: "Pending",
      priority: "Medium",
      remarks: "Scheduled for next week"
    },
    {
      unitId: dhqUnits[3].id,
      recordType: "task",
      maintenanceType: "Pest Control",
      description: "Quarterly pest control treatment",
      maintenanceDate: new Date('2025-02-20'),
      performedBy: "Pest Control Team",
      cost: 5000.00,
      status: "Completed",
      priority: "Low",
      remarks: "No pest activity detected"
    },
    {
      unitId: dhqUnits[4].id,
      recordType: "task",
      maintenanceType: "Painting",
      description: "Touch-up painting for living room walls",
      maintenanceDate: new Date('2025-04-01'),
      performedBy: "Maintenance Team",
      cost: 25000.00,
      status: "Pending",
      priority: "Low",
      remarks: "Materials ordered"
    },
    {
      unitId: dhqUnits[0].id,
      recordType: "task",
      maintenanceType: "Generator Service",
      description: "Monthly generator maintenance and testing",
      maintenanceDate: new Date('2025-03-15'),
      performedBy: "Generator Tech",
      cost: 18000.00,
      status: "Overdue",
      priority: "High",
      remarks: "Service overdue by 5 days"
    },
    {
      unitId: dhqUnits[1].id,
      recordType: "task",
      maintenanceType: "Window Repair",
      description: "Replace broken window pane in bedroom",
      maintenanceDate: new Date('2025-02-25'),
      performedBy: "Glass Repair Team",
      cost: 7500.00,
      status: "Completed",
      priority: "Medium",
      remarks: "New safety glass installed"
    },
    {
      unitId: dhqUnits[2].id,
      recordType: "task",
      maintenanceType: "Deep Cleaning",
      description: "Quarterly deep cleaning service",
      maintenanceDate: new Date('2025-03-30'),
      performedBy: "Cleaning Crew",
      cost: 10000.00,
      status: "Pending",
      priority: "Low",
      remarks: "Scheduled for end of month"
    }
  ]

  for (const maintenance of maintenanceData) {
    await prisma.unitMaintenance.create({ data: maintenance })
  }

  console.log('✅ Created maintenance tasks')

  // Create maintenance requests (user-reported issues)
  const maintenanceRequestsData = [
    {
      unitId: dhqUnits[0].id,
      recordType: "request",
      maintenanceType: "Plumbing",
      description: "Leaking faucet in kitchen sink, constant dripping",
      maintenanceDate: new Date('2025-06-15'),
      performedBy: "John Doe",
      cost: 0,
      status: "Pending",
      priority: "High",
      remarks: "Urgent repair needed, affecting water pressure"
    },
    {
      unitId: dhqUnits[1].id,
      recordType: "request",
      maintenanceType: "Electrical",
      description: "Power outlet not working in master bedroom",
      maintenanceDate: new Date('2025-06-14'),
      performedBy: "Jane Smith",
      cost: 0,
      status: "In Progress",
      priority: "Medium",
      remarks: "Electrician scheduled for tomorrow"
    },
    {
      unitId: dhqUnits[2].id,
      recordType: "request",
      maintenanceType: "HVAC",
      description: "Air conditioner not cooling properly",
      maintenanceDate: new Date('2025-06-13'),
      performedBy: "Michael Brown",
      cost: 0,
      status: "Completed",
      priority: "High",
      remarks: "Refrigerant refilled, system working normally"
    },
    {
      unitId: dhqUnits[3].id,
      recordType: "request",
      maintenanceType: "Structural",
      description: "Crack in bathroom wall near shower area",
      maintenanceDate: new Date('2025-06-12'),
      performedBy: "Ahmed Hassan",
      cost: 0,
      status: "Pending",
      priority: "Medium",
      remarks: "Needs structural assessment"
    },
    {
      unitId: dhqUnits[4].id,
      recordType: "request",
      maintenanceType: "Appliance",
      description: "Refrigerator making unusual noise",
      maintenanceDate: new Date('2025-06-10'),
      performedBy: "Sarah Wilson",
      cost: 0,
      status: "In Progress",
      priority: "Low",
      remarks: "Technician diagnosed compressor issue"
    },
    {
      unitId: dhqUnits[5] ? dhqUnits[5].id : dhqUnits[0].id,
      recordType: "request",
      maintenanceType: "Plumbing",
      description: "Water pressure low in bathroom shower",
      maintenanceDate: new Date('2025-06-09'),
      performedBy: "Adebayo",
      cost: 0,
      status: "Pending",
      priority: "Medium",
      remarks: "Check main water line connection"
    },
    {
      unitId: dhqUnits[6] ? dhqUnits[6].id : dhqUnits[1].id,
      recordType: "request",
      maintenanceType: "Electrical",
      description: "Ceiling fan making noise in living room",
      maintenanceDate: new Date('2025-06-08'),
      performedBy: "Okoro",
      cost: 0,
      status: "Completed",
      priority: "Low",
      remarks: "Fan motor lubricated and balanced"
    },
    {
      unitId: dhqUnits[7] ? dhqUnits[7].id : dhqUnits[2].id,
      recordType: "request",
      maintenanceType: "Security",
      description: "Door lock mechanism not working properly",
      maintenanceDate: new Date('2025-06-07'),
      performedBy: "Hassan",
      cost: 0,
      status: "Pending",
      priority: "High",
      remarks: "Security concern - needs immediate attention"
    }
  ]

  for (const request of maintenanceRequestsData) {
    await prisma.unitMaintenance.create({ data: request })
  }

  console.log('✅ Created maintenance requests')

  // Create unit inventory records
  const inventoryData = [
    {
      unitId: dhqUnits[0].id,
      quantity: 2,
      itemDescription: "Split Air Conditioner",
      itemLocation: "Living Room & Bedroom",
      itemStatus: "Functional",
      remarks: "Recently serviced"
    },
    {
      unitId: dhqUnits[0].id,
      quantity: 1,
      itemDescription: "Refrigerator",
      itemLocation: "Kitchen",
      itemStatus: "Functional",
      remarks: "Good condition"
    },
    {
      unitId: dhqUnits[1].id,
      quantity: 1,
      itemDescription: "Water Heater",
      itemLocation: "Bathroom",
      itemStatus: "Needs Repair",
      remarks: "Heating element faulty"
    },
    {
      unitId: dhqUnits[1].id,
      quantity: 3,
      itemDescription: "Ceiling Fan",
      itemLocation: "Living Room, Bedroom, Kitchen",
      itemStatus: "Functional",
      remarks: "All working properly"
    },
    {
      unitId: dhqUnits[2].id,
      quantity: 1,
      itemDescription: "Washing Machine",
      itemLocation: "Utility Room",
      itemStatus: "Non-Functional",
      remarks: "Motor needs replacement"
    },
    {
      unitId: dhqUnits[3].id,
      quantity: 2,
      itemDescription: "Smoke Detector",
      itemLocation: "Hallway & Bedroom",
      itemStatus: "Functional",
      remarks: "Batteries replaced recently"
    }
  ]

  for (const inventory of inventoryData) {
    await prisma.unitInventory.create({ data: inventory })
  }

  console.log('✅ Created unit inventory records')

  // Add more inventory to all units (for clearance inspections)
  const allUnits = await prisma.dhqLivingUnit.findMany()
  
  console.log('Adding comprehensive inventory to all units...')
  
  const commonInventoryItems = [
    { itemDescription: "Kitchen Cabinet", location: "Kitchen", quantity: 1 },
    { itemDescription: "Dining Table", location: "Dining Area", quantity: 1 },
    { itemDescription: "Dining Chairs", location: "Dining Area", quantity: 4 },
    { itemDescription: "Sofa Set", location: "Living Room", quantity: 1 },
    { itemDescription: "Center Table", location: "Living Room", quantity: 1 },
    { itemDescription: "TV Stand", location: "Living Room", quantity: 1 },
    { itemDescription: "Wardrobe", location: "Master Bedroom", quantity: 1 },
    { itemDescription: "Bed Frame", location: "Master Bedroom", quantity: 1 },
    { itemDescription: "Mattress", location: "Master Bedroom", quantity: 1 },
    { itemDescription: "Curtains", location: "All Windows", quantity: 6 },
    { itemDescription: "Light Fixtures", location: "All Rooms", quantity: 8 },
    { itemDescription: "Kitchen Sink", location: "Kitchen", quantity: 1 },
    { itemDescription: "Toilet Seat", location: "Bathroom", quantity: 1 },
    { itemDescription: "Bathroom Mirror", location: "Bathroom", quantity: 1 },
    { itemDescription: "Door Locks", location: "All Doors", quantity: 5 }
  ]
  
  // Add inventory to units that don't have much
  for (const unit of allUnits) {
    const existingInventory = await prisma.unitInventory.findMany({
      where: { unitId: unit.id }
    })
    
    // Only add if unit has less than 5 inventory items
    if (existingInventory.length < 5) {
      // Add a subset of common items based on unit size
      const itemsToAdd = unit.noOfRooms >= 3 ? commonInventoryItems : 
                         unit.noOfRooms === 2 ? commonInventoryItems.slice(0, 10) :
                         commonInventoryItems.slice(0, 8)
      
      for (const item of itemsToAdd) {
        const exists = existingInventory.some(inv => 
          inv.itemDescription === item.itemDescription
        )
        
        if (!exists) {
          await prisma.unitInventory.create({
            data: {
              unitId: unit.id,
              itemDescription: item.itemDescription,
              itemLocation: item.location,
              quantity: item.quantity,
              itemStatus: Math.random() > 0.8 ? "Non-Functional" : "Functional",
              remarks: Math.random() > 0.7 ? "Needs maintenance" : "Good condition"
            }
          })
        }
      }
    }
  }
  
  console.log('✅ Added comprehensive inventory to all units')

  // Create clearance inspections for past allocations
  const pastAllocationsForClearance = await prisma.pastAllocation.findMany({
    include: {
      unit: {
        include: {
          inventory: true
        }
      }
    }
  })
  
  console.log('Creating clearance inspections for past allocations...')
  
  const inspectors = [
    { name: "James Okafor", rank: "Capt", svcNo: "NA/45789/90", category: "Officer", appointment: "QM Assistant" },
    { name: "Mary Adebayo", rank: "Lt", svcNo: "NN/67890/92", category: "Officer", appointment: "Admin Officer" },
    { name: "Peter Nwosu", rank: "WO", svcNo: "AF/34567/88", category: "NCOs", appointment: "Stores Supervisor" },
    { name: "Grace Ibrahim", rank: "SSgt", svcNo: "NA/23456/91", category: "NCOs", appointment: "Inventory Clerk" }
  ]
  
  // Create clearance inspections for 60% of past allocations
  for (let i = 0; i < pastAllocationsForClearance.length; i++) {
    if (i % 10 < 6) { // 60% of past allocations
      const allocation = pastAllocationsForClearance[i]
      const inspector = inspectors[i % inspectors.length]
      
      // Create inventory status for this inspection
      const inventoryStatus: Record<string, string> = {}
      
      if (allocation.unit.inventory) {
        for (const item of allocation.unit.inventory) {
          // Randomly assign inspection status
          const rand = Math.random()
          inventoryStatus[item.id] = 
            rand > 0.9 ? "Missing" :
            rand > 0.8 ? "Non Functional" :
            "Functional"
        }
      }
      
      await prisma.clearanceInspection.create({
        data: {
          pastAllocationId: allocation.id,
          inspectorSvcNo: inspector.svcNo,
          inspectorName: inspector.name,
          inspectorRank: inspector.rank,
          inspectorCategory: inspector.category,
          inspectorAppointment: inspector.appointment,
          inspectionDate: new Date(
            allocation.allocationEndDate || new Date()
          ),
          remarks: [
            "All items accounted for, unit in good condition",
            "Minor wear and tear observed, acceptable condition",
            "Some items need repair but unit cleared",
            "Excellent condition maintained throughout occupancy",
            "Standard wear noted, clearance approved"
          ][i % 5],
          inventoryStatus: inventoryStatus
        }
      })
    }
  }
  
  console.log('✅ Created clearance inspections for 60% of past allocations')

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