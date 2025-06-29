"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FileText, ClipboardCheck, Trash2 } from "lucide-react";
import { useClearanceData } from "@/hooks/useClearanceData";
import { LoadingState } from "@/components/ui/spinner";
import { InspectionModal } from "./InspectionModal";
import { ClearanceLetter } from "./ClearanceLetter";
import { AllocationFilters } from "./AllocationFilters";
import { useAllocationFilters } from "@/hooks/useAllocationFilters";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function ClearanceView() {
	const { user } = useAuth();
	const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
	const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
	const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
	const [inspectionStatusFilter, setInspectionStatusFilter] = useState("all");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [inspectionToDelete, setInspectionToDelete] = useState<any>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedInspectionIds, setSelectedInspectionIds] = useState<string[]>([]);
	const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
	const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

	const handleDelete = async () => {
		if (!inspectionToDelete) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/allocations/clearance/${inspectionToDelete.id}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || 'Failed to delete clearance inspection');
			} else {
				toast.success('Clearance inspection deleted successfully');
				setIsDeleteModalOpen(false);
				setInspectionToDelete(null);
				mutate(); // Refresh the list
			}
		} catch (error) {
			console.error('Error deleting clearance inspection:', error);
			toast.error('An unexpected error occurred');
		} finally {
			setIsDeleting(false);
		}
	};

	// Check if user can delete clearance inspections
	const canDelete = user?.profile?.role === 'superadmin' || 
		user?.profile?.role === 'admin' ||
		user?.profile?.pagePermissions?.some(p => 
			p.pageKey === 'allocations.clearance' && p.allowedActions?.includes('delete')
		);

	const handleBulkDelete = async () => {
		if (selectedInspectionIds.length === 0) return;

		setIsBulkDeleting(true);
		try {
			const response = await fetch('/api/allocations/clearance/bulk-delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ids: selectedInspectionIds }),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || 'Failed to delete clearance inspections');
			} else {
				toast.success(data.message || 'Clearance inspections deleted successfully');
				setIsBulkDeleteModalOpen(false);
				setSelectedInspectionIds([]);
				mutate(); // Refresh the list
			}
		} catch (error) {
			console.error('Error deleting clearance inspections:', error);
			toast.error('An unexpected error occurred');
		} finally {
			setIsBulkDeleting(false);
		}
	};

	const toggleSelectAll = () => {
		// Get all clearance inspection IDs from filtered data
		const allInspectionIds = filteredData
			.filter(item => item.clearance_inspections && item.clearance_inspections.length > 0)
			.flatMap(item => item.clearance_inspections.map((insp: any) => insp.id));
		
		if (selectedInspectionIds.length === allInspectionIds.length && allInspectionIds.length > 0) {
			setSelectedInspectionIds([]);
		} else {
			setSelectedInspectionIds(allInspectionIds);
		}
	};

	const toggleSelectItem = (inspectionId: string) => {
		setSelectedInspectionIds(prev => 
			prev.includes(inspectionId) 
				? prev.filter(id => id !== inspectionId)
				: [...prev, inspectionId]
		);
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
					{/* Show count info and bulk actions */}
					<div className='flex justify-between items-center mb-4'>
						<p className='text-sm text-muted-foreground'>
							Showing {filteredData.length} of {data?.length || 0} allocations
						</p>
						{canDelete && selectedInspectionIds.length > 0 && (
							<div className='flex items-center gap-2'>
								<span className='text-sm text-muted-foreground'>
									{selectedInspectionIds.length} inspection{selectedInspectionIds.length > 1 ? 's' : ''} selected
								</span>
								<Button
									size='sm'
									variant='destructive'
									onClick={() => setIsBulkDeleteModalOpen(true)}>
									<Trash2 className='h-4 w-4 mr-1' />
									Delete Selected Inspections
								</Button>
							</div>
						)}
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
										{canDelete && (
											<TableHead className='w-12'>
												<Checkbox
													checked={(() => {
														const allInspectionIds = filteredData
															.filter(item => item.clearance_inspections && item.clearance_inspections.length > 0)
															.flatMap(item => item.clearance_inspections.map((insp: any) => insp.id));
														return selectedInspectionIds.length === allInspectionIds.length && allInspectionIds.length > 0;
													})()}
													onCheckedChange={toggleSelectAll}
												/>
											</TableHead>
										)}
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
												{canDelete && (
													<TableCell>
														{hasInspection && latestInspection ? (
															<Checkbox
																checked={selectedInspectionIds.includes(latestInspection.id)}
																onCheckedChange={() => toggleSelectItem(latestInspection.id)}
															/>
														) : (
															<span className="text-muted-foreground text-xs">No inspection</span>
														)}
													</TableCell>
												)}
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
														{canDelete && hasInspection && latestInspection && (
															<Button
																size='sm'
																variant='outline'
																onClick={() => {
																	setInspectionToDelete({
																		...latestInspection,
																		allocation: allocation
																	});
																	setIsDeleteModalOpen(true);
																}}
																className='text-destructive hover:text-destructive'>
																<Trash2 className='h-4 w-4' />
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

			{/* Delete Confirmation Modal */}
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Clearance Inspection</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this clearance inspection? This action
							cannot be undone. The past allocation record will remain intact.
						</DialogDescription>
					</DialogHeader>
					{inspectionToDelete && (
						<div className='space-y-2 text-sm'>
							<p>
								<strong>Inspector:</strong>{" "}
								{inspectionToDelete.inspector_rank}{" "}
								{inspectionToDelete.inspector_name}
							</p>
							<p>
								<strong>Inspection Date:</strong>{" "}
								{formatSafeDate(inspectionToDelete.inspection_date)}
							</p>
							{inspectionToDelete.allocation && (
								<>
									<p>
										<strong>Personnel:</strong>{" "}
										{inspectionToDelete.allocation.personnelData?.rank}{" "}
										{inspectionToDelete.allocation.personnelData?.fullName}
									</p>
									<p>
										<strong>Service No:</strong>{" "}
										{inspectionToDelete.allocation.personnelData?.serviceNumber || 
										 inspectionToDelete.allocation.personnelData?.svcNo || "N/A"}
									</p>
									<p>
										<strong>Unit:</strong>{" "}
										{inspectionToDelete.allocation.unitData?.quarterName} -{" "}
										{inspectionToDelete.allocation.unitData?.unitName}
									</p>
								</>
							)}
							{inspectionToDelete.remarks && (
								<p>
									<strong>Remarks:</strong> {inspectionToDelete.remarks}
								</p>
							)}
						</div>
					)}
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setIsDeleteModalOpen(false);
								setInspectionToDelete(null);
							}}>
							Cancel
						</Button>
						<LoadingButton
							variant='destructive'
							onClick={handleDelete}
							loading={isDeleting}>
							Delete
						</LoadingButton>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Bulk Delete Confirmation Modal */}
			<Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Multiple Clearance Inspections</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {selectedInspectionIds.length} clearance inspection(s)? 
							This action cannot be undone. The past allocation records will remain intact.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-2 text-sm'>
						<p className='font-medium'>
							You are about to delete {selectedInspectionIds.length} clearance inspection(s).
						</p>
						<p className='text-muted-foreground'>
							This will permanently remove all selected clearance inspections from the database.
							The past allocation records will not be affected.
						</p>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setIsBulkDeleteModalOpen(false);
							}}>
							Cancel
						</Button>
						<LoadingButton
							variant='destructive'
							onClick={handleBulkDelete}
							loading={isBulkDeleting}>
							Delete {selectedInspectionIds.length} Inspection(s)
						</LoadingButton>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
