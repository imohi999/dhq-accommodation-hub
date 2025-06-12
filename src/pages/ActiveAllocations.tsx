
import { useAllocation } from "@/hooks/useAllocation";
import { ActiveAllocationsView } from "@/components/allocation/ActiveAllocationsView";

const ActiveAllocations = () => {
  const { allocationRequests, loading } = useAllocation();
  const approvedRequests = allocationRequests.filter(req => req.status === 'approved');

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Active Allocations</h1>
        <p className="text-muted-foreground">
          Manage current accommodation allocations
        </p>
      </div>
      <ActiveAllocationsView requests={approvedRequests} />
    </div>
  );
};

export default ActiveAllocations;
