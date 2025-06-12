
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllocation } from "@/hooks/useAllocation";
import { PendingApprovalView } from "@/components/allocation/PendingApprovalView";
import { ActiveAllocationsView } from "@/components/allocation/ActiveAllocationsView";
import { PastAllocationsView } from "@/components/allocation/PastAllocationsView";
import { StampSettingsView } from "@/components/allocation/StampSettingsView";

const AllocationRequests = () => {
  const { allocationRequests, occupiedUnits, loading } = useAllocation();

  const pendingRequests = allocationRequests.filter(req => req.status === 'pending');
  const approvedRequests = allocationRequests.filter(req => req.status === 'approved');

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Allocation Management</h1>
        <p className="text-muted-foreground">
          Manage accommodation allocation requests and active allocations
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Approval ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="active">Active Allocations ({occupiedUnits.length})</TabsTrigger>
          <TabsTrigger value="past">Past Allocations</TabsTrigger>
          <TabsTrigger value="stamp">Stamp Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <PendingApprovalView requests={pendingRequests} />
        </TabsContent>
        
        <TabsContent value="active">
          <ActiveAllocationsView occupiedUnits={occupiedUnits} />
        </TabsContent>
        
        <TabsContent value="past">
          <PastAllocationsView />
        </TabsContent>
        
        <TabsContent value="stamp">
          <StampSettingsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllocationRequests;
