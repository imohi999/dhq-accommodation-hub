
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QueueFormData } from "@/types/queue";

interface DependentsFieldsProps {
  formData: QueueFormData;
  onInputChange: (field: string, value: string | number) => void;
}

export const DependentsFields = ({ formData, onInputChange }: DependentsFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="no_of_adult_dependents">Adult Dependents</Label>
        <Input
          id="no_of_adult_dependents"
          type="number"
          min="0"
          max="99"
          value={formData.no_of_adult_dependents}
          onChange={(e) => onInputChange("no_of_adult_dependents", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="no_of_child_dependents">Child Dependents</Label>
        <Input
          id="no_of_child_dependents"
          type="number"
          min="0"
          max="99"
          value={formData.no_of_child_dependents}
          onChange={(e) => onInputChange("no_of_child_dependents", parseInt(e.target.value) || 0)}
        />
      </div>
    </>
  );
};
