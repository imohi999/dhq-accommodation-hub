import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { Dependent } from "@/types/queue";

interface DependentsDetailsFieldsProps {
  dependents?: Dependent[];
  onDependentsChange: (dependents: Dependent[]) => void;
}

export const DependentsDetailsFields = ({ 
  dependents = [], 
  onDependentsChange 
}: DependentsDetailsFieldsProps) => {
  const [newDependent, setNewDependent] = useState<Dependent>({
    name: "",
    gender: "Male",
    age: 0
  });

  const handleAddDependent = () => {
    if (newDependent.name && newDependent.age > 0) {
      onDependentsChange([...dependents, newDependent]);
      setNewDependent({ name: "", gender: "Male", age: 0 });
    }
  };

  const handleRemoveDependent = (index: number) => {
    onDependentsChange(dependents.filter((_, i) => i !== index));
  };

  const adultDependents = dependents.filter(d => d.age >= 18).length;
  const childDependents = dependents.filter(d => d.age < 18).length;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Dependent Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adults: {adultDependents} | Children: {childDependents} | Total: {dependents.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new dependent form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="dependent-name">Name</Label>
            <Input
              id="dependent-name"
              value={newDependent.name}
              onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
              placeholder="Dependent name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dependent-gender">Gender</Label>
            <Select
              value={newDependent.gender}
              onValueChange={(value) => setNewDependent({ ...newDependent, gender: value })}
            >
              <SelectTrigger id="dependent-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dependent-age">Age</Label>
            <Input
              id="dependent-age"
              type="number"
              min="0"
              max="120"
              value={newDependent.age || ""}
              onChange={(e) => setNewDependent({ ...newDependent, age: parseInt(e.target.value) || 0 })}
              placeholder="Age"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddDependent}
              disabled={!newDependent.name || newDependent.age <= 0}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </div>
        </div>

        {/* List of dependents */}
        {dependents.length > 0 && (
          <div className="space-y-2">
            <Label>Current Dependents</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dependents.map((dependent, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{dependent.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {dependent.gender} • {dependent.age} years
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {dependent.age >= 18 ? "Adult" : "Child"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDependent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};