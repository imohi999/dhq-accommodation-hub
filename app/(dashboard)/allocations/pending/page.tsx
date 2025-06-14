'use client';

import { useAllocation } from "@/hooks/useAllocation";
import { PendingApprovalView } from "@/components/allocation/PendingApprovalView";

export default function PendingApproval() {
  const { allocationRequests, loading } = useAllocation();
  const pendingRequests = allocationRequests.filter(req => req.status === 'pending');

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Pending Approval</h1>
        <p className="text-muted-foreground">
          Review and approve accommodation allocation requests
        </p>
      </div>
      <PendingApprovalView requests={pendingRequests} />
    </div>
  );
}