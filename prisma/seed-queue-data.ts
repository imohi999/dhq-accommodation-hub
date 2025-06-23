// Sample data for Queue model
export const queueSampleData = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    sequence: 1,
    fullName: "Major James Okafor",
    svcNo: "NA/12345",
    gender: "Male",
    armOfService: "Nigerian Army",
    category: "Officer",
    rank: "Major",
    maritalStatus: "Married",
    noOfAdultDependents: 1,
    noOfChildDependents: 3,
    currentUnit: "82 Division",
    appointment: "Staff Officer Operations",
    dateTos: new Date("2023-01-15"),
    dateSos: new Date("2025-01-15"),
    phone: "+2348012345678",
    entryDateTime: new Date("2023-01-15T10:30:00Z"),
    dependents: {
      spouse: { name: "Mary Okafor", age: 32 },
      children: [
        { name: "John Okafor", age: 8 },
        { name: "Sarah Okafor", age: 6 },
        { name: "David Okafor", age: 3 }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    sequence: 2,
    fullName: "Captain Fatima Mohammed",
    svcNo: "NAF/23456",
    gender: "Female",
    armOfService: "Nigerian Air Force",
    category: "Officer",
    rank: "Captain",
    maritalStatus: "Single",
    noOfAdultDependents: 0,
    noOfChildDependents: 0,
    currentUnit: "305 Special Mobility Group",
    appointment: "Squadron Intelligence Officer",
    dateTos: new Date("2023-03-10"),
    dateSos: new Date("2025-03-10"),
    phone: "+2348023456789",
    entryDateTime: new Date("2023-03-10T14:15:00Z"),
    dependents: null
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    sequence: 3,
    fullName: "WO1 Peter Adebayo",
    svcNo: "NA/34567",
    gender: "Male",
    armOfService: "Nigerian Army",
    category: "Soldier",
    rank: "WO1",
    maritalStatus: "Married",
    noOfAdultDependents: 1,
    noOfChildDependents: 2,
    currentUnit: "1 Division",
    appointment: "Company Sergeant Major",
    dateTos: new Date("2022-11-20"),
    dateSos: new Date("2024-11-20"),
    phone: "+2348034567890",
    entryDateTime: new Date("2022-11-20T09:00:00Z"),
    dependents: {
      spouse: { name: "Grace Adebayo", age: 35 },
      children: [
        { name: "Samuel Adebayo", age: 12 },
        { name: "Ruth Adebayo", age: 9 }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    sequence: 4,
    fullName: "Lt Commander Chidi Eze",
    svcNo: "NN/45678",
    gender: "Male",
    armOfService: "Nigerian Navy",
    category: "Officer",
    rank: "Lt Commander",
    maritalStatus: "Married",
    noOfAdultDependents: 2,
    noOfChildDependents: 1,
    currentUnit: "NNS BEECROFT",
    appointment: "Operations Officer",
    dateTos: new Date("2023-05-01"),
    dateSos: new Date("2025-05-01"),
    phone: "+2348045678901",
    entryDateTime: new Date("2023-05-01T11:45:00Z"),
    dependents: {
      spouse: { name: "Ngozi Eze", age: 30 },
      children: [{ name: "Chioma Eze", age: 4 }],
      dependents: [
        { name: "Mrs. Agnes Eze", age: 65, relationship: "Mother" },
        { name: "Mr. John Eze", age: 70, relationship: "Father" }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    sequence: 5,
    fullName: "Sergeant Aisha Bello",
    svcNo: "NAF/56789",
    gender: "Female",
    armOfService: "Nigerian Air Force",
    category: "Airman/Airwoman",
    rank: "Sergeant",
    maritalStatus: "Divorced",
    noOfAdultDependents: 0,
    noOfChildDependents: 2,
    currentUnit: "551 NAF Station",
    appointment: "Air Traffic Controller",
    dateTos: new Date("2023-02-14"),
    dateSos: new Date("2025-02-14"),
    phone: "+2348056789012",
    entryDateTime: new Date("2023-02-14T08:30:00Z"),
    dependents: {
      children: [
        { name: "Amina Bello", age: 10 },
        { name: "Yusuf Bello", age: 7 }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    sequence: 6,
    fullName: "Colonel Ibrahim Yakubu",
    svcNo: "NA/67890",
    gender: "Male",
    armOfService: "Nigerian Army",
    category: "Officer",
    rank: "Colonel",
    maritalStatus: "Married",
    noOfAdultDependents: 1,
    noOfChildDependents: 4,
    currentUnit: "Defence Headquarters",
    appointment: "Director of Operations",
    dateTos: new Date("2022-08-01"),
    dateSos: new Date("2024-08-01"),
    phone: "+2348067890123",
    entryDateTime: new Date("2022-08-01T07:00:00Z"),
    dependents: {
      spouse: { name: "Zainab Yakubu", age: 40 },
      children: [
        { name: "Ahmed Yakubu", age: 18 },
        { name: "Hauwa Yakubu", age: 15 },
        { name: "Musa Yakubu", age: 12 },
        { name: "Khadija Yakubu", age: 8 }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    sequence: 7,
    fullName: "CPO Emeka Nwankwo",
    svcNo: "NN/78901",
    gender: "Male",
    armOfService: "Nigerian Navy",
    category: "Rating",
    rank: "CPO",
    maritalStatus: "Married",
    noOfAdultDependents: 0,
    noOfChildDependents: 3,
    currentUnit: "NNS DELTA",
    appointment: "Chief Boatswain Mate",
    dateTos: new Date("2023-04-20"),
    dateSos: new Date("2025-04-20"),
    phone: "+2348078901234",
    entryDateTime: new Date("2023-04-20T12:00:00Z"),
    dependents: {
      spouse: { name: "Chioma Nwankwo", age: 33 },
      children: [
        { name: "Ugochukwu Nwankwo", age: 11 },
        { name: "Adaeze Nwankwo", age: 8 },
        { name: "Obinna Nwankwo", age: 5 }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    sequence: 8,
    fullName: "Flight Lieutenant Bala Hassan",
    svcNo: "NAF/89012",
    gender: "Male",
    armOfService: "Nigerian Air Force",
    category: "Officer",
    rank: "Flight Lieutenant",
    maritalStatus: "Single",
    noOfAdultDependents: 1,
    noOfChildDependents: 0,
    currentUnit: "115 Special Operations Group",
    appointment: "Pilot",
    dateTos: new Date("2023-06-15"),
    dateSos: new Date("2025-06-15"),
    phone: "+2348089012345",
    entryDateTime: new Date("2023-06-15T13:30:00Z"),
    dependents: {
      dependents: [
        { name: "Halima Hassan", age: 55, relationship: "Mother" }
      ]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    sequence: 9,
    fullName: "Lance Corporal Joy Ogundimu",
    svcNo: "NA/90123",
    gender: "Female",
    armOfService: "Nigerian Army",
    category: "Soldier",
    rank: "Lance Corporal",
    maritalStatus: "Married",
    noOfAdultDependents: 0,
    noOfChildDependents: 1,
    currentUnit: "44 Engineering Brigade",
    appointment: "Combat Engineer",
    dateTos: new Date("2023-07-01"),
    dateSos: new Date("2025-07-01"),
    phone: "+2348090123456",
    entryDateTime: new Date("2023-07-01T10:15:00Z"),
    dependents: {
      spouse: { name: "Daniel Ogundimu", age: 28 },
      children: [{ name: "Esther Ogundimu", age: 2 }]
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    sequence: 10,
    fullName: "Lieutenant Ahmed Suleiman",
    svcNo: "NN/01234",
    gender: "Male",
    armOfService: "Nigerian Navy",
    category: "Officer",
    rank: "Lieutenant",
    maritalStatus: "Married",
    noOfAdultDependents: 0,
    noOfChildDependents: 0,
    currentUnit: "Nigerian Navy Ship ARADU",
    appointment: "Navigation Officer",
    dateTos: new Date("2023-08-10"),
    dateSos: new Date("2025-08-10"),
    phone: "+2348001234567",
    entryDateTime: new Date("2023-08-10T15:00:00Z"),
    dependents: {
      spouse: { name: "Fatima Suleiman", age: 25 }
    }
  }
];

// Additional utility data for generating more samples
export const ranks = {
  army: {
    officer: ["2nd Lieutenant", "Lieutenant", "Captain", "Major", "Lt Colonel", "Colonel", "Brigadier General"],
    soldier: ["Private", "Lance Corporal", "Corporal", "Sergeant", "Staff Sergeant", "WO2", "WO1"]
  },
  airForce: {
    officer: ["Pilot Officer", "Flying Officer", "Flight Lieutenant", "Squadron Leader", "Wing Commander", "Group Captain"],
    airman: ["Aircraftman", "Lance Corporal", "Corporal", "Sergeant", "Flight Sergeant", "Warrant Officer"]
  },
  navy: {
    officer: ["Midshipman", "Sub Lieutenant", "Lieutenant", "Lt Commander", "Commander", "Captain"],
    rating: ["Seaman", "Able Seaman", "Leading Seaman", "Petty Officer", "CPO", "Warrant Officer"]
  }
};

export const units = {
  army: ["1 Division", "2 Division", "3 Division", "6 Division", "7 Division", "81 Division", "82 Division", "Defence Headquarters"],
  airForce: ["115 SOG", "305 SMG", "551 NAF Station", "NAF Base Makurdi", "NAF Base Kaduna", "Defence Headquarters"],
  navy: ["NNS BEECROFT", "NNS DELTA", "NNS PATHFINDER", "NNS JUBILEE", "Nigerian Navy Ship ARADU", "Defence Headquarters"]
};

export const appointments = {
  army: ["Company Commander", "Battalion Commander", "Staff Officer", "Platoon Commander", "RSM", "CSM"],
  airForce: ["Pilot", "Squadron Commander", "Air Traffic Controller", "Engineering Officer", "Intelligence Officer"],
  navy: ["Ship Commander", "Navigation Officer", "Engineering Officer", "Operations Officer", "Chief Boatswain Mate"]
};