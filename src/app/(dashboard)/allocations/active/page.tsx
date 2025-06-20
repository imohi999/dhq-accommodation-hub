"use client";

import useSWR from "swr";
import { LoadingState } from "@/components/ui/spinner";
import { ActiveAllocationsView } from "@/components/allocation/ActiveAllocationsView";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ActiveAllocationsPage() {
	const { data, error, mutate } = useSWR(
		"/api/dhq-living-units?status=Occupied",
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			refreshInterval: 30000, // Refresh every 30 seconds
		}
	);

	if (!data && !error) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	if (error) {
		return (
			<div className='flex justify-center p-8 text-red-500'>
				Error loading allocations
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
			<ActiveAllocationsView occupiedUnits={data || []} />
		</div>
	);
}
