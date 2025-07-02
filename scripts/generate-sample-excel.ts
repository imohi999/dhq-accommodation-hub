import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Sample data for the Excel file with varied dependent counts
const sampleData = [
  {
    // Personnel with 0 dependents
    sequence: 21,
    fullName: "Major John Doe",
    svcNo: "NA/12345/90",
    gender: "Male",
    armOfService: "Nigerian Army",
    category: "Officer",
    rank: "Maj",
    maritalStatus: "Single",
    currentUnit: "DHQ",
    appointment: "Staff Officer",
    phone: "+234-8012345678",
    // No dependent fields
    dependent1Name: "",
    dependent1Gender: "",
    dependent1Age: "",
    dependent2Name: "",
    dependent2Gender: "",
    dependent2Age: "",
    dependent3Name: "",
    dependent3Gender: "",
    dependent3Age: "",
    dependent4Name: "",
    dependent4Gender: "",
    dependent4Age: "",
    dependent5Name: "",
    dependent5Gender: "",
    dependent5Age: "",
    dependent6Name: "",
    dependent6Gender: "",
    dependent6Age: "",
    // Unit matching fields
    quarterName: "Eagle Officers Quarters Lagos Cantonment",
    location: "Lagos Cantonment",
    blockName: "Block 3",
    flatHouseRoomName: "Flat 3",
    unitName: "Block 3 Flat 3"
  },
  {
    // Personnel with 3 dependents (1 adult, 2 children)
    sequence: 22,
    fullName: "Captain Jane Smith",
    svcNo: "NN/23456/92",
    gender: "Female",
    armOfService: "Nigerian Navy",
    category: "Officer",
    rank: "Capt",
    maritalStatus: "Married",
    currentUnit: "Naval Command",
    appointment: "Admin Officer",
    phone: "+234-8023456789",
    // 3 dependents
    dependent1Name: "James Smith",
    dependent1Gender: "Male",
    dependent1Age: 42,
    dependent2Name: "Emily Smith",
    dependent2Gender: "Female",
    dependent2Age: 12,
    dependent3Name: "David Smith",
    dependent3Gender: "Male",
    dependent3Age: 8,
    dependent4Name: "",
    dependent4Gender: "",
    dependent4Age: "",
    dependent5Name: "",
    dependent5Gender: "",
    dependent5Age: "",
    dependent6Name: "",
    dependent6Gender: "",
    dependent6Age: "",
    quarterName: "Dike Officers Quarters Mogadishu Cantonment",
    location: "Mogadishu Cantonment",
    blockName: "Block 1",
    flatHouseRoomName: "Flat 2",
    unitName: "Block 1 Flat 2"
  },
  {
    // Personnel with 6 dependents (2 adults, 4 children)
    sequence: 23,
    fullName: "Lt Col Ahmed Hassan",
    svcNo: "AF/34567/88",
    gender: "Male",
    armOfService: "Nigerian Air Force",
    category: "Officer",
    rank: "Lt Col",
    maritalStatus: "Married",
    currentUnit: "Air Defence",
    appointment: "Squadron Commander",
    phone: "+234-8034567890",
    // 6 dependents (full capacity)
    dependent1Name: "Fatima Hassan",
    dependent1Gender: "Female",
    dependent1Age: 38,
    dependent2Name: "Mrs. Hassan Senior",
    dependent2Gender: "Female",
    dependent2Age: 65,
    dependent3Name: "Aisha Hassan",
    dependent3Gender: "Female",
    dependent3Age: 16,
    dependent4Name: "Mohammed Hassan",
    dependent4Gender: "Male",
    dependent4Age: 14,
    dependent5Name: "Zainab Hassan",
    dependent5Gender: "Female",
    dependent5Age: 10,
    dependent6Name: "Ibrahim Hassan",
    dependent6Gender: "Male",
    dependent6Age: 6,
    quarterName: "Senior Officers Quarters Abuja",
    location: "Abuja FCT",
    blockName: "Block 4",
    flatHouseRoomName: "House 4",
    unitName: "Block 4 House 4"
  },
  {
    // Personnel with 1 dependent (child only)
    sequence: 24,
    fullName: "WO Mary Johnson",
    svcNo: "NA/45678/95",
    gender: "Female",
    armOfService: "Nigerian Army",
    category: "NCOs",
    rank: "WO",
    maritalStatus: "Divorced",
    currentUnit: "Medical Corps",
    appointment: "Medical Technician",
    phone: "+234-8045678901",
    // 1 dependent
    dependent1Name: "Grace Johnson",
    dependent1Gender: "Female",
    dependent1Age: 7,
    dependent2Name: "",
    dependent2Gender: "",
    dependent2Age: "",
    dependent3Name: "",
    dependent3Gender: "",
    dependent3Age: "",
    dependent4Name: "",
    dependent4Gender: "",
    dependent4Age: "",
    dependent5Name: "",
    dependent5Gender: "",
    dependent5Age: "",
    dependent6Name: "",
    dependent6Gender: "",
    dependent6Age: "",
    quarterName: "Test NCO Quarters",
    location: "Test Location",
    blockName: "Test Block C",
    flatHouseRoomName: "Room 301",
    unitName: "Test Block C Room 301"
  },
  {
    // Personnel with 4 dependents (3 adults, 1 child)
    sequence: 25,
    fullName: "Colonel Patricia Williams",
    svcNo: "NN/56789/85",
    gender: "Female",
    armOfService: "Nigerian Navy",
    category: "Officer",
    rank: "Col",
    maritalStatus: "Married",
    currentUnit: "DIA",
    appointment: "Director Operations",
    phone: "+234-8056789012",
    // 4 dependents
    dependent1Name: "Robert Williams",
    dependent1Gender: "Male",
    dependent1Age: 48,
    dependent2Name: "Mrs. Williams Senior",
    dependent2Gender: "Female",
    dependent2Age: 72,
    dependent3Name: "Mr. Williams Senior",
    dependent3Gender: "Male",
    dependent3Age: 75,
    dependent4Name: "Michael Williams",
    dependent4Gender: "Male",
    dependent4Age: 15,
    dependent5Name: "",
    dependent5Gender: "",
    dependent5Age: "",
    dependent6Name: "",
    dependent6Gender: "",
    dependent6Age: "",
    quarterName: "Command Officers Estate",
    location: "Ikeja Cantonment",
    blockName: "Estate A",
    flatHouseRoomName: "Duplex 2",
    unitName: "Estate A Duplex 2"
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Queue & Accommodation Data");

// Define output path
const outputDir = path.join(process.cwd(), 'public', 'samples');
const outputPath = path.join(outputDir, 'dhq-accommodation-import-sample.xlsx');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the Excel file
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Sample Excel file created at: ${outputPath}`);
console.log(`📊 Contains ${sampleData.length} sample records`);
console.log('\n📋 Column headers:');
console.log(Object.keys(sampleData[0]).join(', '));
console.log('\n📌 Note: The system will automatically calculate adult/child dependent counts from individual dependent ages');