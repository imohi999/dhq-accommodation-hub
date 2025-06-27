import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/spinner";
import { Clock, ClipboardCheck, FileText } from "lucide-react";
import useSWR from "swr";
import { InspectionModal } from "./InspectionModal";
import { ClearanceLetter } from "./ClearanceLetter";
import { AllocationFilters } from "./AllocationFilters";
import { useAllocationFilters } from "@/hooks/useAllocationFilters";

interface PersonnelData {
	rank: string;
	phone: string;
	category: string;
	fullName: string;
	svcNo?: string;
	serviceNumber?: string;
}
interface ClearanceInspection {
	id: string;
	past_allocation_id: string;
	inspector_svc_no: string;
	inspector_name: string;
	inspector_rank: string;
	inspector_category: string;
	inspector_appointment: string;
	inspection_date: string;
	remarks: string;
	inventory_status: Record<string, any>;
	created_at: string;
	updated_at: string;
}

interface InventoryItem {
	id: string;
	unit_id: string;
	quantity: number;
	item_description: string;
	item_location: string;
	item_status: "Functional" | "Non-Functional";
	remarks: string;
	created_at: string;
	updated_at: string;
}

interface UnitData {
	location: string;
	unitName: string;
	quarterName: string;
	accommodationType: string;
}

interface QueueData {
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
	phone: string | null;
	entryDateTime: string;
	createdAt: string;
	updatedAt: string;
	dependents: any | null;
	hasAllocationRequest: boolean;
}

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
	currentOccupantId: string;
	currentOccupantName: string;
	currentOccupantRank: string;
	currentOccupantServiceNumber: string;
	occupancyStartDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface PastAllocation {
	id: string;
	personnelId: string;
	queueId: string;
	unitId: string;
	letterId: string;
	personnelData: PersonnelData;
	unitData: UnitData;
	allocationStartDate: string;
	allocationEndDate: string;
	durationDays: number;
	reasonForLeaving: string;
	deallocationDate: string | null;
	createdAt: string;
	updatedAt: string;
	queue: QueueData;
	unit: Unit;
	clearance_inspections: ClearanceInspection[];
	inventory: InventoryItem[];
}

