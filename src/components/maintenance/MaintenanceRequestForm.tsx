import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "react-toastify";
import { useAccommodationData } from "@/hooks/useAccommodationData";

interface MaintenanceRequest {
  id: string;
  unitId: string;
  unitName: string;
  issueCategory: string;
  issueDescription: string;
  priorityLevel: string;
  reportedBy: string;
  reportedAt: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ISSUE_CATEGORIES = [
  "Plumbing", "Electrical", "HVAC", "Structural", "Appliance", "Security", "Other"
];
const PRIORITIES = [
  "Low", "Medium", "High", "Emergency"
];
const STATUSES = [
  "Pending", "In Progress", "Completed", "Rejected"
];

export function MaintenanceRequestForm({
  initial,
  onClose,
  onComplete
}: {
  initial?: MaintenanceRequest | null,
  onClose?: () => void,
  onComplete?: () => void
}) {
  const [form, setForm] = useState({
    unitId: "",
    unitName: "",
    issueCategory: "",
    issueDescription: "",
    priorityLevel: "Medium",
    reportedBy: "",
    reportedAt: "",
    status: "Pending",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { units, loading } = useAccommodationData();

  useEffect(() => {
    if (initial) {
      setForm({
        unitId: initial.unitId,
        unitName: initial.unitName,
        issueCategory: initial.issueCategory || "",
        issueDescription: initial.issueDescription || "",
        priorityLevel: initial.priorityLevel || "Medium",
        reportedBy: initial.reportedBy || "",
        reportedAt: initial.reportedAt,
        status: initial.status || "Pending",
        notes: initial.notes || ""
      });
    } else {
      setForm({
        unitId: "",
        unitName: "",
        issueCategory: "",
        issueDescription: "",
        priorityLevel: "Medium",
        reportedBy: "",
        reportedAt: "",
        status: "Pending",
        notes: ""
      });
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const selectedUnit = units.find(u => u.id === form.unitId);
    const submitData = {
      ...form,
      unitName: selectedUnit?.unitName || ""
    };

    try {
      let response;
      if (initial && initial.id) {
        response = await fetch(`/api/maintenance/requests/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
      } else {
        response = await fetch("/api/maintenance/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) throw new Error("Failed to save request");

      toast.success(initial ? "Request updated successfully" : "Request created successfully");
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request");
    }
    
    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-6">Loading units...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-6 space-y-4 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Unit Name</Label>
          <Select
            value={form.unitId}
            onValueChange={val =>
              setForm(f => ({ ...f, unitId: val }))}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.filter(u => u.unitName).map(u => (
                <SelectItem value={u.id} key={u.id}>
                  {u.unitName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Issue Category</Label>
          <Select
            value={form.issueCategory}
            onValueChange={val => setForm(f => ({ ...f, issueCategory: val }))}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {ISSUE_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority Level</Label>
          <Select
            value={form.priorityLevel}
            onValueChange={val => setForm(f => ({ ...f, priorityLevel: val }))}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={val => setForm(f => ({ ...f, status: val }))}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Issue Description</Label>
        <Textarea
          value={form.issueDescription}
          onChange={e => setForm(f => ({ ...f, issueDescription: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Reported By</Label>
          <Input
            value={form.reportedBy}
            onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <Label>Notes / Remarks</Label>
          <Input
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <LoadingButton 
          type="submit" 
          loading={submitting}
          loadingText={initial ? "Updating..." : "Creating..."}
        >
          {initial ? "Update Request" : "Submit Request"}
        </LoadingButton>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}