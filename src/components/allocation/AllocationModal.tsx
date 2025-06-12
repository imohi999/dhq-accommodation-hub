
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useAllocation } from "@/hooks/useAllocation";
import { Home, Users, MapPin, Building } from "lucide-react";

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: QueueItem | null;
}

export const AllocationModal = ({ isOpen, onClose, personnel }: AllocationModalProps) => {
  const { units, loading: unitsLoading } = useAccommodationData();
  const { createAllocationRequest, loading: allocationLoading } = useAllocation();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter for vacant units only
  const vacantUnits = units.filter(unit => unit.status === "Vacant");
  
  // Filter units based on search term
  const filteredUnits = vacantUnits.filter(unit =>
    unit.quarter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.block_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.flat_house_room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUnit = vacantUnits.find(unit => unit.id === selectedUnitId);

  const handleAllocate = async () => {
    if (!personnel || !selectedUnit) return;

    const result = await createAllocationRequest(personnel, selectedUnit);
    if (result) {
      onClose();
      setSelectedUnitId("");
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUnitId("");
    setSearchTerm("");
  };

  if (!personnel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Accommodation</DialogTitle>
          <DialogDescription>
            Select an available unit for {personnel.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personnel Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personnel Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name & Rank</p>
                  <p className="font-medium">{personnel.rank} {personnel.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Number</p>
                  <p className="font-medium">{personnel.svc_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">{personnel.current_unit || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dependents</p>
                  <p className="font-medium">
                    Adults: {personnel.no_of_adult_dependents}, Children: {personnel.no_of_child_dependents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Units</Label>
              <Input
                id="search"
                placeholder="Search by quarter, location, block, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="unit">Available Units ({filteredUnits.length})</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.quarter_name} - {unit.block_name} {unit.flat_house_room_name} 
                      ({unit.no_of_rooms} rooms)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Unit Preview */}
          {selectedUnit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Unit</CardTitle>
                <CardDescription>
                  {selectedUnit.quarter_name} - {selectedUnit.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Block</p>
                      <p className="font-medium">{selectedUnit.block_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-medium">{selectedUnit.flat_house_room_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rooms</p>
                      <p className="font-medium">{selectedUnit.no_of_rooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedUnit.category}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary">{selectedUnit.housing_type?.name}</Badge>
                  <Badge variant="outline">{selectedUnit.type_of_occupancy}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAllocate} 
            disabled={!selectedUnitId || allocationLoading || unitsLoading}
          >
            {allocationLoading ? "Creating Request..." : "Create Allocation Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
