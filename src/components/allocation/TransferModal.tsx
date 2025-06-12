
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Bed } from "lucide-react";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useOccupiedUnits } from "@/hooks/useOccupiedUnits";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnit: DHQLivingUnitWithHousingType;
}

export const TransferModal = ({ isOpen, onClose, currentUnit }: TransferModalProps) => {
  const { units } = useAccommodationData();
  const { transferAllocation } = useOccupiedUnits();
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    unit: DHQLivingUnitWithHousingType | null;
  }>({
    isOpen: false,
    unit: null,
  });

  // Filter vacant units that match the personnel's category
  const availableUnits = units.filter(unit => 
    unit.status === "Vacant" && 
    unit.category === currentUnit.category
  );

  const handleAllocateClick = (unit: DHQLivingUnitWithHousingType) => {
    setConfirmDialog({
      isOpen: true,
      unit,
    });
  };

  const handleConfirmTransfer = async () => {
    if (confirmDialog.unit) {
      const success = await transferAllocation(currentUnit.id, confirmDialog.unit.id);
      if (success) {
        setConfirmDialog({ isOpen: false, unit: null });
        onClose();
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Accommodation</DialogTitle>
            <DialogDescription>
              Transfer {currentUnit.current_occupant_name} to another unit.
              Showing {availableUnits.length} vacant {currentUnit.category.toLowerCase()} units.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Unit Information */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Living Unit Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Personnel:</span> {currentUnit.current_occupant_rank} {currentUnit.current_occupant_name}</p>
                    <p><span className="font-medium">Service Number:</span> {currentUnit.current_occupant_service_number}</p>
                    <p><span className="font-medium">Category:</span> {currentUnit.category}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Quarter:</span> {currentUnit.quarter_name}</p>
                    <p><span className="font-medium">Location:</span> {currentUnit.location}</p>
                    <p><span className="font-medium">Unit:</span> {currentUnit.block_name} {currentUnit.flat_house_room_name}</p>
                    <p><span className="font-medium">Occupancy Start:</span> {currentUnit.occupancy_start_date ? new Date(currentUnit.occupancy_start_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                Card View
              </Button>
              <Button 
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                Compact View
              </Button>
            </div>

            {/* Available Units List */}
            {availableUnits.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    No vacant {currentUnit.category.toLowerCase()} units available
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'card' ? "space-y-4" : "grid grid-cols-2 gap-4"}>
                {availableUnits.map((unit) => (
                  <Card key={unit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className={viewMode === 'card' ? "p-4" : "p-3"}>
                      <div className="flex items-start justify-between">
                        <div className={viewMode === 'card' ? "space-y-2" : "space-y-1"}>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <h4 className={viewMode === 'card' ? "font-medium" : "text-sm font-medium"}>
                              {unit.quarter_name}
                            </h4>
                          </div>
                          
                          <div className={viewMode === 'card' ? "space-y-1 text-sm" : "text-xs space-y-1"}>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{unit.location}</span>
                            </div>
                            <p><span className="font-medium">Block:</span> {unit.block_name}</p>
                            <p><span className="font-medium">Unit:</span> {unit.flat_house_room_name}</p>
                            <div className="flex items-center gap-2">
                              <Bed className="h-3 w-3" />
                              <span>{unit.no_of_rooms} rooms</span>
                            </div>
                            {unit.housing_type && (
                              <Badge variant="outline" className="text-xs">
                                {unit.housing_type.name}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleAllocateClick(unit)}
                          className="flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          Transfer Here
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        setConfirmDialog({ ...confirmDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to transfer {currentUnit.current_occupant_name} from {currentUnit.quarter_name} {currentUnit.block_name} {currentUnit.flat_house_room_name} to {confirmDialog.unit?.quarter_name} {confirmDialog.unit?.block_name} {confirmDialog.unit?.flat_house_room_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ isOpen: false, unit: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmTransfer}>
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
