
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Anchor, Plane } from "lucide-react";
import { QueueItem } from "@/types/queue";

interface QueueSummaryCardsProps {
  queueItems: QueueItem[];
}

export const QueueSummaryCards = ({ queueItems }: QueueSummaryCardsProps) => {
  const totalCount = queueItems.length;
  const armyCount = queueItems.filter(item => item.arm_of_service === "Army").length;
  const navyCount = queueItems.filter(item => item.arm_of_service === "Navy").length;
  const airForceCount = queueItems.filter(item => item.arm_of_service === "Air Force").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Queue</p>
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Awaiting Allocation</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300">Army</p>
              <p className="text-3xl font-bold text-red-800 dark:text-red-200">{armyCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400">In Queue</p>
            </div>
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Navy</p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{navyCount}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">In Queue</p>
            </div>
            <Anchor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-sky-50 dark:bg-sky-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sky-700 dark:text-sky-300">Air Force</p>
              <p className="text-3xl font-bold text-sky-800 dark:text-sky-200">{airForceCount}</p>
              <p className="text-sm text-sky-600 dark:text-sky-400">In Queue</p>
            </div>
            <Plane className="h-8 w-8 text-sky-600 dark:text-sky-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
