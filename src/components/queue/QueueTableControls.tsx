
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Columns } from "lucide-react";
import { QueueItem } from "@/types/queue";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";

interface QueueTableControlsProps {
  data: QueueItem[];
  visibleColumns: Record<string, boolean>;
  onColumnVisibilityChange: (column: string, visible: boolean) => void;
}

const columnLabels = {
  sequence: 'Sequence',
  full_name: 'Full Name',
  svc_no: 'Service Number',
  gender: 'Gender',
  arm_of_service: 'Arm of Service',
  category: 'Category',
  rank: 'Rank',
  marital_status: 'Marital Status',
  no_of_adult_dependents: 'Adult Dependents',
  no_of_child_dependents: 'Child Dependents',
  current_unit: 'Current Unit',
  phone: 'Phone',
  date_tos: 'Date TOS',
  date_sos: 'Date SOS',
  entry_date_time: 'Entry Date',
  appointment: 'Appointment'
};

export const QueueTableControls = ({ 
  data, 
  visibleColumns, 
  onColumnVisibilityChange 
}: QueueTableControlsProps) => {
  const handleExportCSV = () => {
    exportToCSV(data, 'queue-list');
  };

  const handleExportExcel = () => {
    exportToExcel(data, 'queue-list');
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportCSV}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel}>
            Export as Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            Columns
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Toggle Columns</h4>
            {Object.entries(columnLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={visibleColumns[key]}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange(key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="text-sm">{label}</Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
