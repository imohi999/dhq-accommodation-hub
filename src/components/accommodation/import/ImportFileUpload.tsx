
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { downloadTemplate } from "./importUtils";

interface ImportFileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  housingTypes: Array<{ id: string; name: string }>;
}

export const ImportFileUpload = ({ file, onFileSelect, housingTypes }: ImportFileUploadProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    onFileSelect(selectedFile || null);
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(housingTypes);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
          <Button onClick={handleDownloadTemplate} variant="outline">
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
            <Button variant="outline" size="sm" onClick={() => onFileSelect(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
