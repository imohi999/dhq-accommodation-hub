
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "react-toastify";
import { UnitInventory } from "@/types/accommodation";
import useSWR, { mutate } from "swr";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  unitName: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const InventoryModal = ({ isOpen, onClose, unitId, unitName }: InventoryModalProps) => {
  const [editingItem, setEditingItem] = useState<UnitInventory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    item_description: '',
    item_location: '',
    item_status: 'Functional',
    note: ''
  });

  // Use SWR to fetch inventory
  const { data: inventory = [], error, isLoading } = useSWR<UnitInventory[]>(
    isOpen ? `/api/units/inventory?unitId=${unitId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      console.error('Error fetching inventory:', error);
      toast.error("Failed to fetch inventory");
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        const response = await fetch(`/api/units/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to update inventory item');
        toast.success("Inventory item updated successfully");
      } else {
        const response = await fetch('/api/units/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formData, unit_id: unitId }),
        });
        
        if (!response.ok) throw new Error('Failed to add inventory item');
        toast.success("Inventory item added successfully");
      }
      
      // Revalidate the inventory data
      await mutate(`/api/units/inventory?unitId=${unitId}`);
      resetForm();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error("Failed to save inventory item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    
    try {
      const response = await fetch(`/api/units/inventory/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete inventory item');
      toast.success("Inventory item deleted successfully");
      
      // Revalidate the inventory data
      await mutate(`/api/units/inventory?unitId=${unitId}`);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error("Failed to delete inventory item");
    }
  };

  const handleEdit = (item: UnitInventory) => {
    setEditingItem(item);
    setFormData({
      quantity: item.quantity,
      item_description: item.item_description,
      item_location: item.item_location,
      item_status: item.item_status,
      note: item.note || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      quantity: 1,
      item_description: '',
      item_location: '',
      item_status: 'Functional',
      note: ''
    });
    setShowForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory - {unitName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items ({inventory.length})</h3>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="item_status">Item Status</Label>
                  <Select value={formData.item_status} onValueChange={(value) => setFormData({ ...formData, item_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Functional">Functional</SelectItem>
                      <SelectItem value="Non Functional">Non Functional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="item_description">Item Description</Label>
                <Input
                  id="item_description"
                  value={formData.item_description}
                  onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="item_location">Item Location</Label>
                <Input
                  id="item_location"
                  value={formData.item_location}
                  onChange={(e) => setFormData({ ...formData, item_location: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">Loading inventory...</div>
            ) : inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{item.item_description}</h4>
                        <Badge variant={item.item_status === 'Functional' ? 'default' : 'destructive'}>
                          {item.item_status}
                        </Badge>
                        <Badge variant="outline">Qty: {item.quantity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Location: {item.item_location}</p>
                      {item.note && (
                        <p className="text-sm text-muted-foreground">Note: {item.note}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No inventory items found for this unit.</p>
                <Button onClick={() => setShowForm(true)} className="mt-2">
                  Add First Item
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
