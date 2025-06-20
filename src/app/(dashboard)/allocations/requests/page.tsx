'use client';

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/spinner";
import { useAllocation } from "@/hooks/useAllocation";
import { PendingApprovalView } from "@/components/allocation/PendingApprovalView";
import { ActiveAllocationsView } from "@/components/allocation/ActiveAllocationsView";
import { PastAllocationsView } from "@/components/allocation/PastAllocationsView";
import { StampSettingsView } from "@/components/allocation/StampSettingsView";
import { APIAllocationRequest } from "../pending/page";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AllocationRequests() {
  const { occupiedUnits, loading: occupiedLoading } = useAllocation();
  
  // Fetch allocation requests in the correct format for PendingApprovalView
  const { data: allocationRequests = [], isLoading: requestsLoading, mutate } = useSWR<APIAllocationRequest[]>(
    '/api/allocations/requests',
    fetcher,
    {
      refreshInterval: 10_000,
      revalidateOnFocus: true,
    }
  );

  const pendingRequests = allocationRequests.filter(req => req.status === 'pending');
  const approvedRequests = allocationRequests.filter(req => req.status === 'approved');

  if (requestsLoading || occupiedLoading) {
    return <LoadingState isLoading={true}>{null}</LoadingState>;
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
          <PendingApprovalView requests={pendingRequests} mutate={mutate} />
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
}