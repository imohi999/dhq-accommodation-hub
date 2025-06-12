
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRightLeft, UserMinus } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface ActiveAllocationsViewProps {
  occupiedUnits: DHQLivingUnitWithHousingType[];
}

export const ActiveAllocationsView = ({ occupiedUnits }: ActiveAllocationsViewProps) => {
  const [deallocateDialog, setDeallocateDialog] = useState<{
    isOpen: boolean;
    unit: DHQLivingUnitWithHousingType | null;
  }>({
    isOpen: false,
    unit: null,
  });

  const handleDeallocateClick = (unit: DHQLivingUnitWithHousingType) => {
    setDeallocateDialog({
      isOpen: true,
      unit,
    });
  };

  const handleDeallocateConfirm = async () => {
    if (deallocateDialog.unit) {
      // TODO: Implement deallocate logic
      console.log("Deallocating unit:", deallocateDialog.unit.id);
    }
    setDeallocateDialog({
      isOpen: false,
      unit: null,
    });
  };

  return (
    <div className="space-y-6">
      {occupiedUnits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No active allocations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {occupiedUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{unit.current_occupant_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {unit.current_occupant_rank} • Svc No: {unit.current_occupant_service_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Occupancy Start: {unit.occupancy_start_date ? new Date(unit.occupancy_start_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Personnel Details:</p>
                        <p>Category: {unit.category}</p>
                        <p>Current Status: Occupied</p>
                      </div>
                      <div>
                        <p className="font-medium">Accommodation Details:</p>
                        <p>Quarter: {unit.quarter_name}</p>
                        <p>Location: {unit.location}</p>
                        <p>Unit: {unit.block_name} {unit.flat_house_room_name}</p>
                        <p>Rooms: {unit.no_of_rooms}</p>
                        <p>Type: {unit.housing_type?.name || unit.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log("Transfer unit:", unit.id)}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Transfer
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeallocateClick(unit)}
                      className="flex items-center gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      Deallocate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deallocate Confirmation Dialog */}
      <Dialog open={deallocateDialog.isOpen} onOpenChange={(open) => 
        setDeallocateDialog({ ...deallocateDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deallocate Personnel</DialogTitle>
            <DialogDescription>
              Are you sure you want to deallocate {deallocateDialog.unit?.current_occupant_name}? 
              This will mark their accommodation as vacant and move them to Past Allocations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeallocateDialog({ isOpen: false, unit: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeallocateConfirm}
            >
              Deallocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
