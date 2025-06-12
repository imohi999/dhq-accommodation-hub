
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, Table } from "lucide-react";

interface QueueViewToggleProps {
  viewMode: 'card' | 'table';
  onViewChange: (mode: 'card' | 'table') => void;
}

export const QueueViewToggle = ({ viewMode, onViewChange }: QueueViewToggleProps) => {
  return (
    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewChange(value as 'card' | 'table')}>
      <ToggleGroupItem value="card" aria-label="Card view">
        <Grid className="h-4 w-4" />
        Card View
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table className="h-4 w-4" />
        Table View
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
