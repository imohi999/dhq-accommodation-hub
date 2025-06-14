
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchPastAllocationsFromDb } from "@/services/allocationApi";
import { Clock, User, Home } from "lucide-react";

interface PastAllocation {
  id: string;
  personnel_data: any;
  unit_data: any;
  allocation_start_date: string;
  allocation_end_date?: string | null;
  duration_days?: number | null;
  reason_for_leaving?: string | null;
  letter_id: string;
  deallocation_date?: string | null;
  created_at: string;
  updated_at: string;
}

export const PastAllocationsView = () => {
  const [pastAllocations, setPastAllocations] = useState<PastAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastAllocations();
  }, []);

  const fetchPastAllocations = async () => {
    const data = await fetchPastAllocationsFromDb();
    if (data) {
      setPastAllocations(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Past Allocations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastAllocations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastAllocations.length > 0 
                ? Math.round(pastAllocations.filter(a => a.duration_days).reduce((sum, a) => sum + (a.duration_days || 0), 0) / pastAllocations.filter(a => a.duration_days).length)
                : 0
              } days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Year</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastAllocations.filter(a => 
                new Date(a.allocation_end_date || a.allocation_start_date).getFullYear() === new Date().getFullYear()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {pastAllocations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No past allocations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pastAllocations.map((allocation) => (
            <Card key={allocation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{allocation.personnel_data.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {allocation.personnel_data.rank} • Svc No: {allocation.personnel_data.svc_no}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Letter: {allocation.letter_id}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Allocation Period:</p>
                      <p>{new Date(allocation.allocation_start_date).toLocaleDateString()}</p>
                      {allocation.allocation_end_date && (
                        <p>to {new Date(allocation.allocation_end_date).toLocaleDateString()}</p>
                      )}
                      {allocation.duration_days && (
                        <p className="text-muted-foreground">Duration: {allocation.duration_days} days</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Previous Unit:</p>
                      <p>{allocation.unit_data.quarter_name} {allocation.unit_data.block_name} {allocation.unit_data.flat_house_room_name}</p>
                      {allocation.reason_for_leaving && (
                        <p className="text-muted-foreground mt-1">
                          <span className="font-medium">Reason for leaving:</span> {allocation.reason_for_leaving}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
