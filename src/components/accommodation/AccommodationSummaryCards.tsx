import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Building, Home, Grid3X3, Activity } from "lucide-react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface AccommodationSummaryCardsProps {
	units: DHQLivingUnitWithHousingType[];
}

export const AccommodationSummaryCards = ({
	units,
}: AccommodationSummaryCardsProps) => {
	const totalUnits = units.length;

	// Count unique quarters
	const uniqueQuarters = new Set(units.map((unit) => unit.quarterName)).size;

	// Sum total rooms
	const totalRooms = units.reduce((sum, unit) => sum + unit.noOfRooms, 0);

	// Count status breakdown
	const vacantCount = units.filter((unit) => unit.status === "Vacant").length;
	const occupiedCount = units.filter(
		(unit) => unit.status === "Occupied"
	).length;
	const notInUseCount = units.filter(
		(unit) => unit.status === "Not In Use"
	).length;

	const statusDescription = `${vacantCount} Vacant, ${occupiedCount} Occupied, ${notInUseCount} Not In Use`;

	const summaryData = [
		{
			title: "Total",
			value: totalUnits,
			description: "Total accommodation units",
			icon: Building,
		},
		{
			title: "Quarters",
			value: uniqueQuarters,
			description: "Number of units",
			icon: Home,
		},
		{
			title: "Rooms",
			value: totalRooms,
			description: "Total number of rooms",
			icon: Grid3X3,
		},
		{
			title: "Status",
			value: `${occupiedCount}/${totalUnits}`,
			description: statusDescription,
			icon: Activity,
		},
	];

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{summaryData.map((item) => (
				<Card key={item.title}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>{item.title}</CardTitle>
						<item.icon className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{item.value}</div>
						<CardDescription className='text-xs'>
							{item.description}
						</CardDescription>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
