
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { ValidationError } from "./importUtils";

interface ImportValidationProps {
  file: File | null;
  validationErrors: ValidationError[];
  parsedDataLength: number;
  isValidating: boolean;
  validationComplete: boolean;
  onValidate: () => void;
}

export const ImportValidation = ({
  file,
  validationErrors,
  parsedDataLength,
  isValidating,
  validationComplete,
  onValidate,
}: ImportValidationProps) => {
  if (!file) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Step 3: Validate Data</h3>
        <LoadingButton onClick={onValidate} loading={isValidating}>
          {isValidating ? "Validating..." : "Validate File"}
        </LoadingButton>
      </div>
      
      {validationComplete && (
        <div className="space-y-4">
          {validationErrors.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Validation successful! {parsedDataLength} records ready to import.
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
  );
};
