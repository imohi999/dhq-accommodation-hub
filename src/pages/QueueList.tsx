import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QueueForm } from "@/components/QueueForm";
import { QueueSummaryCards } from "@/components/queue/QueueSummaryCards";
import { QueueFilters } from "@/components/queue/QueueFilters";
import { QueueCardView } from "@/components/queue/QueueCardView";
import { QueueViewToggle } from "@/components/queue/QueueViewToggle";
import { QueueItem, Unit } from "@/types/queue";

const QueueList = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [maritalStatusFilter, setMaritalStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchQueueItems();
    fetchUnits();
  }, []);

  const fetchQueueItems = async () => {
    console.log("Fetching queue items...");
    try {
      const { data, error } = await supabase
        .from("queue")
        .select("*")
        .order("sequence", { ascending: true });

      console.log("Queue items fetch result:", { data, error });

      if (error) {
        console.error("Error fetching queue items:", error);
        toast({
          title: "Error",
          description: "Failed to fetch queue items",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting queue items:", data);
      setQueueItems(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    console.log("Fetching units...");
    try {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("name");

      console.log("Units fetch result:", { data, error });

      if (error) {
        console.error("Error fetching units:", error);
        return;
      }

      console.log("Setting units:", data);
      setUnits(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    return queueItems.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesGender = genderFilter === "all" || item.gender === genderFilter;
      const matchesMaritalStatus = maritalStatusFilter === "all" || item.marital_status === maritalStatusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesUnit = unitFilter === "all" || item.current_unit === unitFilter;

      return matchesSearch && matchesGender && matchesMaritalStatus && matchesCategory && matchesUnit;
    });
  }, [queueItems, searchTerm, genderFilter, maritalStatusFilter, categoryFilter, unitFilter]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: QueueItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAllocate = (item: QueueItem) => {
    // TODO: Implement allocation logic
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

  console.log("Current state:", { loading, queueItems: queueItems.length, units: units.length, filteredItems: filteredItems.length });

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
        <Card>
          <CardHeader>
            <CardTitle>Personnel Queue</CardTitle>
            <CardDescription>
              Current waiting list with {filteredItems.length} personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Seq</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Service No</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Marital Status</TableHead>
                  <TableHead>Dependents</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Entry Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">#{item.sequence}</TableCell>
                    <TableCell>{item.full_name}</TableCell>
                    <TableCell>{item.svc_no}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{item.arm_of_service}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.rank}</TableCell>
                    <TableCell>{item.marital_status}</TableCell>
                    <TableCell>
                      A:{item.no_of_adult_dependents} C:{item.no_of_child_dependents}
                    </TableCell>
                    <TableCell>{item.current_unit || "N/A"}</TableCell>
                    <TableCell>{item.phone || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(item.entry_date_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground">
                      No personnel matching current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QueueList;
