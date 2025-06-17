
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueueFormData, Unit } from "@/types/queue";
import { useState } from "react";
import { Search } from "lucide-react";

interface UnitAndDatesFieldsProps {
  formData: QueueFormData;
  units: Unit[];
  onInputChange: (field: string, value: string | number) => void;
}

export const UnitAndDatesFields = ({ formData, units, onInputChange }: UnitAndDatesFieldsProps) => {
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  
  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="current_unit">Current Unit</Label>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search units..."
            value={unitSearchTerm}
            onChange={(e) => setUnitSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={formData.current_unit} onValueChange={(value) => onInputChange("current_unit", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {filteredUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.name}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appointment">Appointment</Label>
        <Input
          id="appointment"
          value={formData.appointment}
          onChange={(e) => onInputChange("appointment", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_tos">Date TOS</Label>
        <Input
          id="date_tos"
          type="date"
          value={formData.date_tos}
          onChange={(e) => onInputChange("date_tos", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_sos">Date SOS</Label>
        <Input
          id="date_sos"
          type="date"
          value={formData.date_sos}
          onChange={(e) => onInputChange("date_sos", e.target.value)}
        />
      </div>
    </>
  );
};
