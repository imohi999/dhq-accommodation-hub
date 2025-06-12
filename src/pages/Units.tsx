import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Unit } from "@/types/queue";

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits();
  }, []);

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
        toast({
          title: "Error",
          description: "Failed to fetch units",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting units:", data);
      setUnits(data || []);
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

  const handleAdd = () => {
    setEditingUnit(null);
    setFormData({ name: "", description: "" });
    setShowForm(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      description: unit.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("units")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting unit:", error);
        toast({
          title: "Error",
          description: "Failed to delete unit",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Unit deleted successfully",
      });

      fetchUnits();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Unit name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUnit) {
        const { error } = await supabase
          .from("units")
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq("id", editingUnit.id);

        if (error) {
          console.error("Error updating unit:", error);
          toast({
            title: "Error",
            description: "Failed to update unit",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Unit updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("units")
          .insert({
            name: formData.name,
            description: formData.description
          });

        if (error) {
          console.error("Error creating unit:", error);
          toast({
            title: "Error",
            description: "Failed to create unit",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Unit created successfully",
        });
      }

      setShowForm(false);
      setEditingUnit(null);
      setFormData({ name: "", description: "" });
      fetchUnits();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUnit(null);
    setFormData({ name: "", description: "" });
  };

  console.log("Units page state:", { loading, unitsCount: units.length });

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">Units Management</h1>
          <p className="text-muted-foreground">
            Manage units that appear in the Current Unit dropdown
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUnit ? 'Edit' : 'Add'} Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Unit Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter unit name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter unit description (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingUnit ? "Update" : "Create"} Unit
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Units List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.description || "No description"}</TableCell>
                  <TableCell>
                    {new Date(unit.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No units found. Add your first unit to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Units;
