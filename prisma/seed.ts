import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data first
  console.log('🧹 Clearing existing data...')
  await prisma.allocationRequest.deleteMany({})
  await prisma.pastAllocation.deleteMany({})
  await prisma.queue.deleteMany({})
  await prisma.unitOccupant.deleteMany({})
  await prisma.unitHistory.deleteMany({})
  await prisma.unitInventory.deleteMany({})
  await prisma.unitMaintenance.deleteMany({})
  await prisma.dhqLivingUnit.deleteMany({})
  await prisma.stampSetting.deleteMany({})
  await prisma.accommodationType.deleteMany({})
  await prisma.unit.deleteMany({})
  await prisma.profile.deleteMany({})
  await prisma.user.deleteMany({})

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dhq.mil',
      hashedPassword,
      emailVerified: new Date(),
      profile: {
        create: {
          username: 'admin',
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
      svcNo: "AF/17127/79",
      gender: "Female",
      armOfService: "Army",
      category: "Officer",
      rank: "Squadron Leader",
      maritalStatus: "Married",
      noOfAdultDependents: 1,
      noOfChildDependents: 1,
      currentUnit: "Naval Command",
      appointment: "Staff Officer",
      phone: "+234-8044233738",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "0cc97e1e-0f52-48ad-8ea5-35a5a321dec0",
      sequence: 2,
      fullName: "Emeka Adebayo",
      svcNo: "N/84591/22",
      gender: "Male",
      armOfService: "Air Force",
      category: "Officer",
      rank: "Squadron Leader",
      maritalStatus: "Single",
      noOfAdultDependents: 1,
      noOfChildDependents: 2,
      currentUnit: "Naval Command",
      appointment: "Staff Officer",
      phone: "+234-8093386438",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "59d3081d-9625-42e0-9ef7-0a547d39996d",
      sequence: 3,
      fullName: "Oluwaseun Balogun",
      svcNo: "A/65461/71",
      gender: "Male",
      armOfService: "Navy",
      category: "Officer",
      rank: "Lieutenant Commander",
      maritalStatus: "Married",
      noOfAdultDependents: 0,
      noOfChildDependents: 0,
      currentUnit: "Medical Corps",
      appointment: "Staff Officer",
      phone: "+234-8090141298",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "e4b5fed3-7972-48c8-b08d-ee1dd6c39c6e",
      sequence: 4,
      fullName: "Ibrahim Mohammed",
      svcNo: "AF/62775/20",
      gender: "Male",
      armOfService: "Navy",
      category: "Officer",
      rank: "Lieutenant",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 1,
      currentUnit: "Air Defence",
      appointment: "Staff Officer",
      phone: "+234-8042714278",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    },
    {
      id: "cdebec59-931b-4565-ba8f-d677b0a362b3",
      sequence: 5,
      fullName: "Chijioke Eze",
      svcNo: "N/56838/94",
      gender: "Male",
      armOfService: "Air Force",
      category: "NCOs",
      rank: "Petty Officer",
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
      svcNo: "N/94452/88",
      gender: "Male",
      armOfService: "Air Force",
      category: "NCOs",
      rank: "Staff Sergeant",
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
      armOfService: "Air Force",
      category: "NCOs",
      rank: "Staff Sergeant",
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
      armOfService: "Air Force",
      category: "NCOs",
      rank: "Flight Sergeant",
      maritalStatus: "Single",
      noOfAdultDependents: 0,
      noOfChildDependents: 1,
      currentUnit: "Naval Command",
      appointment: "Technician",
      phone: "+234-8093388219",
      entryDateTime: new Date("2025-06-14T17:19:49.83319+00:00")
    }
  ]

  // Add 12 more queue entries to make 20 total
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

    additionalQueueEntries.push({
      sequence: i,
      fullName: fullName,
      svcNo: `${['A', 'N', 'AF'][i % 3]}/${Math.floor(Math.random() * 90000) + 10000}/${Math.floor(Math.random() * 30) + 70}`,
      gender: isMale ? 'Male' : 'Female',
      armOfService: ['Army', 'Navy', 'Air Force'][i % 3],
      category: isOfficer ? 'Officer' : 'NCOs',
      rank: isOfficer
        ? ['Major', 'Captain', 'Squadron Leader', 'Lieutenant Colonel'][i % 4]
        : ['Corporal', 'Sergeant', 'Staff Sergeant', 'Warrant Officer'][i % 4],
      maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'][i % 4],
      noOfAdultDependents: i % 3,
      noOfChildDependents: i % 4,
      currentUnit: ['DHQ', 'Naval Command', 'Air Defence', 'Medical Corps', 'MPB'][i % 5],
      appointment: isOfficer ? 'Staff Officer' : 'Technician',
      phone: `+234-80${Math.floor(Math.random() * 90000000) + 10000000}`,
      entryDateTime: new Date()
    })
  }

  for (const entry of [...queueData, ...additionalQueueEntries]) {
    await prisma.queue.create({ data: entry })
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
      currentOccupantRank: "Lieutenant",
      currentOccupantServiceNumber: "A12347",
      occupancyStartDate: new Date("2025-06-12")
    }
  ]

  // Add more varied living units to make 20 total
  const additionalLivingUnits = []

  // Add two bedroom flats (Block 3)
  for (let i = 1; i <= 5; i++) {
    additionalLivingUnits.push({
      quarterName: "Eagle Officers Quarters Lagos Cantonment",
      location: "Lagos Cantonment",
      category: "Officer",
      accommodationTypeId: "644aa118-5dbb-40ef-8e9d-e79873662859", // Two Bedroom Flat
      noOfRooms: 2,
      status: i === 2 ? "Occupied" : "Vacant",
      typeOfOccupancy: "Family",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 3",
      flatHouseRoomName: `Flat ${i}`,
      unitName: `Block 3 Flat ${i}`,
      ...(i === 2 && {
        currentOccupantName: "Major Oluwole Adeyinka",
        currentOccupantRank: "Major",
        currentOccupantServiceNumber: "N34567",
        occupancyStartDate: new Date("2025-05-01")
      })
    })
  }

  // Add three bedroom flats (Block 4)
  for (let i = 1; i <= 4; i++) {
    additionalLivingUnits.push({
      quarterName: "Senior Officers Quarters Abuja",
      location: "Abuja FCT",
      category: "Officer",
      accommodationTypeId: "e325e19c-f673-4cb2-b36c-0345c2f9f206", // Three Bedroom Flat
      noOfRooms: 3,
      status: "Vacant",
      typeOfOccupancy: "Family",
      bq: true,
      noOfRoomsInBq: 1,
      blockName: "Block 4",
      flatHouseRoomName: `House ${i}`,
      unitName: `Block 4 House ${i}`
    })
  }

  // Add duplexes (Block 5)
  for (let i = 1; i <= 3; i++) {
    additionalLivingUnits.push({
      quarterName: "Command Officers Estate",
      location: "Ikeja Cantonment",
      category: "Officer",
      accommodationTypeId: "d403ff01-4ac9-40e5-bcea-8a3a04c89899", // Duplex
      noOfRooms: 4,
      status: i === 1 ? "Occupied" : "Vacant",
      typeOfOccupancy: "Family",
      bq: true,
      noOfRoomsInBq: 2,
      blockName: "Estate A",
      flatHouseRoomName: `Duplex ${i}`,
      unitName: `Estate A Duplex ${i}`,
      ...(i === 1 && {
        currentOccupantName: "Col. Nkechi Okonkwo",
        currentOccupantRank: "Colonel",
        currentOccupantServiceNumber: "AF78901",
        occupancyStartDate: new Date("2025-03-15")
      })
    })
  }

  // Add self-contained units for NCOs category (Block 6)
  for (let i = 1; i <= 2; i++) {
    additionalLivingUnits.push({
      quarterName: "Other Ranks Quarters",
      location: "Mogadishu Cantonment",
      category: "NCOs",
      accommodationTypeId: "301e92b3-1083-4340-a800-f4e21a20b9c7", // Self Contained
      noOfRooms: 1,
      status: "Vacant",
      typeOfOccupancy: "Single",
      bq: false,
      noOfRoomsInBq: 0,
      blockName: "Block 6",
      flatHouseRoomName: `Room ${i}`,
      unitName: `Block 6 Room ${i}`
    })
  }

  for (const unit of [...dhqLivingUnitsData, ...additionalLivingUnits]) {
    await prisma.dhqLivingUnit.create({ data: unit })
  }

  console.log('✅ Created 20 DHQ  Accommodation')

  // Create past allocations (20 entries)
  const pastAllocations = []
  const pastOccupants = [
    { name: "Lt. Col. Adebayo Olanrewaju", rank: "Lieutenant Colonel", svcNo: "A/45678/85" },
    { name: "Major Hauwa Bello", rank: "Major", svcNo: "N/34567/90" },
    { name: "Capt. Chinedu Okeke", rank: "Captain", svcNo: "AF/23456/92" },
    { name: "Squadron Leader Folasade Akintola", rank: "Squadron Leader", svcNo: "AF/12345/88" },
    { name: "Commander Emeka Nnamdi", rank: "Commander", svcNo: "N/67890/87" },
    { name: "Lt. Aisha Danjuma", rank: "Lieutenant", svcNo: "A/54321/95" },
    { name: "WO1 Babajide Ogunlana", rank: "Warrant Officer 1", svcNo: "A/98765/80" },
    { name: "Flight Sergeant Zainab Abdullahi", rank: "Flight Sergeant", svcNo: "AF/87654/82" },
    { name: "Petty Officer Obinna Chukwu", rank: "Petty Officer", svcNo: "N/76543/85" },
    { name: "Staff Sergeant Kemi Adegbite", rank: "Staff Sergeant", svcNo: "AF/65432/89" }
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

    pastAllocations.push({
      personnelId: `past-${i}`, // Dummy ID as these are past allocations
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

  // Create allocation requests (20 entries)
  const allocationRequests = []
  const requestStatuses = ['approved', 'rejected', 'pending']
  const vacantUnits = await prisma.dhqLivingUnit.findMany({ where: { status: 'Vacant' }, take: 10 })

  for (let i = 1; i <= 20; i++) {
    const paddedCount = generateRandomFourDigitNumber();
    const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;
    const queueEntry = queueData[(i - 1) % queueData.length]
    const requestedUnit = vacantUnits[(i - 1) % vacantUnits.length]
    const accommodationType = await prisma.accommodationType.findUnique({ where: { id: requestedUnit.accommodationTypeId } })

    allocationRequests.push({
      personnelId: queueEntry.id,
      unitId: requestedUnit.id,
      letterId: letterId,
      status: requestStatuses[i % 4],
      personnelData: {
        fullName: queueEntry.fullName,
        svcNo: queueEntry.svcNo,
        rank: queueEntry.rank,
        category: queueEntry.category,
        maritalStatus: queueEntry.maritalStatus,
        phone: queueEntry.phone,
        currentUnit: queueEntry.currentUnit
      },
      unitData: {
        quarterName: requestedUnit.quarterName,
        location: requestedUnit.location,
        unitName: requestedUnit.unitName,
        accommodationType: accommodationType?.name,
        noOfRooms: requestedUnit.noOfRooms
      },
      ...(requestStatuses[i % 4] === 'approved' && {
        approvedBy: "admin",
        approvedAt: new Date(),
        allocationDate: new Date()
      }),
      ...(requestStatuses[i % 4] === 'rejected' && {
        approvedBy: "admin",
        approvedAt: new Date(),
        refusalReason: ["Unit not suitable", "Ineligible", "Pending documentation"][i % 3]
      })
    })
  }

  for (const request of allocationRequests) {
    await prisma.allocationRequest.create({ data: request })
  }

  console.log('✅ Created 20 allocation requests')

  // Create maintenance records (using existing UnitMaintenance table)
  const maintenanceData = [
    {
      unitId: dhqUnits[0].id,
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

  console.log('✅ Created maintenance records')

  // Create maintenance requests (using UnitMaintenance table with specific pattern)
  const maintenanceRequestsData = [
    {
      unitId: dhqUnits[0].id,
      maintenanceType: "Plumbing",
      description: "Leaking faucet in kitchen sink, constant dripping",
      maintenanceDate: new Date('2025-06-15'),
      performedBy: "Lt. John Doe",
      cost: 0,
      status: "Pending",
      priority: "High",
      remarks: "Urgent repair needed, affecting water pressure"
    },
    {
      unitId: dhqUnits[1].id,
      maintenanceType: "Electrical",
      description: "Power outlet not working in master bedroom",
      maintenanceDate: new Date('2025-06-14'),
      performedBy: "Major Jane Smith",
      cost: 0,
      status: "In Progress",
      priority: "Medium",
      remarks: "Electrician scheduled for tomorrow"
    },
    {
      unitId: dhqUnits[2].id,
      maintenanceType: "HVAC",
      description: "Air conditioner not cooling properly",
      maintenanceDate: new Date('2025-06-13'),
      performedBy: "Col. Michael Brown",
      cost: 0,
      status: "Completed",
      priority: "High",
      remarks: "Refrigerant refilled, system working normally"
    },
    {
      unitId: dhqUnits[3].id,
      maintenanceType: "Structural",
      description: "Crack in bathroom wall near shower area",
      maintenanceDate: new Date('2025-06-12'),
      performedBy: "Sgt. Ahmed Hassan",
      cost: 0,
      status: "Pending",
      priority: "Medium",
      remarks: "Needs structural assessment"
    },
    {
      unitId: dhqUnits[4].id,
      maintenanceType: "Appliance",
      description: "Refrigerator making unusual noise",
      maintenanceDate: new Date('2025-06-10'),
      performedBy: "Capt. Sarah Wilson",
      cost: 0,
      status: "In Progress",
      priority: "Low",
      remarks: "Technician diagnosed compressor issue"
    },
    {
      unitId: dhqUnits[5] ? dhqUnits[5].id : dhqUnits[0].id,
      maintenanceType: "Plumbing",
      description: "Water pressure low in bathroom shower",
      maintenanceDate: new Date('2025-06-09'),
      performedBy: "WO1 Adebayo",
      cost: 0,
      status: "Pending",
      priority: "Medium",
      remarks: "Check main water line connection"
    },
    {
      unitId: dhqUnits[6] ? dhqUnits[6].id : dhqUnits[1].id,
      maintenanceType: "Electrical",
      description: "Ceiling fan making noise in living room",
      maintenanceDate: new Date('2025-06-08'),
      performedBy: "Squadron Leader Okoro",
      cost: 0,
      status: "Completed",
      priority: "Low",
      remarks: "Fan motor lubricated and balanced"
    },
    {
      unitId: dhqUnits[7] ? dhqUnits[7].id : dhqUnits[2].id,
      maintenanceType: "Security",
      description: "Door lock mechanism not working properly",
      maintenanceDate: new Date('2025-06-07'),
      performedBy: "Lt. Commander Hassan",
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