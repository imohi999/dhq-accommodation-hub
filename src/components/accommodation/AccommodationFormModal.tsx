"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Save, X } from "lucide-react";
import { DHQLivingUnitWithHousingType, HousingType } from "@/types/accommodation";

interface AccommodationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUnit: DHQLivingUnitWithHousingType | null;
  housingTypes: HousingType[];
}

export function AccommodationFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingUnit,
  housingTypes,
}: AccommodationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quarterName: "",
    location: "",
    category: "",
    accommodationTypeId: "",
    noOfRooms: 1,
    status: "vacant",
    typeOfOccupancy: "",
    bq: false,
    noOfRoomsInBq: 0,
    blockName: "",
    flatHouseRoomName: "",
    unitName: "",
    blockImageUrl: "",
  });

  useEffect(() => {
    if (editingUnit) {
      setFormData({
        quarterName: editingUnit.quarterName || "",
        location: editingUnit.location || "",
        category: editingUnit.category || "",
        accommodationTypeId: editingUnit.accommodationTypeId || "",
        noOfRooms: editingUnit.noOfRooms || 1,
        status: editingUnit.status || "vacant",
        typeOfOccupancy: editingUnit.typeOfOccupancy || "",
        bq: editingUnit.bq || false,
        noOfRoomsInBq: editingUnit.noOfRoomsInBq || 0,
        blockName: editingUnit.blockName || "",
        flatHouseRoomName: editingUnit.flatHouseRoomName || "",
        unitName: editingUnit.unitName || "",
        blockImageUrl: editingUnit.blockImageUrl || "",
      });
    } else {
      // Reset form for new unit
      setFormData({
        quarterName: "",
        location: "",
        category: "",
        accommodationTypeId: "",
        noOfRooms: 1,
        status: "vacant",
        typeOfOccupancy: "",
        bq: false,
        noOfRoomsInBq: 0,
        blockName: "",
        flatHouseRoomName: "",
        unitName: "",
        blockImageUrl: "",
      });
    }
  }, [editingUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.quarterName.trim()) {
      toast.error("Quarter name is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!formData.accommodationTypeId) {
      toast.error("Accommodation type is required");
      return;
    }

    setLoading(true);
    try {
      const url = editingUnit
        ? `/api/dhq-living-units/${editingUnit.id}`
        : "/api/units/create";
      
      const method = editingUnit ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save accommodation");
      }

      toast.success(
        editingUnit
          ? "Accommodation updated successfully"
          : "Accommodation created successfully"
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving accommodation:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save accommodation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUnit ? "Edit" : "Add"} Accommodation Quarter
          </DialogTitle>
          <DialogDescription>
            {editingUnit
              ? "Update the details of the accommodation quarter"
              : "Fill in the details to create a new accommodation quarter"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarterName">Quarter Name *</Label>
              <Input
                id="quarterName"
                value={formData.quarterName}
                onChange={(e) =>
                  setFormData({ ...formData, quarterName: e.target.value })
                }
                placeholder="e.g., Block A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Main Base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accommodationType">Accommodation Type *</Label>
              <Select
                value={formData.accommodationTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, accommodationTypeId: value })
                }
              >
                <SelectTrigger id="accommodationType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {housingTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="NCOs">NCOs</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="noOfRooms">Number of Rooms *</Label>
              <Input
                id="noOfRooms"
                type="number"
                min="1"
                value={formData.noOfRooms}
                onChange={(e) =>
                  setFormData({ ...formData, noOfRooms: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockName">Block Name</Label>
              <Input
                id="blockName"
                value={formData.blockName}
                onChange={(e) =>
                  setFormData({ ...formData, blockName: e.target.value })
                }
                placeholder="e.g., Block 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitName">Unit Name</Label>
              <Input
                id="unitName"
                value={formData.unitName}
                onChange={(e) =>
                  setFormData({ ...formData, unitName: e.target.value })
                }
                placeholder="e.g., Unit 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flatHouseRoomName">Flat/House/Room Name</Label>
              <Input
                id="flatHouseRoomName"
                value={formData.flatHouseRoomName}
                onChange={(e) =>
                  setFormData({ ...formData, flatHouseRoomName: e.target.value })
                }
                placeholder="e.g., Flat 2A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeOfOccupancy">Type of Occupancy</Label>
              <Input
                id="typeOfOccupancy"
                value={formData.typeOfOccupancy}
                onChange={(e) =>
                  setFormData({ ...formData, typeOfOccupancy: e.target.value })
                }
                placeholder="e.g., Single, Family"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="bq"
                checked={formData.bq}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, bq: checked })
                }
              />
              <Label htmlFor="bq">Has Boys Quarter (BQ)</Label>
            </div>

            {formData.bq && (
              <div className="space-y-2">
                <Label htmlFor="noOfRoomsInBq">Number of Rooms in BQ</Label>
                <Input
                  id="noOfRoomsInBq"
                  type="number"
                  min="0"
                  value={formData.noOfRoomsInBq}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      noOfRoomsInBq: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="blockImageUrl">Block Image URL</Label>
              <Input
                id="blockImageUrl"
                type="url"
                value={formData.blockImageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, blockImageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : editingUnit ? "Update" : "Create"} Quarter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}