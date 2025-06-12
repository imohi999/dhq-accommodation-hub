
import { PastAllocationsView } from "@/components/allocation/PastAllocationsView";

const PastAllocations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Past Allocations</h1>
        <p className="text-muted-foreground">
          View historical accommodation allocation records
        </p>
      </div>
      <PastAllocationsView />
    </div>
  );
};

export default PastAllocations;
