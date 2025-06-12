
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface QueueItem {
  id: string;
  sequence: number;
  full_name: string;
  svc_no: string;
  gender: string;
  arm_of_service: string;
  category: string;
  rank: string;
  marital_status: string;
  no_of_adult_dependents: number;
  no_of_child_dependents: number;
  current_unit: string | null;
  appointment: string | null;
  date_tos: string | null;
  date_sos: string | null;
  phone: string | null;
  entry_date_time: string;
}

interface Unit {
  id: string;
  name: string;
  description: string | null;
}

interface QueueFormProps {
  item: QueueItem | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const RANK_OPTIONS = {
  Army: {
    Men: [
      "Private",
      "Lance Corporal",
      "Corporal",
      "Sergeant",
      "Staff Sergeant",
      "Warrant Officer",
      "Master Warrant Officer",
      "Army Warrant Officer"
    ],
    Officer: [
      "Second Lieutenant",
      "Lieutenant",
      "Captain",
      "Major",
      "Lieutenant Colonel",
      "Colonel",
      "Brigadier General",
      "Major General",
      "Lieutenant General",
      "General",
      "Field Marshal"
    ]
  },
  Navy: {
    Men: [
      "Ordinary Seaman",
      "Seaman",
      "Able Seaman",
      "Leading Seaman",
      "Petty Officer",
      "Warrant Officer",
      "Master Warrant Officer",
      "Navy Warrant Officer"
    ],
    Officer: [
      "Midshipman",
      "Sub-Lieutenant",
      "Lieutenant",
      "Lieutenant Commander",
      "Commander",
      "Captain",
      "Commodore",
      "Rear Admiral",
      "Vice Admiral",
      "Admiral",
      "Admiral of the Fleet"
    ]
  },
  "Air Force": {
    Men: [
      "Aircraftman/Aircraftwoman",
      "Lance Corporal",
      "Corporal",
      "Sergeant",
      "Flight Sergeant",
      "Warrant Officer",
      "Master Warrant Officer",
      "Air Warrant Officer"
    ],
    Officer: [
      "Officer Cadet",
      "Pilot Officer",
      "Flying Officer",
      "Flight Lieutenant",
      "Squadron Leader",
      "Wing Commander",
      "Group Captain",
      "Air Commodore",
      "Air Vice Marshal",
      "Air Marshal",
      "Air Chief Marshal",
      "Marshal of the Air Force"
    ]
  }
};

export const QueueForm = ({ item, onSubmit, onCancel }: QueueFormProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    svc_no: "",
    gender: "",
    arm_of_service: "",
    category: "",
    rank: "",
    marital_status: "",
    no_of_adult_dependents: 0,
    no_of_child_dependents: 0,
    current_unit: "",
    appointment: "",
    date_tos: "",
    date_sos: "",
    phone: "",
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits();
    if (item) {
      setFormData({
        full_name: item.full_name,
        svc_no: item.svc_no,
        gender: item.gender,
        arm_of_service: item.arm_of_service,
        category: item.category,
        rank: item.rank,
        marital_status: item.marital_status,
        no_of_adult_dependents: item.no_of_adult_dependents,
        no_of_child_dependents: item.no_of_child_dependents,
        current_unit: item.current_unit || "",
        appointment: item.appointment || "",
        date_tos: item.date_tos || "",
        date_sos: item.date_sos || "",
        phone: item.phone || "",
      });
    }
  }, [item]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching units:", error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset rank when arm of service or category changes
    if (field === "arm_of_service" || field === "category") {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        rank: ""
      }));
    }
  };

  const getRankOptions = () => {
    if (!formData.arm_of_service || !formData.category) {
      return [];
    }
    
    const serviceKey = formData.arm_of_service as keyof typeof RANK_OPTIONS;
    const categoryKey = formData.category as keyof typeof RANK_OPTIONS[typeof serviceKey];
    
    return RANK_OPTIONS[serviceKey]?.[categoryKey] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name,
        svc_no: formData.svc_no,
        gender: formData.gender,
        arm_of_service: formData.arm_of_service,
        category: formData.category,
        rank: formData.rank,
        marital_status: formData.marital_status,
        no_of_adult_dependents: Number(formData.no_of_adult_dependents),
        no_of_child_dependents: Number(formData.no_of_child_dependents),
        current_unit: formData.current_unit || null,
        appointment: formData.appointment || null,
        date_tos: formData.date_tos || null,
        date_sos: formData.date_sos || null,
        phone: formData.phone || null,
      };

      let error;
      if (item) {
        // Update existing item
        ({ error } = await supabase
          .from("queue")
          .update(payload)
          .eq("id", item.id));
      } else {
        // Create new item
        ({ error } = await supabase
          .from("queue")
          .insert([payload]));
      }

      if (error) {
        console.error("Error saving queue item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save queue item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Queue item ${item ? 'updated' : 'created'} successfully`,
      });

      onSubmit();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit' : 'Add'} Personnel</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc_no">Service Number *</Label>
              <Input
                id="svc_no"
                value={formData.svc_no}
                onChange={(e) => handleInputChange("svc_no", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arm_of_service">Arm of Service *</Label>
              <Select value={formData.arm_of_service} onValueChange={(value) => handleInputChange("arm_of_service", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Army">Army</SelectItem>
                  <SelectItem value="Navy">Navy</SelectItem>
                  <SelectItem value="Air Force">Air Force</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Rank *</Label>
              <Select value={formData.rank} onValueChange={(value) => handleInputChange("rank", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {getRankOptions().map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Marital Status *</Label>
              <Select value={formData.marital_status} onValueChange={(value) => handleInputChange("marital_status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_of_adult_dependents">Adult Dependents</Label>
              <Input
                id="no_of_adult_dependents"
                type="number"
                min="0"
                max="99"
                value={formData.no_of_adult_dependents}
                onChange={(e) => handleInputChange("no_of_adult_dependents", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_of_child_dependents">Child Dependents</Label>
              <Input
                id="no_of_child_dependents"
                type="number"
                min="0"
                max="99"
                value={formData.no_of_child_dependents}
                onChange={(e) => handleInputChange("no_of_child_dependents", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_unit">Current Unit</Label>
              <Select value={formData.current_unit} onValueChange={(value) => handleInputChange("current_unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment">Appointment</Label>
              <Input
                id="appointment"
                value={formData.appointment}
                onChange={(e) => handleInputChange("appointment", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_tos">Date TOS</Label>
              <Input
                id="date_tos"
                type="date"
                value={formData.date_tos}
                onChange={(e) => handleInputChange("date_tos", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_sos">Date SOS</Label>
              <Input
                id="date_sos"
                type="date"
                value={formData.date_sos}
                onChange={(e) => handleInputChange("date_sos", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : item ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
