
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ImportConfirmationProps {
  validationComplete: boolean;
  validationErrorsLength: number;
  parsedDataLength: number;
  isImporting: boolean;
  onImport: () => void;
}

export const ImportConfirmation = ({
  validationComplete,
  validationErrorsLength,
  parsedDataLength,
  isImporting,
  onImport,
}: ImportConfirmationProps) => {
  if (!validationComplete || validationErrorsLength > 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Step 4: Import Data</h3>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Final Warning:</strong> This action will replace all existing records with the {parsedDataLength} records from your file.
        </AlertDescription>
      </Alert>
      <Button onClick={onImport} disabled={isImporting} className="w-full">
        {isImporting ? "Importing..." : `Import ${parsedDataLength} Records`}
      </Button>
    </div>
  );
};
