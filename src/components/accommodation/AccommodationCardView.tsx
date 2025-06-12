
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, History, Package, Trash2 } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface AccommodationCardViewProps {
  units: DHQLivingUnitWithHousingType[];
  viewMode: 'card' | 'compact';
  onEdit: (unit: DHQLivingUnitWithHousingType) => void;
  onDelete: (id: string) => void;
}

export const AccommodationCardView = ({ units, viewMode, onEdit, onDelete }: AccommodationCardViewProps) => {
  return (
    <div className={`grid gap-4 ${viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
      {units.map((unit) => (
        <Card 
          key={unit.id} 
          className={`overflow-hidden ${unit.status === 'Occupied' ? 'bg-red-50 border-red-200' : ''}`}
        >
          {viewMode === 'card' && (
            <div className="aspect-video bg-muted">
              {unit.block_image_url ? (
                <img 
                  src={unit.block_image_url} 
                  alt={`${unit.quarter_name} - ${unit.block_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
          )}
          
          <CardHeader className={viewMode === 'compact' ? 'p-3' : 'p-4'}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className={`font-semibold ${viewMode === 'compact' ? 'text-sm' : 'text-base'}`}>
                  {unit.quarter_name}
                </h3>
                <p className={`text-muted-foreground ${viewMode === 'compact' ? 'text-xs' : 'text-sm'}`}>
                  {unit.location}
                </p>
              </div>
              <Badge variant={unit.status === 'Occupied' ? 'destructive' : 'secondary'}>
                {unit.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className={viewMode === 'compact' ? 'p-3 pt-0' : 'p-4 pt-0'}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="outline" className={viewMode === 'compact' ? 'text-xs' : ''}>
                  {unit.category}
                </Badge>
                <Badge variant="outline" className={viewMode === 'compact' ? 'text-xs' : ''}>
                  {unit.housing_type?.name}
                </Badge>
              </div>
              
              {viewMode === 'card' && (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">Rooms:</span> {unit.no_of_rooms}</p>
                    <p><span className="font-medium">Occupancy:</span> {unit.type_of_occupancy}</p>
                    {unit.bq && (
                      <p><span className="font-medium">BQ Rooms:</span> {unit.no_of_rooms_in_bq}</p>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium">{unit.unit_name || `${unit.block_name} ${unit.flat_house_room_name}`}</p>
                    <p className="text-muted-foreground">{unit.block_name} - {unit.flat_house_room_name}</p>
                  </div>
                </>
              )}
              
              <div className="flex gap-1 pt-2">
                {viewMode === 'card' && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <History className="h-3 w-3" />
                      {!viewMode || viewMode === 'card' ? <span className="ml-1">History</span> : null}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Package className="h-3 w-3" />
                      {!viewMode || viewMode === 'card' ? <span className="ml-1">Inventory</span> : null}
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={viewMode === 'card' ? 'flex-1' : ''}
                  onClick={() => onEdit(unit)}
                >
                  <Edit className="h-3 w-3" />
                  {viewMode === 'card' ? <span className="ml-1">Edit</span> : null}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={viewMode === 'card' ? 'flex-1' : ''}
                  onClick={() => onDelete(unit.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  {viewMode === 'card' ? <span className="ml-1">Delete</span> : null}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {units.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-8">
          No accommodation units matching current filters
        </div>
      )}
    </div>
  );
};
