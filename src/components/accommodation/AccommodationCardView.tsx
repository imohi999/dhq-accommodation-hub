
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, History, Package, Trash2, Wrench, User, Calendar } from "lucide-react";
import { DHQLivingUnitWithHousingType, UnitHistory, UnitInventory, UnitMaintenance } from "@/types/accommodation";
import { HistoryModal } from "./HistoryModal";
import { InventoryModal } from "./InventoryModal";
import { MaintenanceModal } from "./MaintenanceModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccommodationCardViewProps {
  units: DHQLivingUnitWithHousingType[];
  viewMode: 'card' | 'compact';
  onEdit: (unit: DHQLivingUnitWithHousingType) => void;
  onDelete: (id: string) => void;
}

export const AccommodationCardView = ({ units, viewMode, onEdit, onDelete }: AccommodationCardViewProps) => {
  const [selectedUnit, setSelectedUnit] = useState<DHQLivingUnitWithHousingType | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [unitHistory, setUnitHistory] = useState<UnitHistory[]>([]);
  const { toast } = useToast();

  const handleHistoryClick = async (unit: DHQLivingUnitWithHousingType) => {
    setSelectedUnit(unit);
    
    try {
      const { data, error } = await supabase
        .from('unit_history')
        .select('*')
        .eq('unit_id', unit.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setUnitHistory(data || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch unit history",
        variant: "destructive",
      });
    }
  };

  const handleInventoryClick = (unit: DHQLivingUnitWithHousingType) => {
    setSelectedUnit(unit);
    setShowInventoryModal(true);
  };

  const handleMaintenanceClick = (unit: DHQLivingUnitWithHousingType) => {
    setSelectedUnit(unit);
    setShowMaintenanceModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Occupied': return 'destructive';
      case 'Vacant': return 'secondary';
      case 'Not In Use': return 'outline';
      default: return 'secondary';
    }
  };

  const getCardClassName = (status: string) => {
    let baseClass = "overflow-hidden transition-all hover:shadow-md";
    switch (status) {
      case 'Occupied': return `${baseClass} bg-red-50 border-red-200`;
      case 'Not In Use': return `${baseClass} bg-gray-50 border-gray-300`;
      default: return baseClass;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDaysOccupied = (startDate: string | null) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <div className={`grid gap-4 ${viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
        {units.map((unit) => (
          <Card key={unit.id} className={getCardClassName(unit.status)}>
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
                <Badge variant={getStatusBadgeVariant(unit.status)}>
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

                {/* Occupant Information for Occupied Units */}
                {unit.status === 'Occupied' && unit.current_occupant_name && (
                  <div className={`bg-blue-50 rounded-lg p-2 ${viewMode === 'compact' ? 'text-xs' : 'text-sm'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-blue-900">Current Occupant</span>
                    </div>
                    <p className="text-blue-800 font-medium">{unit.current_occupant_name}</p>
                    <p className="text-blue-700">{unit.current_occupant_rank}</p>
                    <p className="text-blue-600 text-xs">{unit.current_occupant_service_number}</p>
                    {unit.occupancy_start_date && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-600 text-xs">
                          Since {formatDate(unit.occupancy_start_date)} ({calculateDaysOccupied(unit.occupancy_start_date)} days)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
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
                
                <div className={`grid gap-1 pt-2 ${viewMode === 'card' ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleHistoryClick(unit)}
                    className="flex items-center gap-1"
                  >
                    <History className="h-3 w-3" />
                    <span className={`${viewMode === 'compact' ? 'text-xs' : ''}`}>History</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleInventoryClick(unit)}
                    className="flex items-center gap-1"
                  >
                    <Package className="h-3 w-3" />
                    <span className={`${viewMode === 'compact' ? 'text-xs' : ''}`}>Inventory</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleMaintenanceClick(unit)}
                    className="flex items-center gap-1"
                  >
                    <Wrench className="h-3 w-3" />
                    <span className={`${viewMode === 'compact' ? 'text-xs' : ''}`}>Maintenance</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(unit)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span className={`${viewMode === 'compact' ? 'text-xs' : ''}`}>Edit</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(unit.id)}
                    className="flex items-center gap-1 col-span-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className={`${viewMode === 'compact' ? 'text-xs' : ''}`}>Delete</span>
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

      {/* Modals */}
      {selectedUnit && (
        <>
          <HistoryModal
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            unitName={selectedUnit.unit_name || `${selectedUnit.block_name} ${selectedUnit.flat_house_room_name}`}
            history={unitHistory}
          />
          
          <InventoryModal
            isOpen={showInventoryModal}
            onClose={() => setShowInventoryModal(false)}
            unitId={selectedUnit.id}
            unitName={selectedUnit.unit_name || `${selectedUnit.block_name} ${selectedUnit.flat_house_room_name}`}
          />
          
          <MaintenanceModal
            isOpen={showMaintenanceModal}
            onClose={() => setShowMaintenanceModal(false)}
            unitId={selectedUnit.id}
            unitName={selectedUnit.unit_name || `${selectedUnit.block_name} ${selectedUnit.flat_house_room_name}`}
          />
        </>
      )}
    </>
  );
};
