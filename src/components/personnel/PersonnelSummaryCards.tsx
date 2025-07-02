import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { QueueItem } from "@/types/queue";

interface PersonnelSummaryCardsProps {
	queueItems: QueueItem[];
}

export const PersonnelSummaryCards = ({
	queueItems,
}: PersonnelSummaryCardsProps) => {
	const totalCount = queueItems.length;
	const officerCount = queueItems.filter(
		(item) => item.category === "Officer"
	).length;
	const ncoCount = queueItems.filter((item) => item.category === "NCO").length;

	const armyItems = queueItems.filter(
		(item) => item.arm_of_service === "Nigerian Army"
	);
	const navyItems = queueItems.filter(
		(item) => item.arm_of_service === "Nigerian Navy"
	);
	const airForceItems = queueItems.filter(
		(item) => item.arm_of_service === "Nigerian Air Force"
	);

	const armyOfficers = armyItems.filter(
		(item) => item.category === "Officer"
	).length;
	const armyNCO = armyItems.filter((item) => item.category === "NCO").length;
	const navyOfficers = navyItems.filter(
		(item) => item.category === "Officer"
	).length;
	const navyNCO = navyItems.filter((item) => item.category === "NCO").length;
	const airForceOfficers = airForceItems.filter(
		(item) => item.category === "Officer"
	).length;
	const airForceNCO = airForceItems.filter(
		(item) => item.category === "NCO"
	).length;

	return (
		<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Total Personnel</CardTitle>
					<Users className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalCount}</div>
					<p className='text-xs text-muted-foreground'>
						Officers: {officerCount} | NCO: {ncoCount}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Nigerian Army</CardTitle>
					<div className='w-4 h-4 rounded-full bg-red-500' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{armyItems.length}</div>
					<p className='text-xs text-muted-foreground'>
						Officers: {armyOfficers} | NCO: {armyNCO}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Nigerian Navy</CardTitle>
					<div className='w-4 h-4 rounded-full bg-blue-500' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{navyItems.length}</div>
					<p className='text-xs text-muted-foreground'>
						Officers: {navyOfficers} | NCO: {navyNCO}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						Nigerian Air Force
					</CardTitle>
					<div className='w-4 h-4 rounded-full bg-cyan-500' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{airForceItems.length}</div>
					<p className='text-xs text-muted-foreground'>
						Officers: {airForceOfficers} | NCO: {airForceNCO}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
