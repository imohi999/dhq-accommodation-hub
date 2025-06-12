
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  housingTypes: Array<{ id: string; name: string }>;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportData {
  "Quarter Name": string;
  "Location": string;
  "Category": string;
  "Housing Type": string;
  "No of Rooms": string;
  "Status": string;
  "Type of Occupancy": string;
  "BQ": string;
  "No of Rooms in BQ": string;
  "Block Name": string;
  "Flat/House/Room Name": string;
  "Unit Name": string;
}

export const ImportModal = ({ isOpen, onClose, onImportComplete, housingTypes }: ImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parsedData, setParsedData] = useState<ImportData[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const { toast } = useToast();

  const requiredFields = [
    "Quarter Name",
    "Location", 
    "Category",
    "Housing Type",
    "No of Rooms",
    "Block Name",
    "Flat/House/Room Name"
  ];

  const validStatuses = ["Vacant", "Occupied", "Not In Use"];
  const validOccupancyTypes = ["Single", "Shared"];
  const validCategories = ["Men", "Navy", "Air Force"];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      setParsedData([]);
      setValidationComplete(false);
    }
  };

  const parseFile = (file: File): Promise<ImportData[]> => {
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
            const rows = jsonData.slice(1) as any[][];
            const parsedData = rows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
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

  const validateData = async () => {
    if (!file) return;

    setIsValidating(true);
    setValidationErrors([]);

    try {
      const data = await parseFile(file);
      setParsedData(data);
      
      const errors: ValidationError[] = [];
      const housingTypeNames = housingTypes.map(ht => ht.name);

      data.forEach((row, index) => {
        // Check required fields
        requiredFields.forEach(field => {
          if (!row[field as keyof ImportData] || String(row[field as keyof ImportData]).trim() === '') {
            errors.push({
              row: index + 2, // +2 because of 0-based index and header row
              field,
              message: `${field} is required`
            });
          }
        });

        // Validate specific field values
        if (row["Status"] && !validStatuses.includes(row["Status"])) {
          errors.push({
            row: index + 2,
            field: "Status",
            message: `Status must be one of: ${validStatuses.join(', ')}`
          });
        }

        if (row["Type of Occupancy"] && !validOccupancyTypes.includes(row["Type of Occupancy"])) {
          errors.push({
            row: index + 2,
            field: "Type of Occupancy",
            message: `Type of Occupancy must be one of: ${validOccupancyTypes.join(', ')}`
          });
        }

        if (row["Category"] && !validCategories.includes(row["Category"])) {
          errors.push({
            row: index + 2,
            field: "Category",
            message: `Category must be one of: ${validCategories.join(', ')}`
          });
        }

        if (row["Housing Type"] && !housingTypeNames.includes(row["Housing Type"])) {
          errors.push({
            row: index + 2,
            field: "Housing Type",
            message: `Housing Type must be one of: ${housingTypeNames.join(', ')}`
          });
        }

        // Validate numeric fields
        if (row["No of Rooms"] && (isNaN(Number(row["No of Rooms"])) || Number(row["No of Rooms"]) < 0)) {
          errors.push({
            row: index + 2,
            field: "No of Rooms",
            message: "No of Rooms must be a valid number"
          });
        }

        if (row["No of Rooms in BQ"] && (isNaN(Number(row["No of Rooms in BQ"])) || Number(row["No of Rooms in BQ"]) < 0)) {
          errors.push({
            row: index + 2,
            field: "No of Rooms in BQ",
            message: "No of Rooms in BQ must be a valid number"
          });
        }

        // Validate BQ field
        if (row["BQ"] && !["Yes", "No", "yes", "no", "YES", "NO", "true", "false", "1", "0"].includes(String(row["BQ"]).trim())) {
          errors.push({
            row: index + 2,
            field: "BQ",
            message: "BQ must be Yes/No, true/false, or 1/0"
          });
        }
      });

      setValidationErrors(errors);
      setValidationComplete(true);
      
      if (errors.length === 0) {
        toast({
          title: "Validation Successful",
          description: `${data.length} records validated successfully. Ready to import.`,
        });
      } else {
        toast({
          title: "Validation Failed",
          description: `Found ${errors.length} errors. Please fix them before importing.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating file:', error);
      toast({
        title: "Validation Error",
        description: "Failed to parse the file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationComplete || validationErrors.length > 0 || parsedData.length === 0) {
      toast({
        title: "Cannot Import",
        description: "Please validate the file and fix all errors first.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("This action will replace all existing records. Are you sure you want to continue?")) {
      return;
    }

    setIsImporting(true);

    try {
      // First, delete all existing records
      const { error: deleteError } = await supabase
        .from('dhq_living_units')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (deleteError) throw deleteError;

      // Prepare data for insertion
      const insertData = parsedData.map(row => {
        const housingType = housingTypes.find(ht => ht.name === row["Housing Type"]);
        
        return {
          quarter_name: row["Quarter Name"],
          location: row["Location"],
          category: row["Category"],
          housing_type_id: housingType?.id || '',
          no_of_rooms: parseInt(row["No of Rooms"]) || 0,
          status: row["Status"] || "Vacant",
          type_of_occupancy: row["Type of Occupancy"] || "Single",
          bq: ["Yes", "yes", "YES", "true", "1"].includes(String(row["BQ"]).trim()),
          no_of_rooms_in_bq: parseInt(row["No of Rooms in BQ"]) || 0,
          block_name: row["Block Name"],
          flat_house_room_name: row["Flat/House/Room Name"],
          unit_name: row["Unit Name"] || null,
        };
      });

      // Insert new records
      const { error: insertError } = await supabase
        .from('dhq_living_units')
        .insert(insertData);
      
      if (insertError) throw insertError;

      toast({
        title: "Import Successful",
        description: `Successfully imported ${parsedData.length} records.`,
      });

      onImportComplete();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setValidationErrors([]);
    setParsedData([]);
    setValidationComplete(false);
  };

  const downloadTemplate = () => {
    const template = [
      ["Quarter Name", "Location", "Category", "Housing Type", "No of Rooms", "Status", "Type of Occupancy", "BQ", "No of Rooms in BQ", "Block Name", "Flat/House/Room Name", "Unit Name"],
      ["Alpha Quarters", "North Block", "Men", housingTypes[0]?.name || "Officer Quarter", "3", "Vacant", "Single", "No", "0", "Block A", "Flat 101", "A-101"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DHQ Living Units Template");
    XLSX.writeFile(wb, "dhq_living_units_template.xlsx");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import DHQ Living Units
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action will replace all existing records. Please make sure you have a backup before proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
              <Button onClick={downloadTemplate} variant="outline">
                Download Template
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Download the Excel template with the correct format and sample data.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Select File</h3>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Choose a CSV or Excel file to import
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                </div>
              </div>
            </div>
            
            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{file.name}</span>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Step 3: Validate Data</h3>
                <Button onClick={validateData} disabled={isValidating}>
                  {isValidating ? "Validating..." : "Validate File"}
                </Button>
              </div>
              
              {validationComplete && (
                <div className="space-y-4">
                  {validationErrors.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Validation successful! {parsedData.length} records ready to import.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Found {validationErrors.length} validation errors. Please fix them before importing.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validationErrors.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Validation Errors:</h4>
                      <div className="space-y-1">
                        {validationErrors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600">
                            Row {error.row}, {error.field}: {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {validationComplete && validationErrors.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 4: Import Data</h3>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Final Warning:</strong> This action will replace all existing records with the {parsedData.length} records from your file.
                </AlertDescription>
              </Alert>
              <Button onClick={handleImport} disabled={isImporting} className="w-full">
                {isImporting ? "Importing..." : `Import ${parsedData.length} Records`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
