
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StampSettings } from "@/types/allocation";
import { supabase } from "@/integrations/supabase/client";

export const StampSettingsView = () => {
  const [settings, setSettings] = useState<StampSettings>({
    id: '',
    stamp_name: '',
    stamp_rank: '',
    stamp_appointment: '',
    stamp_note: '',
    is_active: true,
    created_at: '',
    updated_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStampSettings();
  }, []);

  const fetchStampSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("stamp_settings")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching stamp settings:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stamp settings",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        stamp_name: settings.stamp_name,
        stamp_rank: settings.stamp_rank,
        stamp_appointment: settings.stamp_appointment,
        stamp_note: settings.stamp_note,
        is_active: true,
      };

      let result;
      
      if (settings.id) {
        // Update existing
        result = await supabase
          .from("stamp_settings")
          .update(saveData)
          .eq("id", settings.id);
      } else {
        // Create new
        result = await supabase
          .from("stamp_settings")
          .insert(saveData);
      }

      if (result.error) {
        console.error("Error saving stamp settings:", result.error);
        toast({
          title: "Error",
          description: "Failed to save stamp settings",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Stamp settings saved successfully",
      });

      fetchStampSettings(); // Refresh the data
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Stamp Settings</h1>
        <p className="text-muted-foreground">
          Configure the stamp information for allocation letters
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Allocation Letter Stamp Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stamp_name">Stamp Name</Label>
            <Input
              id="stamp_name"
              value={settings.stamp_name}
              onChange={(e) => setSettings({ ...settings, stamp_name: e.target.value })}
              placeholder="Enter the name for the stamp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stamp_rank">Stamp Rank</Label>
            <Input
              id="stamp_rank"
              value={settings.stamp_rank}
              onChange={(e) => setSettings({ ...settings, stamp_rank: e.target.value })}
              placeholder="Enter the rank for the stamp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stamp_appointment">Stamp Appointment</Label>
            <Input
              id="stamp_appointment"
              value={settings.stamp_appointment}
              onChange={(e) => setSettings({ ...settings, stamp_appointment: e.target.value })}
              placeholder="Enter the appointment for the stamp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stamp_note">Stamp Note (Optional)</Label>
            <Textarea
              id="stamp_note"
              value={settings.stamp_note || ''}
              onChange={(e) => setSettings({ ...settings, stamp_note: e.target.value })}
              placeholder="Enter any additional note for the stamp"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Stamp Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
