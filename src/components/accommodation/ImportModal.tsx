
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImportFileUpload } from "./import/ImportFileUpload";
import { ImportValidation } from "./import/ImportValidation";
import { ImportConfirmation } from "./import/ImportConfirmation";
import { useImportValidation } from "./import/useImportValidation";
import { mutate } from "swr";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  housingTypes: Array<{ id: string; name: string }>;
}

export const ImportModal = ({ isOpen, onClose, onImportComplete, housingTypes }: ImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const {
    validationErrors,
    parsedData,
    isValidating,
    validationComplete,
    validateData,
    resetValidation,
  } = useImportValidation(housingTypes);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    resetValidation();
  };

  const handleValidate = async () => {
    if (!file) return;
    await validateData(file);
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

      // Call the API endpoint to import data
      const response = await fetch('/api/units/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: insertData,
          replaceExisting: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();

      toast({
        title: "Import Successful",
        description: result.message || `Successfully imported ${result.count} records.`,
      });

      // Revalidate the accommodations data
      await mutate('/api/accommodations');

      onImportComplete();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    resetValidation();
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

          <ImportFileUpload
            file={file}
            onFileSelect={handleFileSelect}
            housingTypes={housingTypes}
          />

          <ImportValidation
            file={file}
            validationErrors={validationErrors}
            parsedDataLength={parsedData.length}
            isValidating={isValidating}
            validationComplete={validationComplete}
            onValidate={handleValidate}
          />

          <ImportConfirmation
            validationComplete={validationComplete}
            validationErrorsLength={validationErrors.length}
            parsedDataLength={parsedData.length}
            isImporting={isImporting}
            onImport={handleImport}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
