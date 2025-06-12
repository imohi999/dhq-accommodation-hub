
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QueueForm } from "@/components/QueueForm";
import { QueueSummaryCards } from "@/components/queue/QueueSummaryCards";
import { QueueFilters } from "@/components/queue/QueueFilters";
import { QueueCardView } from "@/components/queue/QueueCardView";
import { QueueViewToggle } from "@/components/queue/QueueViewToggle";
import { QueueTableView } from "@/components/queue/QueueTableView";
import { useQueueData } from "@/hooks/useQueueData";
import { useQueueFilters } from "@/hooks/useQueueFilters";
import { QueueItem } from "@/types/queue";

const QueueList = () => {
  const { queueItems, units, loading, fetchQueueItems } = useQueueData();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  const {
    searchTerm,
    setSearchTerm,
    genderFilter,
    setGenderFilter,
    maritalStatusFilter,
    setMaritalStatusFilter,
    categoryFilter,
    setCategoryFilter,
    unitFilter,
    setUnitFilter,
    filteredItems
  } = useQueueFilters(queueItems);
  
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: QueueItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAllocate = (item: QueueItem) => {
    toast({
      title: "Allocation",
      description: `Allocation for ${item.full_name} would be handled here`,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this queue item?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("queue")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting queue item:", error);
        toast({
          title: "Error",
          description: "Failed to delete queue item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Queue item deleted successfully",
      });

      fetchQueueItems();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchQueueItems();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">Queue List</h1>
          <p className="text-muted-foreground">
            Manage the waiting list for incoming personnel
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add to Queue
        </Button>
      </div>

      <QueueSummaryCards queueItems={filteredItems} />

      {showForm && (
        <QueueForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      <QueueFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        genderFilter={genderFilter}
        onGenderChange={setGenderFilter}
        maritalStatusFilter={maritalStatusFilter}
        onMaritalStatusChange={setMaritalStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        unitFilter={unitFilter}
        onUnitChange={setUnitFilter}
        units={units}
      />

      <div className="flex justify-between items-center">
        <QueueViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {queueItems.length} personnel
        </p>
      </div>

      {viewMode === 'card' ? (
        <QueueCardView 
          queueItems={filteredItems}
          onEdit={handleEdit}
          onAllocate={handleAllocate}
        />
      ) : (
        <QueueTableView
          queueItems={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default QueueList;
