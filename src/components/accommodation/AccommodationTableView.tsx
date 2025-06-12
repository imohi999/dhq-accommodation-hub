
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Download } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface AccommodationTableViewProps {
  units: DHQLivingUnitWithHousingType[];
  onEdit: (unit: DHQLivingUnitWithHousingType) => void;
  onDelete: (id: string) => void;
}

export const AccommodationTableView = ({ units, onEdit, onDelete }: AccommodationTableViewProps) => {
  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Quarter Name', 'Location', 'Category', 'Housing Type', 'No of Rooms',
      'Status', 'Type of Occupancy', 'BQ', 'No of Rooms in BQ', 'Block Name',
      'Flat/House/Room Name', 'Unit Name'
    ];
    
    const csvContent = [
      headers.join(','),
      ...units.map(unit => [
        unit.quarter_name,
        unit.location,
        unit.category,
        unit.housing_type?.name || '',
        unit.no_of_rooms,
        unit.status,
        unit.type_of_occupancy,
        unit.bq ? 'Yes' : 'No',
        unit.no_of_rooms_in_bq,
        unit.block_name,
        unit.flat_house_room_name,
        unit.unit_name || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accommodation-units-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Accommodation Units</CardTitle>
            <CardDescription>
              Currently showing {units.length} accommodation units
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quarter Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Housing Type</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>BQ</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id} className={unit.status === 'Occupied' ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{unit.quarter_name}</TableCell>
                <TableCell>{unit.location}</TableCell>
                <TableCell>
                  <Badge variant="outline">{unit.category}</Badge>
                </TableCell>
                <TableCell>{unit.housing_type?.name}</TableCell>
                <TableCell>{unit.no_of_rooms}</TableCell>
                <TableCell>
                  <Badge variant={unit.status === 'Occupied' ? 'destructive' : 'secondary'}>
                    {unit.status}
                  </Badge>
                </TableCell>
                <TableCell>{unit.type_of_occupancy}</TableCell>
                <TableCell>
                  <Badge variant={unit.bq ? 'default' : 'secondary'}>
                    {unit.bq ? `Yes (${unit.no_of_rooms_in_bq})` : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{unit.block_name}</TableCell>
                <TableCell>{unit.unit_name || `${unit.block_name} ${unit.flat_house_room_name}`}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(unit)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(unit.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No accommodation units matching current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
