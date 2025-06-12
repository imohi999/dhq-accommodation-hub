
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportFileUpload } from "./import/ImportFileUpload";
import { ImportValidation } from "./import/ImportValidation";
import { ImportConfirmation } from "./import/ImportConfirmation";
import { useImportValidation } from "./import/useImportValidation";

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
