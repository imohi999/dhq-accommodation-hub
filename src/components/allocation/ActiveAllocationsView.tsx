
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRightLeft, UserMinus, FileText } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { useOccupiedUnits } from "@/hooks/useOccupiedUnits";
import { AllocationLetter } from "./AllocationLetter";
import { TransferRequestModal } from "./TransferRequestModal";

interface ActiveAllocationsViewProps {
  occupiedUnits: DHQLivingUnitWithHousingType[];
}

export const ActiveAllocationsView = ({ occupiedUnits }: ActiveAllocationsViewProps) => {
  const { deallocatePersonnel } = useOccupiedUnits();
  const [deallocateDialog, setDeallocateDialog] = useState<{
    isOpen: boolean;
    unit: DHQLivingUnitWithHousingType | null;
  }>({
    isOpen: false,
    unit: null,
  });

  const [allocationLetter, setAllocationLetter] = useState<{
    isOpen: boolean;
    unit: DHQLivingUnitWithHousingType | null;
  }>({
    isOpen: false,
    unit: null,
  });

  const [transferModal, setTransferModal] = useState<{
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
      await deallocatePersonnel(deallocateDialog.unit.id);
    }
    setDeallocateDialog({
      isOpen: false,
      unit: null,
    });
  };

  const handleViewLetterClick = (unit: DHQLivingUnitWithHousingType) => {
    setAllocationLetter({
      isOpen: true,
      unit,
    });
  };

  const handleTransferClick = (unit: DHQLivingUnitWithHousingType) => {
    setTransferModal({
      isOpen: true,
      unit,
    });
  };

  // Create a mock allocation request for the letter from unit data
  const createMockAllocationRequest = (unit: DHQLivingUnitWithHousingType) => ({
    id: unit.id,
    personnel_id: unit.current_occupant_id || unit.id,
    unit_id: unit.id,
    letter_id: `ACTIVE-${unit.id.slice(0, 8)}`,
    personnel_data: {
      id: unit.current_occupant_id || unit.id,
      sequence: 1,
      full_name: unit.current_occupant_name || '',
      svc_no: unit.current_occupant_service_number || '',
      gender: 'Male',
      arm_of_service: 'Navy',
      category: unit.category,
      rank: unit.current_occupant_rank || '',
      marital_status: 'Single',
      no_of_adult_dependents: 0,
      no_of_child_dependents: 0,
      current_unit: 'Naval Academy',
      appointment: 'Academy Instructor',
      date_tos: null,
      date_sos: null,
      phone: null,
      entry_date_time: new Date().toISOString(),
    },
    unit_data: unit,
    allocation_date: unit.occupancy_start_date || new Date().toISOString(),
    status: 'approved' as const,
    created_at: unit.occupancy_start_date || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

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
                        <p>Quarter: {unit.quarterName}</p>
                        <p>Location: {unit.location}</p>
                        <p>Unit: {unit.blockName} {unit.flat_house_room_name}</p>
                        <p>Rooms: {unit.no_of_rooms}</p>
                        <p>Type: {unit.housing_type?.name || unit.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLetterClick(unit)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Letter
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransferClick(unit)}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Request Transfer
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

      {/* Allocation Letter Modal */}
      {allocationLetter.unit && (
        <AllocationLetter
          isOpen={allocationLetter.isOpen}
          onClose={() => setAllocationLetter({ isOpen: false, unit: null })}
          allocationRequest={createMockAllocationRequest(allocationLetter.unit)}
        />
      )}

      {/* Transfer Request Modal */}
      {transferModal.unit && (
        <TransferRequestModal
          isOpen={transferModal.isOpen}
          onClose={() => setTransferModal({ isOpen: false, unit: null })}
          currentUnit={transferModal.unit}
        />
      )}
    </div>
  );
};
