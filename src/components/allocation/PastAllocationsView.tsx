
import { Card, CardContent } from "@/components/ui/card";

export const PastAllocationsView = () => {
  // TODO: Implement past allocations data fetching and display
  const pastAllocations: any[] = []; // Placeholder

  return (
    <div className="space-y-6">
      {pastAllocations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No past allocations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pastAllocations.map((allocation, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{allocation.personnelName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {allocation.rank} • Svc No: {allocation.serviceNumber}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Allocation Period:</p>
                      <p>{allocation.startDate} - {allocation.endDate}</p>
                      <p>Duration: {allocation.duration}</p>
                    </div>
                    <div>
                      <p className="font-medium">Previous Unit:</p>
                      <p>{allocation.quarter} {allocation.block} {allocation.unit}</p>
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
