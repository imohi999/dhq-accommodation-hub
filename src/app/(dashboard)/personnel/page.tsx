"use client";

import React, { useState, useEffect } from "react";
import { usePersonnelData, useDeletePersonnel } from "@/hooks/usePersonnelData";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { QueueForm } from "@/components/QueueForm";
import { PersonnelSummaryCards } from "@/components/personnel/PersonnelSummaryCards";
import { QueueFilters } from "@/components/queue/QueueFilters";
import { QueueCardView } from "@/components/queue/QueueCardView";
import { useQueueFilters } from "@/hooks/useQueueFilters";
import { QueueItem } from "@/types/queue";
import { usePermissions } from "@/hooks/usePermissions";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function PersonnelPage() {
	// Permission checks
	const { canAddQueue, canEdit, canDelete } = usePermissions();

	// State management
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const [isBulkDeleting, setIsBulkDeleting] = useState(false);
	// Delete dialog state
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);

	// Fetch units data
	const { data: units = [], isLoading: unitsLoading, refetch: refetchUnits } = useQuery({
		queryKey: ["units"],
		queryFn: async () => {
			const response = await fetch("/api/units");
			if (!response.ok) throw new Error("Failed to fetch units");
			return response.json();
		},
	});

	// Use auto-refresh for personnel data
	const {
		data: personnelItems = [],
		isLoading: loading,
		refetch: fetchPersonnelItems,
	} = usePersonnelData(
		{},
		{
			refetchInterval: 30000, // Auto-refresh every 30 seconds
			refetchIntervalInBackground: true,
		}
	);

	// Transform API data to match expected format if needed
	const transformedPersonnelItems = React.useMemo(
		() =>
			personnelItems.map((item) => ({
				id: item.id,
				sequence: item.sequence,
				full_name: item.fullName,
				svc_no: item.svcNo,
				gender: item.gender,
				arm_of_service: item.armOfService,
				category: item.category,
				rank: item.rank,
				marital_status: item.maritalStatus,
				no_of_adult_dependents: item.noOfAdultDependents,
				no_of_child_dependents: item.noOfChildDependents,
				dependents: item.dependents || [],
				current_unit: item.currentUnit ?? null,
				appointment: item.appointment ?? null,
				date_tos: item.dateTos ?? null,
				date_sos: item.dateSos ?? null,
				phone: item.phone ?? null,
				entry_date_time: item.entryDateTime,
			})),
		[personnelItems]
	);

	// Use personnel filters hook (same as queue filters)
	const {
		searchTerm,
		setSearchTerm,
		genderFilter,
		setGenderFilter,
		maritalStatusFilter,
		setMaritalStatusFilter,
		categoryFilter,
		setCategoryFilter,
		unitFilter,
		setUnitFilter,
		armOfServiceFilter,
		setArmOfServiceFilter,
		dependentsFilter,
		setDependentsFilter,
		filteredItems,
	} = useQueueFilters(transformedPersonnelItems);

	const deleteEntry = useDeletePersonnel();

	// Refresh personnel data when page gains focus
	useEffect(() => {
		const handleFocus = () => {
			fetchPersonnelItems();
		};

		window.addEventListener("focus", handleFocus);

		// Also refresh when navigating to this page
		fetchPersonnelItems();

		return () => {
			window.removeEventListener("focus", handleFocus);
		};
	}, [fetchPersonnelItems]);

	// Handler functions
	const handleAdd = () => {
		setEditingItem(null);
		setShowForm(true);
	};

	const handleEdit = (item: QueueItem) => {
		setEditingItem(item);
		setShowForm(true);
		// Scroll to top after form is shown
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: "smooth" });
			const mainElement = document.querySelector("main");
			if (mainElement) {
				mainElement.scrollTo({ top: 0, behavior: "smooth" });
			}
			const sidebarInset = document.querySelector(".flex-1.overflow-y-auto");
			if (sidebarInset) {
				sidebarInset.scrollTo({ top: 0, behavior: "smooth" });
			}
			document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
			document.body.scrollTo({ top: 0, behavior: "smooth" });
		}, 100);
	};

	const handleDelete = (id: string) => {
		setItemToDelete(id);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!itemToDelete) return;

		setDeletingIds((prev) => new Set(prev.add(itemToDelete)));
		setShowDeleteDialog(false);

		try {
			await deleteEntry.mutateAsync(itemToDelete);
			toast.success("Personnel record deleted successfully");
			// Remove from selected if it was selected
			setSelectedIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(itemToDelete);
				return newSet;
			});
			fetchPersonnelItems();
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred while deleting personnel record");
		} finally {
			setDeletingIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(itemToDelete);
				return newSet;
			});
			setItemToDelete(null);
		}
	};

	const handleBulkDelete = () => {
		if (selectedIds.size === 0) {
			toast.error("Please select personnel records to delete");
			return;
		}
		setShowBulkDeleteDialog(true);
	};

	const confirmBulkDelete = async () => {
		setIsBulkDeleting(true);
		setShowBulkDeleteDialog(false);

		try {
			// Delete all selected items in parallel
			const deletePromises = Array.from(selectedIds).map(id => 
				deleteEntry.mutateAsync(id)
			);
			
			await Promise.all(deletePromises);
			
			toast.success(`Successfully deleted ${selectedIds.size} personnel record(s)`);
			setSelectedIds(new Set());
			fetchPersonnelItems();
		} catch (error) {
			console.error("Error:", error);
			toast.error("An error occurred while deleting personnel records");
		} finally {
			setIsBulkDeleting(false);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(new Set(filteredItems.map(item => item.id)));
		} else {
			setSelectedIds(new Set());
		}
	};

	const handleSelectItem = (id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (checked) {
				newSet.add(id);
			} else {
				newSet.delete(id);
			}
			return newSet;
		});
	};


	const handleFormSubmit = () => {
		setShowForm(false);
		setEditingItem(null);
		fetchPersonnelItems();
	};

	if (loading || unitsLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
						Personnel Management
					</h1>
					<p className='text-muted-foreground'>
						Manage all personnel records and their information
					</p>
				</div>
				<div className="flex items-center gap-2">
					{canDelete('personnel.manage') && selectedIds.size > 0 && (
						<Button 
							variant="destructive" 
							onClick={handleBulkDelete}
							disabled={isBulkDeleting}
							className="flex items-center gap-2"
						>
							<Trash2 className='h-4 w-4' />
							Delete Selected ({selectedIds.size})
						</Button>
					)}
					{canAddQueue() && (
						<Button onClick={handleAdd} className='flex items-center gap-2'>
							<Plus className='h-4 w-4' />
							Add Personnel
						</Button>
					)}
				</div>
			</div>

			<PersonnelSummaryCards queueItems={filteredItems} />

			{showForm && (
				<QueueForm
					item={editingItem}
					onSubmit={handleFormSubmit}
					onCancel={() => {
						setShowForm(false);
						setEditingItem(null);
					}}
				/>
			)}

			<QueueFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				genderFilter={genderFilter}
				onGenderChange={setGenderFilter}
				maritalStatusFilter={maritalStatusFilter}
				onMaritalStatusChange={setMaritalStatusFilter}
				categoryFilter={categoryFilter}
				onCategoryChange={setCategoryFilter}
				unitFilter={unitFilter}
				onUnitChange={setUnitFilter}
				armOfServiceFilter={armOfServiceFilter}
				onArmOfServiceChange={setArmOfServiceFilter}
				dependentsFilter={dependentsFilter}
				onDependentsChange={setDependentsFilter}
				units={units}
				onUnitsRefresh={refetchUnits}
			/>

			<div className='flex justify-between items-center'>
				<div className="flex items-center gap-4">
					<p className='text-lg font-medium'>Personnel Records</p>
					{canDelete('personnel.manage') && filteredItems.length > 0 && (
						<div className="flex items-center gap-2">
							<Checkbox
								id="select-all"
								checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
								ref={(el) => {
									if (el) {
										const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
										if (checkbox) {
											const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < filteredItems.length;
											checkbox.indeterminate = isPartiallySelected;
										}
									}
								}}
								onCheckedChange={handleSelectAll}
							/>
							<label htmlFor="select-all" className="text-sm font-medium">
								Select All
							</label>
						</div>
					)}
				</div>
				<p className='text-sm text-muted-foreground'>
					Showing {filteredItems.length} of {transformedPersonnelItems.length}{" "}
					personnel
					{selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
				</p>
			</div>

			<QueueCardView
				queueItems={filteredItems}
				onEdit={handleEdit}
				onAllocate={() => {}} // Empty function since allocation is disabled
				canEdit={canEdit('personnel.manage')}
				canAllocate={false} // No allocation in personnel page
				onDelete={handleDelete}
				canDelete={canDelete('personnel.manage')}
				selectedIds={selectedIds}
				onSelectItem={handleSelectItem}
				showSelection={canDelete('personnel.manage')}
				deletingIds={deletingIds}
			/>

			{/* Single Delete Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Confirm Deletion
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this personnel record? This action cannot be undone and will permanently remove all related data including:
							<ul className="list-disc list-inside mt-2 space-y-1">
								<li>Personnel information</li>
								<li>Allocation history</li>
								<li>Unit occupancy records</li>
							</ul>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowDeleteDialog(false);
								setItemToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deletingIds.has(itemToDelete || '')}
						>
							{deletingIds.has(itemToDelete || '') ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Deleting...
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Delete
								</div>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Bulk Delete Dialog */}
			<Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Confirm Bulk Deletion
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{selectedIds.size} personnel record(s)</strong>? This action cannot be undone and will permanently remove all related data for these records including:
							<ul className="list-disc list-inside mt-2 space-y-1">
								<li>Personnel information</li>
								<li>Allocation history</li>
								<li>Unit occupancy records</li>
							</ul>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowBulkDeleteDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmBulkDelete}
							disabled={isBulkDeleting}
						>
							{isBulkDeleting ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Deleting {selectedIds.size} records...
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Delete {selectedIds.size} Records
								</div>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}