
import { Button } from "@/components/ui/button";
import { Grid, LayoutGrid, Table } from "lucide-react";

interface AccommodationViewToggleProps {
  viewMode: 'card' | 'compact' | 'table';
  onViewChange: (mode: 'card' | 'compact' | 'table') => void;
}

export const AccommodationViewToggle = ({ viewMode, onViewChange }: AccommodationViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('card')}
        className="h-8"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Card</span>
      </Button>
      <Button
        variant={viewMode === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('compact')}
        className="h-8"
      >
        <Grid className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Compact</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8"
      >
        <Table className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Table</span>
      </Button>
    </div>
  );
};
