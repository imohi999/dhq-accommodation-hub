import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Building, Home, Users, Activity } from "lucide-react";

interface SummaryData {
	total: number;
	vacant: number;
	occupied: number;
	notInUse: number;
	byCategory: {
		men: number;
		nco: number;
		officer: number;
	};
}

interface AccommodationSummaryCardsProps {
	summary: SummaryData | null;
	loading?: boolean;
}

export const AccommodationSummaryCards = ({
	summary,
	loading = false,
}: AccommodationSummaryCardsProps) => {
	// Use default values when loading or no data
	const data = summary || {
		total: 0,
		vacant: 0,
		occupied: 0,
		notInUse: 0,
		byCategory: { nco: 0, officer: 0 },
	};

	const statusDescription = `${data.vacant} Vacant, ${data.occupied} Occupied, ${data.notInUse} Not In Use`;
	const categoryDescription = `${data.byCategory.officer} Officers, ${data.byCategory.nco} NCOs`;

	const summaryData = [
		{
			title: "Total Units",
			value: loading ? "..." : data.total.toLocaleString(),
			description: "Total accommodation ",
			icon: Building,
		},
		{
			title: "Occupancy",
			value: loading
				? "..."
				: `${data.occupied}/${data.total}/${data.notInUse}`,
			description: statusDescription,
			icon: Home,
		},
		{
			title: "Categories",
			value: loading
				? "..."
				: `${data.byCategory.officer + data.byCategory.nco}`,
			description: categoryDescription,
			icon: Users,
		},
		{
			title: "Availability",
			value: loading
				? "..."
				: `${Math.round((data.vacant / (data.total || 1)) * 100)}%`,
			description: `${data.vacant} units available`,
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
