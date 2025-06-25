"use client";

import { LoadingState } from "@/components/ui/spinner";
import { ActiveAllocationsView } from "@/components/allocation/ActiveAllocationsView";
import { useOccupiedUnits } from "@/services/occupiedUnitsApi";

export default function ActiveAllocationsPage() {
	const { data, error, isLoading } = useOccupiedUnits();

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	if (error) {
		return (
			<div className='flex justify-center p-8 text-red-500'>
				Error loading allocations: {error.message || "Unknown error"}
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
					Active Allocations
				</h1>
				<p className='text-muted-foreground'>
					Manage current accommodation allocations
				</p>
			</div>
			<ActiveAllocationsView occupiedUnits={data} />
		</div>
	);
}
