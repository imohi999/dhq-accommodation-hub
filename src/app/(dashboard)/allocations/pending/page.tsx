"use client";

import useSWR from "swr";
import { LoadingState } from "@/components/ui/spinner";
import { PendingApprovalView } from "@/components/allocation/PendingApprovalView";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interface for personnelData JSON field
interface PersonnelData {
	id: string;
	rank: string;
	phone: string;
	svcNo: string;
	gender: string;
	category: string;
	fullName: string;
	sequence: number;
	appointment: string;
	currentUnit: string;
	armOfService: string;
	entryDateTime: string;
	maritalStatus: string;
	noOfAdultDependents: number;
	noOfChildDependents: number;
}

// Interface for unitData JSON field
interface UnitData {
	id: string;
	status: string;
	category: string;
	location: string;
	blockName: string;
	noOfRooms: number;
	accommodationType: string;
	quarterName: string;
	flatHouseRoomName: string;
}

// Interface for the full personnel record
interface Personnel {
	id: string;
	sequence: number;
	fullName: string;
	svcNo: string;
	gender: string;
	armOfService: string;
	category: string;
	rank: string;
	maritalStatus: string;
	noOfAdultDependents: number;
	noOfChildDependents: number;
	currentUnit: string;
	appointment: string;
	dateTos: string | null;
	dateSos: string | null;
	phone: string;
	entryDateTime: string;
	createdAt: string;
	updatedAt: string;
}

// Interface for accommodation type
interface AccommodationType {
	id: string;
	name: string;
	description: string;
	createdAt: string;
}

// Interface for the full unit record
interface Unit {
	id: string;
	quarterName: string;
	location: string;
	category: string;
	accommodationTypeId: string;
	noOfRooms: number;
	status: string;
	typeOfOccupancy: string;
	bq: boolean;
	noOfRoomsInBq: number;
	blockName: string;
	flatHouseRoomName: string;
	unitName: string;
	blockImageUrl: string | null;
	currentOccupantId: string | null;
	currentOccupantName: string | null;
	currentOccupantRank: string | null;
	currentOccupantServiceNumber: string | null;
	occupancyStartDate: string | null;
	createdAt: string;
	updatedAt: string;
	accommodationType: AccommodationType;
}

// Main allocation request interface from API
export interface APIAllocationRequest {
	id: string;
	personnelId: string;
	unitId: string;
	letterId: string;
	personnelData: PersonnelData;
	unitData: UnitData;
	allocationDate: string;
	status: string;
	approvedBy: string | null;
	approvedAt: string | null;
	refusalReason: string | null;
	createdAt: string;
	updatedAt: string;
	unit: Unit;
}

export default function PendingApproval() {
	const {
		data = [],
		isLoading,
		mutate,
	} = useSWR<APIAllocationRequest[]>(
		"/api/allocations/requests?status=pending",
		fetcher,
		{
			refreshInterval: 30000,
			revalidateOnFocus: true,
			revalidateOnMount: true,
		}
	);

	if (isLoading) {
		return <LoadingState isLoading={true} children={null} />;
	}
	// Pass the data as is
	const pendingRequests = data;

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
					Pending Approval
				</h1>
				<p className='text-muted-foreground'>
					Review and approve accommodation allocation requests
				</p>
			</div>
			<PendingApprovalView requests={pendingRequests} mutate={mutate} />
		</div>
	);
}
