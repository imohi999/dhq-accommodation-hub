
import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ImportData {
  "Quarter Name": string;
  "Location": string;
  "Category": string;
  "Accommodation Type": string;
  "No of Rooms": string;
  "Status": string;
  "Type of Occupancy": string;
  "BQ": string;
  "No of Rooms in BQ": string;
  "Block Name": string;
  "Flat/House/Room Name": string;
  "Quarters Name": string;
  "unit_name"?: string; // Optional field for direct unit name
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const requiredFields = [
  "Quarter Name",
  "Location",
  "Category",
  "Accommodation Type",
  "No of Rooms",
  "Block Name",
  "Flat/House/Room Name"
];

export const validStatuses = ["Vacant", "Occupied", "Not In Use"];
export const validOccupancyTypes = ["Single", "Shared"];
export const validCategories = ["NCO", "Officer"];

export const parseFile = (file: File): Promise<ImportData[]> => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as ImportData[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Convert to proper format with headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as (string | number | boolean | null)[][];
          const parsedData = rows.map(row => {
            const obj: Record<string, string | number | boolean | null> = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj as unknown as ImportData;
          });

          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please use CSV or Excel files.'));
    }
  });
};

export const downloadTemplate = (housingTypes: Array<{ id: string; name: string }>) => {
  const template = [
    ["Quarter Name", "Location", "Category", "Accommodation Type", "No of Rooms", "Status", "Type of Occupancy", "BQ", "No of Rooms in BQ", "Block Name", "Flat/House/Room Name", "Quarters Name"],
    ["Alpha Quarters", "North Block", "NCO", housingTypes[0]?.name || "Officer Quarter", "3", "Vacant", "Single", "No", "0", "Block A", "Flat 101", "A-101"],
    ["Officer Quarters", "South Block", "Officer", housingTypes[0]?.name || "Officer Quarter", "4", "Occupied", "Single", "Yes", "1", "Block B", "House 201", "B-201"]
  ];

  const ws = XLSX.utils.aoa_to_sheet(template);

  // Add validation comments to help users
  const comments = {
    'C1': 'Valid values: NCO, Officer',
    'F1': 'Valid values: Vacant, Occupied, Not In Use',
    'G1': 'Valid values: Single, Shared',
    'H1': 'Valid values: Yes, No, true, false, 1, 0'
  };

  Object.entries(comments).forEach(([cell, comment]) => {
    if (!ws[cell]) ws[cell] = {};
    ws[cell].c = [{ a: 'System', t: comment }];
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DHQ  Accommodation Template");
  XLSX.writeFile(wb, "dhq_living_units_template.xlsx");
};
