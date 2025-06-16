
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Wrench, Calendar, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import { UnitMaintenance } from "@/types/accommodation";
import useSWR, { mutate } from "swr";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  unitName: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const MaintenanceModal = ({ isOpen, onClose, unitId, unitName }: MaintenanceModalProps) => {
  const [editingItem, setEditingItem] = useState<UnitMaintenance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    maintenance_type: '',
    description: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    cost: '',
    status: 'Completed',
    priority: 'Medium',
    notes: ''
  });

  // Use SWR to fetch maintenance records
  const { data: maintenance = [], error, isLoading } = useSWR<UnitMaintenance[]>(
    isOpen ? `/api/units/maintenance?unitId=${unitId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      console.error('Error fetching maintenance:', error);
      toast.error("Failed to fetch maintenance records");
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        unit_id: unitId
      };

      if (editingItem) {
        const response = await fetch(`/api/units/maintenance/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        });
        
        if (!response.ok) throw new Error('Failed to update maintenance record');
        toast.success("Maintenance record updated successfully");
      } else {
        const response = await fetch('/api/units/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        });
        
        if (!response.ok) throw new Error('Failed to add maintenance record');
        toast.success("Maintenance record added successfully");
      }
      
      // Revalidate the maintenance data
      await mutate(`/api/units/maintenance?unitId=${unitId}`);
      resetForm();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error("Failed to save maintenance record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;
    
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/units/maintenance/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete maintenance record');
      toast.success("Maintenance record deleted successfully");
      
      // Revalidate the maintenance data
      await mutate(`/api/units/maintenance?unitId=${unitId}`);
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast.error("Failed to delete maintenance record");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (item: UnitMaintenance) => {
    setEditingItem(item);
    setFormData({
      maintenance_type: item.maintenance_type,
      description: item.description,
      maintenance_date: item.maintenance_date,
      performed_by: item.performed_by,
      cost: item.cost?.toString() || '',
      status: item.status,
      priority: item.priority,
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      maintenance_type: '',
      description: '',
      maintenance_date: new Date().toISOString().split('T')[0],
      performed_by: '',
      cost: '',
      status: 'Completed',
      priority: 'Medium',
      notes: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Records - {unitName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Records ({maintenance.length})</h3>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">{editingItem ? 'Edit Record' : 'Add New Record'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenance_type">Maintenance Type</Label>
                  <Input
                    id="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                    placeholder="e.g., Plumbing, Electrical"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="maintenance_date">Date</Label>
                  <Input
                    id="maintenance_date"
                    type="date"
                    value={formData.maintenance_date}
                    onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="performed_by">Performed By</Label>
                  <Input
                    id="performed_by"
                    value={formData.performed_by}
                    onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <LoadingButton type="submit" loading={isSubmitting}>
                  {editingItem ? 'Update Record' : 'Add Record'}
                </LoadingButton>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">Loading maintenance records...</div>
            ) : maintenance.length > 0 ? (
              maintenance.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{item.maintenance_type}</h4>
                        <Badge variant={
                          item.status === 'Completed' ? 'default' : 
                          item.status === 'In Progress' ? 'secondary' : 'outline'
                        }>
                          {item.status}
                        </Badge>
                        <Badge variant={
                          item.priority === 'High' ? 'destructive' : 
                          item.priority === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <LoadingButton 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        loading={isDeleting === item.id}
                        disabled={!!isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </LoadingButton>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(item.maintenance_date)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">By:</span> {item.performed_by}
                    </div>
                    {item.cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span>{item.cost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No maintenance records found for this unit.</p>
                <Button onClick={() => setShowForm(true)} className="mt-2">
                  Add First Record
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
