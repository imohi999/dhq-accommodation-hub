
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccommodationSummaryCards } from "@/components/accommodation/AccommodationSummaryCards";
import { AccommodationFilters } from "@/components/accommodation/AccommodationFilters";
import { AccommodationViewToggle } from "@/components/accommodation/AccommodationViewToggle";
import { AccommodationCardView } from "@/components/accommodation/AccommodationCardView";
import { AccommodationTableView } from "@/components/accommodation/AccommodationTableView";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useAccommodationFilters } from "@/hooks/useAccommodationFilters";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { supabase } from "@/integrations/supabase/client";

const DHQLivingUnits = () => {
  const { units, housingTypes, loading, refetch } = useAccommodationData();
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'table'>('card');
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<DHQLivingUnitWithHousingType | null>(null);
  
  const {
    searchTerm,
    setSearchTerm,
    quarterNameFilter,
    setQuarterNameFilter,
    locationFilter,
    setLocationFilter,
    categoryFilter,
    setCategoryFilter,
    housingTypeFilter,
    setHousingTypeFilter,
    statusFilter,
    setStatusFilter,
    occupancyFilter,
    setOccupancyFilter,
    blockNameFilter,
    setBlockNameFilter,
    flatHouseRoomFilter,
    setFlatHouseRoomFilter,
    unitNameFilter,
    setUnitNameFilter,
    filteredUnits
  } = useAccommodationFilters(units);
  
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingUnit(null);
    setShowForm(true);
  };

  const handleEdit = (unit: DHQLivingUnitWithHousingType) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accommodation unit?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("dhq_living_units")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting unit:", error);
        toast({
          title: "Error",
          description: "Failed to delete accommodation unit",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Accommodation unit deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Import",
          description: `Import functionality for ${file.name} would be implemented here`,
        });
      }
    };
    input.click();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">DHQ Living Units</h1>
          <p className="text-muted-foreground">
            Manage accommodation units for military personnel
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImport} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Unit
          </Button>
        </div>
      </div>

      <AccommodationSummaryCards units={filteredUnits} />

      <AccommodationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        quarterNameFilter={quarterNameFilter}
        onQuarterNameChange={setQuarterNameFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        housingTypeFilter={housingTypeFilter}
        onHousingTypeChange={setHousingTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        occupancyFilter={occupancyFilter}
        onOccupancyChange={setOccupancyFilter}
        blockNameFilter={blockNameFilter}
        onBlockNameChange={setBlockNameFilter}
        flatHouseRoomFilter={flatHouseRoomFilter}
        onFlatHouseRoomChange={setFlatHouseRoomFilter}
        unitNameFilter={unitNameFilter}
        onUnitNameChange={setUnitNameFilter}
        units={units}
        housingTypes={housingTypes}
      />

      <div className="flex justify-between items-center">
        <AccommodationViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        <p className="text-sm text-muted-foreground">
          Showing {filteredUnits.length} of {units.length} units
        </p>
      </div>

      {viewMode === 'table' ? (
        <AccommodationTableView
          units={filteredUnits}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <AccommodationCardView
          units={filteredUnits}
          viewMode={viewMode}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DHQLivingUnits;
