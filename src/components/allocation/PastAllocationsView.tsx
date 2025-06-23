import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/spinner";
import { Clock, User, Home } from "lucide-react";
import useSWR from "swr";

interface PersonnelData {
	fullName?: string;
	full_name?: string;
	rank?: string;
	serviceNumber?: string;
	svc_no?: string;
	svcNo?: string;
	category?: string;
}

interface UnitData {
	quarterName?: string;
	quarter_name?: string;
	unitName?: string;
	flat_house_room_name?: string;
	flatHouseRoomName?: string;
	blockName?: string;
	block_name?: string;
}

interface PastAllocation {
	id: string;
	personnelData: PersonnelData;
	unitData: UnitData;
	allocationStartDate: string;
	allocationEndDate?: string | null;
	durationDays?: number | null;
	reasonForLeaving?: string | null;
	letterId: string;
	deallocationDate?: string | null;
	createdAt: string;
	updatedAt: string;
}

const fetcher = async () => {
	const response = await fetch("/api/allocations/past");
	if (!response.ok) {
		throw new Error("Failed to fetch past allocations");
	}
	const result = await response.json();
	return result;
};

const formatDuration = (days: number): string => {
	if (days === 0) return "0 days";

	const years = Math.floor(days / 365);
	const months = Math.floor((days % 365) / 30);
	const remainingDays = days % 30;

	const parts = [];
	if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
	if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
	if (remainingDays > 0)
		parts.push(`${remainingDays} day${remainingDays > 1 ? "s" : ""}`);

	return parts.join(", ");
};

export const PastAllocationsView = () => {
	const {
		data: pastAllocations = [],
		error,
		isLoading,
	} = useSWR<PastAllocation[]>("/api/allocations/past", fetcher);

	console.log({ pastAllocations: JSON.stringify(pastAllocations) });

	if (error) {
		return (
			<div className='flex justify-center p-8'>
				<Card className='w-full max-w-md'>
					<CardContent className='pt-6'>
						<p className='text-destructive text-center'>
							Error loading past allocations. Please try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	// Extract service from service number prefix
	const getServiceFromSvcNo = (svcNo: string) => {
		if (svcNo?.startsWith("NA/")) return "Nigerian Army";
		if (svcNo?.startsWith("NN/")) return "Nigerian Navy";
		if (svcNo?.startsWith("AF/")) return "Nigerian Air Force";
		return "Unknown";
	};

	// Calculate summary statistics
	const totalPastAllocations = pastAllocations.length;
	const officerAllocations = pastAllocations.filter(
		(allocation) => allocation.personnelData?.category === "Officer"
	).length;
	const ncoAllocations = pastAllocations.filter(
		(allocation) => allocation.personnelData?.category === "NCOs"
	).length;

	// Calculate by service
	const armyAllocations = pastAllocations.filter(
		(allocation) =>
			getServiceFromSvcNo(
				allocation.personnelData?.serviceNumber ||
					allocation.personnelData?.svc_no ||
					allocation.personnelData?.svcNo ||
					""
			) === "Nigerian Army"
	);
	const navyAllocations = pastAllocations.filter(
		(allocation) =>
			getServiceFromSvcNo(
				allocation.personnelData?.serviceNumber ||
					allocation.personnelData?.svc_no ||
					allocation.personnelData?.svcNo ||
					""
			) === "Nigerian Navy"
	);
	const airForceAllocations = pastAllocations.filter(
		(allocation) =>
			getServiceFromSvcNo(
				allocation.personnelData?.serviceNumber ||
					allocation.personnelData?.svc_no ||
					allocation.personnelData?.svcNo ||
					""
			) === "Nigerian Air Force"
	);

	const armyOfficers = armyAllocations.filter(
		(allocation) => allocation.personnelData?.category === "Officer"
	).length;
	const armyNCOs = armyAllocations.filter(
		(allocation) => allocation.personnelData?.category === "NCOs"
	).length;
	const navyOfficers = navyAllocations.filter(
		(allocation) => allocation.personnelData?.category === "Officer"
	).length;
	const navyNCOs = navyAllocations.filter(
		(allocation) => allocation.personnelData?.category === "NCOs"
	).length;
	const airForceOfficers = airForceAllocations.filter(
		(allocation) => allocation.personnelData?.category === "Officer"
	).length;
	const airForceNCOs = airForceAllocations.filter(
		(allocation) => allocation.personnelData?.category === "NCOs"
	).length;

	return (
		<div className='space-y-6'>
			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Past Allocations
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{totalPastAllocations}</div>
						<p className='text-xs text-muted-foreground'>
							Officers: {officerAllocations} | NCOs: {ncoAllocations}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Nigerian Army</CardTitle>
						<div className='w-4 h-4 rounded-full bg-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{armyAllocations.length}</div>
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
						<div className='text-2xl font-bold'>{navyAllocations.length}</div>
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
						<div className='text-2xl font-bold'>
							{airForceAllocations.length}
						</div>
						<p className='text-xs text-muted-foreground'>
							Officers: {airForceOfficers} | NCOs: {airForceNCOs}
						</p>
					</CardContent>
				</Card>
			</div>

			{pastAllocations.length === 0 ? (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-muted-foreground'>No past allocations found</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{pastAllocations.map((allocation) => (
						<Card
							key={allocation.id}
							className='hover:shadow-md transition-shadow'>
							<CardContent className='p-6'>
								<div className='space-y-3'>
									<div className='flex justify-between items-start'>
										<div>
											<h3 className='text-lg font-semibold'>
												{allocation.personnelData?.rank}{" "}
												{allocation.personnelData?.fullName ||
													allocation.personnelData?.full_name ||
													"Unknown Personnel"}
											</h3>
											<p className='text-sm text-muted-foreground'>
												Svc No:{" "}
												{allocation.personnelData?.serviceNumber ||
													allocation.personnelData?.svc_no ||
													allocation.personnelData?.svcNo ||
													"N/A"}
											</p>
											<p className='text-sm text-muted-foreground'>
												Letter: {allocation.letterId}
											</p>
										</div>
										<Badge variant='outline'>Completed</Badge>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
										<div>
											<p className='font-medium'>Allocation Period:</p>
											<p>
												{new Date(
													allocation.allocationStartDate
												).toLocaleDateString()}{" "}
												to{" "}
												{new Date(
													allocation?.allocationEndDate as string
												).toLocaleDateString()}
											</p>

											{allocation.durationDays && (
												<p className='text-muted-foreground'>
													Duration: {formatDuration(allocation.durationDays)}
												</p>
											)}
										</div>
										<div>
											<p className='font-medium'>Previous Unit:</p>
											<p>
												{allocation.unitData?.quarterName ||
													allocation.unitData?.quarter_name ||
													"N/A"}{" "}
												{allocation.unitData?.blockName ||
													allocation.unitData?.block_name ||
													""}{" "}
												{allocation.unitData?.flat_house_room_name ||
													allocation.unitData?.flatHouseRoomName ||
													allocation.unitData?.unitName ||
													""}
											</p>
											{allocation.reasonForLeaving && (
												<p className='text-muted-foreground mt-1'>
													<span className='font-medium'>
														Reason for leaving:
													</span>{" "}
													{allocation.reasonForLeaving}
												</p>
											)}
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
