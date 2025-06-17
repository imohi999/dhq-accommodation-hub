
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { QueueFormData, Unit } from "@/types/queue";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnitAndDatesFieldsProps {
  formData: QueueFormData;
  units: Unit[];
  onInputChange: (field: string, value: string | number) => void;
}

export const UnitAndDatesFields = ({ formData, units, onInputChange }: UnitAndDatesFieldsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="current_unit">Current Unit</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {formData.current_unit
                ? units.find((unit) => unit.name === formData.current_unit)?.name
                : "Select unit..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search units..." />
              <CommandEmpty>No unit found.</CommandEmpty>
              <CommandGroup>
                {units.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={unit.name}
                    onSelect={(currentValue) => {
                      onInputChange("current_unit", currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.current_unit === unit.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {unit.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
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
