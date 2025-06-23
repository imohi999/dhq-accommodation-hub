import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { QueueItem } from "@/types/queue";

interface QueueSummaryCardsProps {
	queueItems: QueueItem[];
}

export const QueueSummaryCards = ({ queueItems }: QueueSummaryCardsProps) => {
	const totalCount = queueItems.length;
	const officerCount = queueItems.filter(
		(item) => item.category === "Officer"
	).length;
	const ncoCount = queueItems.filter((item) => item.category === "NCOs").length;

	// Extract service from service number prefix
	const getServiceFromSvcNo = (svcNo: string) => {
		if (svcNo?.startsWith("NA/")) return "Nigerian Army";
		if (svcNo?.startsWith("NN/")) return "Nigerian Navy";
		if (svcNo?.startsWith("AF/")) return "Nigerian Air Force";
		return "Unknown";
	};

	const armyItems = queueItems.filter(
		(item) => getServiceFromSvcNo(item.svc_no) === "Nigerian Army"
	);
	const navyItems = queueItems.filter(
		(item) => getServiceFromSvcNo(item.svc_no) === "Nigerian Navy"
	);
	const airForceItems = queueItems.filter(
		(item) => getServiceFromSvcNo(item.svc_no) === "Nigerian Air Force"
	);

	const armyOfficers = armyItems.filter(
		(item) => item.category === "Officer"
	).length;
	const armyNCOs = armyItems.filter((item) => item.category === "NCOs").length;
	const navyOfficers = navyItems.filter(
		(item) => item.category === "Officer"
	).length;
	const navyNCOs = navyItems.filter((item) => item.category === "NCOs").length;
	const airForceOfficers = airForceItems.filter(
		(item) => item.category === "Officer"
	).length;
	const airForceNCOs = airForceItems.filter(
		(item) => item.category === "NCOs"
	).length;

	return (
		<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Total Queue</CardTitle>
					<Clock className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalCount}</div>
					<p className='text-xs text-muted-foreground'>
						Officers: {officerCount} | NCOs: {ncoCount}
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
						Officers: {armyOfficers} | NCOs: {armyNCOs}
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
						Officers: {navyOfficers} | NCOs: {navyNCOs}
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
						Officers: {airForceOfficers} | NCOs: {airForceNCOs}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
