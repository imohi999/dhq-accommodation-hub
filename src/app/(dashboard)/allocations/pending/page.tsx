"use client";

import useSWR from "swr";
import { PendingApprovalView } from "@/components/allocation/PendingApprovalView";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interface for personnelData JSON field
interface PersonnelData {
	rank: string;
	phone: string;
	svcNo: string;
	category: string;
	fullName: string;
	currentUnit: string;
	maritalStatus: string;
}

// Interface for unitData JSON field
interface UnitData {
	location: string;
	unitName: string;
	noOfRooms: number;
	housingType: string;
	quarterName: string;
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

// Interface for housing type
interface HousingType {
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
	housingTypeId: string;
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
	housingType: HousingType;
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
	personnel: Personnel;
	unit: Unit;
}


export default function PendingApproval() {
	const { data = [], isLoading } = useSWR<APIAllocationRequest[]>(
		"/api/allocations/requests?status=pending",
		fetcher,
		{
			refreshInterval: 30000,
			revalidateOnFocus: true,
		}
	);

	if (isLoading) {
		return <div className='flex justify-center p-8'>Loading...</div>;
	}

	// Transform data to match component expectations
	const pendingRequests = data.map((item) => ({
		...item,
		// Add snake_case properties for component compatibility
		letter_id: item.letterId,
		created_at: item.createdAt,
		personnel_data: {
			full_name: item.personnelData.fullName,
			svc_no: item.personnelData.svcNo,
			current_unit: item.personnelData.currentUnit,
			appointment: item.personnel.appointment,
			category: item.personnelData.category,
			arm_of_service: item.personnel.armOfService,
		},
		unit_data: {
			quarterName: item.unitData.quarterName,
			blockName: item.unit.blockName,
			flat_house_room_name: item.unit.flatHouseRoomName,
		},
	}));

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-[#1B365D]'>Pending Approval</h1>
				<p className='text-muted-foreground'>
					Review and approve accommodation allocation requests
				</p>
			</div>
			<PendingApprovalView requests={pendingRequests} />
		</div>
	);
}
