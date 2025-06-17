"use client";

import { PastAllocationsView } from "@/components/allocation/PastAllocationsView";

export default function PastAllocations() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
					Past Allocations
				</h1>
				<p className='text-muted-foreground'>
					View historical accommodation allocation records
				</p>
			</div>
			<PastAllocationsView />
		</div>
	);
}
