
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Bed } from "lucide-react";
import { AllocationRequest } from "@/types/allocation";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllocation: AllocationRequest | null;
}

export const TransferModal = ({ isOpen, onClose, currentAllocation }: TransferModalProps) => {
  const { units } = useAccommodationData();
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    unit: DHQLivingUnitWithHousingType | null;
  }>({
    isOpen: false,
    unit: null,
  });

  if (!currentAllocation) return null;

  // Filter vacant units that match the personnel's category
  const availableUnits = units.filter(unit => 
    unit.status === "Vacant" && 
    unit.category === currentAllocation.personnel_data.category
  );

  const handleAllocateClick = (unit: DHQLivingUnitWithHousingType) => {
    setConfirmDialog({
      isOpen: true,
      unit,
    });
  };

  const handleConfirmTransfer = () => {
    if (confirmDialog.unit) {
      // TODO: Implement transfer logic
      console.log("Transferring to:", confirmDialog.unit.quarter_name);
    }
    setConfirmDialog({ isOpen: false, unit: null });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Personnel</DialogTitle>
            <DialogDescription>
              Do you want to transfer {currentAllocation.personnel_data.full_name} to another unit?
              Showing {availableUnits.length} vacant {currentAllocation.personnel_data.category.toLowerCase()} units.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            {/* Units List */}
            {availableUnits.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    No vacant {currentAllocation.personnel_data.category.toLowerCase()} units available
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
                          Allocate Unit
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
              Are you sure you want to transfer {currentAllocation.personnel_data.full_name} from their current unit to {confirmDialog.unit?.quarter_name} {confirmDialog.unit?.block_name} {confirmDialog.unit?.flat_house_room_name}?
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
