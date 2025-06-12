
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, ArrowRightLeft, UserMinus } from "lucide-react";
import { AllocationRequest } from "@/types/allocation";
import { AllocationLetter } from "@/components/allocation/AllocationLetter";
import { TransferModal } from "@/components/allocation/TransferModal";

interface ActiveAllocationsViewProps {
  requests: AllocationRequest[];
}

export const ActiveAllocationsView = ({ requests }: ActiveAllocationsViewProps) => {
  const [selectedRequest, setSelectedRequest] = useState<AllocationRequest | null>(null);
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    request: AllocationRequest | null;
  }>({
    isOpen: false,
    request: null,
  });
  const [deallocateDialog, setDeallocateDialog] = useState<{
    isOpen: boolean;
    request: AllocationRequest | null;
  }>({
    isOpen: false,
    request: null,
  });

  const handleTransferClick = (request: AllocationRequest) => {
    setTransferModal({
      isOpen: true,
      request,
    });
  };

  const handleDeallocateClick = (request: AllocationRequest) => {
    setDeallocateDialog({
      isOpen: true,
      request,
    });
  };

  const handleDeallocateConfirm = async () => {
    if (deallocateDialog.request) {
      // TODO: Implement deallocate logic
      console.log("Deallocating:", deallocateDialog.request.personnel_data.full_name);
    }
    setDeallocateDialog({
      isOpen: false,
      request: null,
    });
  };

  return (
    <div className="space-y-6">
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No active allocations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{request.personnel_data.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.personnel_data.rank} • Svc No: {request.personnel_data.svc_no}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.personnel_data.current_unit || "Naval Academy"} • {request.personnel_data.appointment || "Academy Instructor"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Personnel Details:</p>
                        <p>Category: {request.personnel_data.category}</p>
                        <p>Marital Status: {request.personnel_data.marital_status}</p>
                        <p>Dependents: {request.personnel_data.no_of_adult_dependents} Adults, {request.personnel_data.no_of_child_dependents} Children</p>
                      </div>
                      <div>
                        <p className="font-medium">Accommodation Details:</p>
                        <p>Quarter: {request.unit_data.quarter_name}</p>
                        <p>Location: {request.unit_data.location}</p>
                        <p>Unit: {request.unit_data.block_name} {request.unit_data.flat_house_room_name}</p>
                        <p>Rooms: {request.unit_data.no_of_rooms}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Letter
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransferClick(request)}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Transfer
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeallocateClick(request)}
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

      {/* Allocation Letter Dialog */}
      {selectedRequest && (
        <AllocationLetter
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          allocationRequest={selectedRequest}
        />
      )}

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal({ isOpen: false, request: null })}
        currentAllocation={transferModal.request}
      />

      {/* Deallocate Confirmation Dialog */}
      <Dialog open={deallocateDialog.isOpen} onOpenChange={(open) => 
        setDeallocateDialog({ ...deallocateDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deallocate Personnel</DialogTitle>
            <DialogDescription>
              Are you sure you want to deallocate {deallocateDialog.request?.personnel_data.full_name}? 
              This will mark their accommodation as vacant and move them to Past Allocations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeallocateDialog({ isOpen: false, request: null })}
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
