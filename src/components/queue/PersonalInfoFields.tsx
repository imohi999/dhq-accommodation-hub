
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueueFormData } from "@/types/queue";

interface PersonalInfoFieldsProps {
  formData: QueueFormData;
  onInputChange: (field: string, value: string | number) => void;
}

export const PersonalInfoFields = ({ formData, onInputChange }: PersonalInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => onInputChange("full_name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="svc_no">Service Number *</Label>
        <Input
          id="svc_no"
          value={formData.svc_no}
          onChange={(e) => onInputChange("svc_no", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <Select value={formData.gender} onValueChange={(value) => onInputChange("gender", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marital_status">Marital Status *</Label>
        <Select value={formData.marital_status} onValueChange={(value) => onInputChange("marital_status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Married">Married</SelectItem>
            <SelectItem value="Divorced">Divorced</SelectItem>
            <SelectItem value="Widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
        />
      </div>
    </>
  );
};
