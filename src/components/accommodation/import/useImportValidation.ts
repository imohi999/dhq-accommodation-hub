
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ImportData,
  ValidationError,
  parseFile,
  requiredFields,
  validStatuses,
  validOccupancyTypes,
  validCategories,
} from "./importUtils";

export const useImportValidation = (housingTypes: Array<{ id: string; name: string }>) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parsedData, setParsedData] = useState<ImportData[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const { toast } = useToast();

  const validateData = async (file: File) => {
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

  const resetValidation = () => {
    setValidationErrors([]);
    setParsedData([]);
    setValidationComplete(false);
  };

  return {
    validationErrors,
    parsedData,
    isValidating,
    validationComplete,
    validateData,
    resetValidation,
  };
};