const fetcher = async () => {
	// First fetch past allocations
	const response = await fetch("/api/allocations/past");
	if (!response.ok) {
		throw new Error("Failed to fetch past allocations");
	}
	const pastAllocations = await response.json();

	// Then fetch clearance data which includes inspection details
	const clearanceResponse = await fetch("/api/allocations/clearance");
	if (clearanceResponse.ok) {
		const clearanceData = await clearanceResponse.json();

		// Merge clearance data with past allocations
		const mergedData = pastAllocations.map((allocation: any) => {
			const clearanceRecord = clearanceData.find(
				(c: any) => c.id === allocation.id
			);
			if (clearanceRecord) {
				return {
					...allocation,
					clearance_inspections: clearanceRecord.clearance_inspections || [],
					inventory: clearanceRecord.inventory || [],
				};
			}
			return allocation;
		});

		return mergedData;
	}

	return pastAllocations;
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

const calculateDurationFromDates = (
	startDate: string,
	endDate: string | null | undefined
): string => {
	if (!startDate || !endDate) return "N/A";

	const start = new Date(startDate);
	const end = new Date(endDate);

	// Calculate the difference in milliseconds
	const diffMs = end.getTime() - start.getTime();

	// If negative duration, return N/A
	if (diffMs < 0) return "N/A";

	// Convert to days
	const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Calculate years, months, and days
	const years = Math.floor(totalDays / 365);
	const remainingDaysAfterYears = totalDays % 365;
	const months = Math.floor(remainingDaysAfterYears / 30);
	const days = remainingDaysAfterYears % 30;

	const parts = [];
	if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
	if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
	if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

	// If no parts (duration is 0), return "0 days"
	return parts.length > 0 ? parts.join(", ") : "0 days";
};

export const PastAllocationsView = () => {
	const [selectedAllocation, setSelectedAllocation] =
		useState<PastAllocation | null>(null);
	const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
	const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

	const {
		data: pastAllocations = [],
		error,
		isLoading,
		mutate,
	} = useSWR<PastAllocation[]>("/api/allocations/past", fetcher);

	console.log({ pastAllocations: JSON.stringify(pastAllocations) });

	const handleInspectionComplete = () => {
		mutate();
		setIsInspectionModalOpen(false);
	};

	// Add inspection status state
	const [inspectionStatusFilter, setInspectionStatusFilter] = useState("all");

	// Use allocation filters
	const {
		searchTerm,
		setSearchTerm,
		categoryFilter,
		setCategoryFilter,
		armOfServiceFilter,
		setArmOfServiceFilter,
		quarterFilter,
		setQuarterFilter,
		unitTypeFilter,
		setUnitTypeFilter,
		filteredItems: baseFilteredItems,
		availableQuarters,
		availableUnitTypes,
	} = useAllocationFilters(
		pastAllocations,
		(item) => [
			item.personnelData?.fullName || "",
			item.personnelData?.svcNo || "",
			item.personnelData?.rank || "",
			item.unitData?.quarterName || "",
			item.unitData?.unitName || "",
			item.unit?.flatHouseRoomName || "",
			item.letterId || "",
		],
		(item) => item.queue?.armOfService || "Unknown",
		(item) => item.personnelData?.category || "",
		(item) => item.unitData?.quarterName || "",
		(item) => item.unitData?.accommodationType || ""
	);

	// Apply inspection status filter
	const filteredItems = baseFilteredItems.filter((item) => {
		if (inspectionStatusFilter === "all") return true;
		const hasInspection =
			item.clearance_inspections && item.clearance_inspections.length > 0;
		if (inspectionStatusFilter === "inspected") return hasInspection;
		if (inspectionStatusFilter === "not-inspected") return !hasInspection;
		return true;
	});

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

	// Calculate summary statistics based on filtered items
	const totalPastAllocations = filteredItems.length;
	const officerAllocations = filteredItems.filter(
		(allocation) => allocation.personnelData?.category === "Officer"
	).length;
	const ncoAllocations = filteredItems.filter(
		(allocation) => allocation.personnelData?.category === "NCOs"
	).length;

	// Calculate by service
	const armyAllocations = filteredItems.filter(
		(allocation) => allocation.queue?.armOfService === "Nigerian Army"
	);
	const navyAllocations = filteredItems.filter(
		(allocation) => allocation.queue?.armOfService === "Nigerian Navy"
	);
	const airForceAllocations = filteredItems.filter(
		(allocation) => allocation.queue?.armOfService === "Nigerian Air Force"
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
			{/* Filters */}
			<AllocationFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				categoryFilter={categoryFilter}
				onCategoryChange={setCategoryFilter}
				armOfServiceFilter={armOfServiceFilter}
				onArmOfServiceChange={setArmOfServiceFilter}
				quarterFilter={quarterFilter}
				onQuarterChange={setQuarterFilter}
				unitTypeFilter={unitTypeFilter}
				onUnitTypeChange={setUnitTypeFilter}
				inspectionStatusFilter={inspectionStatusFilter}
				onInspectionStatusChange={setInspectionStatusFilter}
				availableQuarters={availableQuarters}
				availableUnitTypes={availableUnitTypes}
			/>

			{/* Show count info */}
			<div className='flex justify-between items-center'>
				<p className='text-sm text-muted-foreground'>
					Showing {filteredItems.length} of {pastAllocations.length} past
					allocations
				</p>
			</div>

			{filteredItems.length === 0 ? (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-muted-foreground'>
							{searchTerm ||
							categoryFilter !== "all" ||
							armOfServiceFilter !== "all" ||
							quarterFilter !== "all" ||
							unitTypeFilter !== "all" ||
							inspectionStatusFilter !== "all"
								? "No past allocations match your filters"
								: "No past allocations found"}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{filteredItems.map((allocation) => (
						<Card
							key={allocation.id}
							className='hover:shadow-md transition-shadow'>
							<CardContent className='p-4'>
								{/* Header Section - Compact */}
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-700'>
											<Clock className='h-4 w-4' />
										</div>
										<div>
											<h3 className='text-base font-semibold leading-tight'>
												{allocation.personnelData?.rank}{" "}
												{allocation.personnelData?.fullName ||
													"Unknown Personnel"}
											</h3>
											<p className='text-xs text-muted-foreground'>
												{allocation.personnelData?.svcNo || "N/A"} •{" "}
												{allocation.queue?.armOfService || "Unknown"}
											</p>
										</div>
									</div>

									{/* Action Buttons - Compact */}
									<div className='flex items-center gap-2'>
										<Button
											size='sm'
											variant='outline'
											onClick={() => {
												setSelectedAllocation(allocation);
												setIsInspectionModalOpen(true);
											}}
											className='text-xs px-3 py-1 h-auto'>
											<ClipboardCheck className='h-3 w-3 mr-1' />
											{allocation.clearance_inspections &&
											allocation.clearance_inspections.length > 0
												? "View Inspection"
												: "Log Inspection"}
										</Button>
										{allocation.clearance_inspections &&
											allocation.clearance_inspections.length > 0 && (
												<Button
													size='sm'
													onClick={() => {
														setSelectedAllocation(allocation);
														setIsLetterModalOpen(true);
													}}
													className='text-xs px-3 py-1 h-auto'>
													<FileText className='h-3 w-3 mr-1' />
													Clearance Letter
												</Button>
											)}
									</div>
								</div>

								{/* Content Section - Optimized Grid */}
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3'>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Category
										</p>
										<p className='font-medium'>
											{allocation.personnelData?.category}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Duration
										</p>
										<p className='font-medium'>
											{calculateDurationFromDates(
												allocation.allocationStartDate,
												allocation.allocationEndDate
											)}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Start Date
										</p>
										<p className='font-medium'>
											{new Date(
												allocation.allocationStartDate
											).toLocaleDateString()}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											End Date
										</p>
										<p className='font-medium'>
											{allocation?.allocationEndDate
												? new Date(
														allocation.allocationEndDate
												  ).toLocaleDateString()
												: "N/A"}
										</p>
									</div>
								</div>

								{/* Additional Info and Actions */}
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-xs text-muted-foreground'>
										<span>
											Quarter: {allocation.unitData?.quarterName || "N/A"}
										</span>
										<span>•</span>
										<span>
											Unit:
											{allocation.unit?.unitName || ""}
										</span>
										<span>•</span>
										{allocation.reasonForLeaving && (
											<>
												<span>Reason: {allocation.reasonForLeaving}</span>
											</>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Modals */}
			{selectedAllocation && (
				<>
					<InspectionModal
						isOpen={isInspectionModalOpen}
						onClose={() => setIsInspectionModalOpen(false)}
						allocation={selectedAllocation}
						onComplete={handleInspectionComplete}
					/>

					<ClearanceLetter
						isOpen={isLetterModalOpen}
						onClose={() => setIsLetterModalOpen(false)}
						allocation={selectedAllocation}
					/>
				</>
			)}
		</div>
	);
};
