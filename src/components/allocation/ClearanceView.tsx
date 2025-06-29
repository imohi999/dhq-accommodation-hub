"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FileText, ClipboardCheck } from "lucide-react";
import { useClearanceData } from "@/hooks/useClearanceData";
import { LoadingState } from "@/components/ui/spinner";
import { InspectionModal } from "./InspectionModal";
import { ClearanceLetter } from "./ClearanceLetter";
import { AllocationFilters } from "./AllocationFilters";
import { useAllocationFilters } from "@/hooks/useAllocationFilters";
import { format } from "date-fns";

export function ClearanceView() {
	const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
	const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
	const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
	const [inspectionStatusFilter, setInspectionStatusFilter] = useState("all");

	const { data, isLoading, mutate } = useClearanceData();

	// Safe date formatting function
	const formatSafeDate = (dateValue: any, defaultText = "N/A") => {
		if (!dateValue) return defaultText;
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return defaultText;
			return format(date, "dd MMM yyyy");
		} catch {
			return defaultText;
		}
	};

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
		data || [],
		(item) => [
			item.personnelData?.fullName || "",
			item.personnelData?.serviceNumber || "",
			item.personnelData?.rank || "",
			item.unitData?.quarterName || "",
			item.unitData?.unitName || "",
			item.unit?.flatHouseRoomName || "",
		],
		(item) => item.queue?.armOfService || "Unknown",
		(item) => item.personnelData?.category || "",
		(item) => item.unitData?.quarterName || "",
		(item) => item.unitData?.accommodationType || ""
	);

	// Apply inspection status filter
	const filteredData = baseFilteredItems.filter((item) => {
		if (inspectionStatusFilter === "all") return true;
		const hasInspection =
			item.clearance_inspections && item.clearance_inspections.length > 0;
		if (inspectionStatusFilter === "inspected") return hasInspection;
		if (inspectionStatusFilter === "not-inspected") return !hasInspection;
		return true;
	});

	console.log({ filteredData: JSON.stringify(filteredData) });

	const handleInspectionComplete = () => {
		mutate();
		setIsInspectionModalOpen(false);
	};

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='container mx-auto py-6 space-y-6'>
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

			<Card>
				<CardHeader>
					<CardTitle className='text-2xl font-bold'>
						Clearance Management
					</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Manage accommodation clearance inspections and generate clearance
						letters
					</p>
				</CardHeader>
				<CardContent>
					{/* Show count info */}
					<div className='flex justify-between items-center mb-4'>
						<p className='text-sm text-muted-foreground'>
							Showing {filteredData.length} of {data?.length || 0} allocations
						</p>
					</div>

					{filteredData.length === 0 ? (
						<div className='text-center py-12'>
							<p className='text-muted-foreground'>
								{searchTerm ||
								categoryFilter !== "all" ||
								armOfServiceFilter !== "all" ||
								quarterFilter !== "all" ||
								unitTypeFilter !== "all" ||
								inspectionStatusFilter !== "all"
									? "No allocations match your filters"
									: "No allocations found"}
							</p>
						</div>
					) : (
						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Service No</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Quarters</TableHead>
										<TableHead>Allocation Period</TableHead>
										<TableHead>Inspections</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredData?.map((allocation: any) => {
										const personnelData = allocation.personnelData;
										const unitData = allocation.unitData;
										const hasInspection =
											Array.isArray(allocation.clearance_inspections) &&
											allocation.clearance_inspections.length > 0;
										const latestInspection = hasInspection
											? allocation.clearance_inspections[
													allocation.clearance_inspections.length - 1
											  ]
											: null;

										return (
											<TableRow key={allocation.id}>
												<TableCell className='font-medium'>
													{personnelData?.serviceNumber || personnelData?.svcNo}
												</TableCell>
												<TableCell>
													<div>
														<p className='font-medium'>
															{personnelData?.fullName}
														</p>
														<p className='text-sm text-muted-foreground'>
															{personnelData?.rank} - {personnelData?.category}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<p className='font-medium'>{unitData?.unitName}</p>
														<p className='text-sm text-muted-foreground'>
															{unitData?.quarterName}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div className='text-sm'>
														<p>
															{formatSafeDate(allocation.allocationStartDate)} -
															{formatSafeDate(
																allocation.allocationEndDate,
																"Present"
															)}
														</p>
													</div>
												</TableCell>
												<TableCell>
													{hasInspection ? (
														<div className='space-y-1'>
															<Badge
																variant='outline'
																className='bg-green-50 text-green-700 border-green-200'>
																Inspected
															</Badge>
															<p className='text-xs text-muted-foreground'>
																{formatSafeDate(
																	latestInspection?.inspection_date
																)}
															</p>
															<p className='text-xs text-muted-foreground'>
																by {latestInspection?.inspector_name}
															</p>
														</div>
													) : (
														<Badge
															variant='outline'
															className='bg-orange-50 text-orange-700 border-orange-200'>
															Pending
														</Badge>
													)}
												</TableCell>
												<TableCell>
													<div className='flex gap-2'>
														<Button
															size='sm'
															variant='outline'
															onClick={() => {
																setSelectedAllocation(allocation);
																setIsInspectionModalOpen(true);
															}}>
															<ClipboardCheck className='h-4 w-4 mr-1' />
															{hasInspection ? "View" : "Inspect"}
														</Button>
														{hasInspection && (
															<Button
																size='sm'
																onClick={() => {
																	setSelectedAllocation(allocation);
																	setIsLetterModalOpen(true);
																}}>
																<FileText className='h-4 w-4 mr-1' />
																Clearance Letter
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

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
}
