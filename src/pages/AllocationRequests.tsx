
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAllocation } from "@/hooks/useAllocation";
import { AllocationRequest } from "@/types/allocation";
import { CheckCircle, XCircle, Clock, FileText, User, Home } from "lucide-react";
import { AllocationLetter } from "@/components/allocation/AllocationLetter";

const AllocationRequests = () => {
  const { allocationRequests, loading, approveAllocation, refuseAllocation } = useAllocation();
  const [refusalDialog, setRefusalDialog] = useState<{
    isOpen: boolean;
    requestId: string;
    reason: string;
  }>({
    isOpen: false,
    requestId: "",
    reason: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<AllocationRequest | null>(null);

  const handleApprove = async (requestId: string) => {
    await approveAllocation(requestId);
  };

  const handleRefuseClick = (requestId: string) => {
    setRefusalDialog({
      isOpen: true,
      requestId,
      reason: "",
    });
  };

  const handleRefuseConfirm = async () => {
    if (refusalDialog.reason.trim()) {
      await refuseAllocation(refusalDialog.requestId, refusalDialog.reason);
      setRefusalDialog({
        isOpen: false,
        requestId: "",
        reason: "",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "refused":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "refused":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">Allocation Requests</h1>
          <p className="text-muted-foreground">
            Manage pending accommodation allocation requests
          </p>
        </div>
      </div>

      {allocationRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No allocation requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allocationRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Letter Ref: {request.letter_id}
                    </CardTitle>
                    <CardDescription>
                      Created: {new Date(request.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personnel Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Personnel Details</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {request.personnel_data.full_name}</p>
                      <p><span className="font-medium">Rank:</span> {request.personnel_data.rank}</p>
                      <p><span className="font-medium">Service No:</span> {request.personnel_data.svc_no}</p>
                      <p><span className="font-medium">Unit:</span> {request.personnel_data.current_unit || "N/A"}</p>
                      <p><span className="font-medium">Dependents:</span> Adults: {request.personnel_data.no_of_adult_dependents}, Children: {request.personnel_data.no_of_child_dependents}</p>
                    </div>
                  </div>

                  {/* Unit Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Unit Details</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Quarter:</span> {request.unit_data.quarter_name}</p>
                      <p><span className="font-medium">Location:</span> {request.unit_data.location}</p>
                      <p><span className="font-medium">Block:</span> {request.unit_data.block_name}</p>
                      <p><span className="font-medium">Unit:</span> {request.unit_data.flat_house_room_name}</p>
                      <p><span className="font-medium">Rooms:</span> {request.unit_data.no_of_rooms}</p>
                      <p><span className="font-medium">Type:</span> {request.unit_data.housing_type?.name}</p>
                    </div>
                  </div>
                </div>

                {request.refusal_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Refusal Reason:</span> {request.refusal_reason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Letter
                  </Button>
                  
                  {request.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRefuseClick(request.id)}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Refuse
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refusal Dialog */}
      <Dialog open={refusalDialog.isOpen} onOpenChange={(open) => 
        setRefusalDialog({ ...refusalDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuse Allocation Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for refusing this allocation request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Refusal</Label>
              <Textarea
                id="reason"
                value={refusalDialog.reason}
                onChange={(e) => setRefusalDialog({ 
                  ...refusalDialog, 
                  reason: e.target.value 
                })}
                placeholder="Enter reason for refusal..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRefusalDialog({ 
                isOpen: false, 
                requestId: "", 
                reason: "" 
              })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRefuseConfirm}
              disabled={!refusalDialog.reason.trim()}
            >
              Refuse Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocation Letter Dialog */}
      {selectedRequest && (
        <AllocationLetter
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          allocationRequest={selectedRequest}
        />
      )}
    </div>
  );
};

export default AllocationRequests;
