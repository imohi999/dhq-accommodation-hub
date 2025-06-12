
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Anchor, Plane } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface AccommodationSummaryCardsProps {
  units: DHQLivingUnitWithHousingType[];
}

export const AccommodationSummaryCards = ({ units }: AccommodationSummaryCardsProps) => {
  const totalUnits = units.length;
  const armyUnits = units.filter(unit => unit.category === "Men").length;
  const navyUnits = units.filter(unit => unit.category === "Navy").length;
  const airForceUnits = units.filter(unit => unit.category === "Air Force").length;

  const summaryData = [
    {
      title: "Total",
      value: totalUnits,
      description: "Total accommodation units",
      icon: Building,
      color: "bg-gray-50 border-gray-200",
    },
    {
      title: "Army",
      value: armyUnits,
      description: "Army accommodation units",
      icon: Users,
      color: "bg-red-50 border-red-200",
    },
    {
      title: "Navy", 
      value: navyUnits,
      description: "Navy accommodation units",
      icon: Anchor,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Air Force",
      value: airForceUnits,
      description: "Air Force accommodation units",
      icon: Plane,
      color: "bg-sky-50 border-sky-200",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item) => (
        <Card key={item.title} className={item.color}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <CardDescription className="text-xs">
              {item.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
