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
		return <LoadingState isLoading={true} children={null} />;
	}

	return (
		<div className='space-y-6'>
			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Past Allocations
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{pastAllocations.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Average Duration
						</CardTitle>
						<User className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{pastAllocations.filter((a) => a.durationDays).length > 0
								? Math.round(
										pastAllocations
											.filter((a) => a.durationDays)
											.reduce((sum, a) => sum + (a.durationDays || 0), 0) /
											pastAllocations.filter((a) => a.durationDays).length
								  )
								: 0}{" "}
							days
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Completed This Year
						</CardTitle>
						<Home className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{
								pastAllocations.filter(
									(a) =>
										new Date(
											a.allocationEndDate || a.allocationStartDate
										).getFullYear() === new Date().getFullYear()
								).length
							}
						</div>
					</CardContent>
				</Card>
			</div>

			{pastAllocations.length === 0 ? (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-gray-500'>No past allocations found</p>
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
												{allocation.personnelData?.fullName ||
													allocation.personnelData?.full_name ||
													"Unknown Personnel"}
											</h3>
											<p className='text-sm text-muted-foreground'>
												{allocation.personnelData?.rank || "N/A"} • Svc No:{" "}
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
												).toLocaleDateString()}
											</p>
											{allocation.allocationEndDate && (
												<p>
													to{" "}
													{new Date(
														allocation.allocationEndDate
													).toLocaleDateString()}
												</p>
											)}
											{allocation.durationDays && (
												<p className='text-muted-foreground'>
													Duration: {allocation.durationDays} days
												</p>
											)}
										</div>
										<div>
											<p className='font-medium'>Previous Unit:</p>
											<p>
												{allocation.unitData?.quarterName || allocation.unitData?.quarter_name || "N/A"}{" "}
												{allocation.unitData?.blockName || allocation.unitData?.block_name || ""}{" "}
												{allocation.unitData?.flat_house_room_name || allocation.unitData?.flatHouseRoomName || allocation.unitData?.unitName || ""}
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
