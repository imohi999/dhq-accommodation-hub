"use client";

import React, { useState } from "react";
import { useQueueData, useDeleteQueueEntry } from "@/hooks/useQueueDataNext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { QueueForm } from "@/components/QueueForm";
import { QueueSummaryCards } from "@/components/queue/QueueSummaryCards";
import { QueueFilters } from "@/components/queue/QueueFilters";
import { QueueCardView } from "@/components/queue/QueueCardView";
import { QueueViewToggle } from "@/components/queue/QueueViewToggle";
import { QueueTableView } from "@/components/queue/QueueTableView";
import { AllocationModal } from "@/components/allocation/AllocationModal";
import { useQueueFilters } from "@/hooks/useQueueFilters";
import { QueueItem } from "@/types/queue";

export default function QueuePage() {
	// State management
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
	const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
	const [allocationModal, setAllocationModal] = useState<{
		isOpen: boolean;
		personnel: QueueItem | null;
	}>({
		isOpen: false,
		personnel: null,
	});
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	// Fetch units data
	const { data: units = [], isLoading: unitsLoading } = useQuery({
		queryKey: ['units'],
		queryFn: async () => {
			const response = await fetch('/api/units');
			if (!response.ok) throw new Error('Failed to fetch units');
			return response.json();
		}
	});

	// Use auto-refresh for queue data
	const { data: queueItems = [], isLoading: loading, refetch: fetchQueueItems } = useQueueData({}, {
		refetchInterval: 30000, // Auto-refresh every 30 seconds
	});

	// Transform API data to match expected format if needed
	const transformedQueueItems = React.useMemo(() => 
		queueItems.map((item) => ({
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
			entry_date_time: item.entryDateTime
		})), [queueItems]);

	// Use queue filters hook
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
		filteredItems
	} = useQueueFilters(transformedQueueItems);

	const deleteEntry = useDeleteQueueEntry();

	// Handler functions
	const handleAdd = () => {
		setEditingItem(null);
		setShowForm(true);
	};

	const handleEdit = (item: QueueItem) => {
		setEditingItem(item);
		setShowForm(true);
	};

	const handleAllocate = (item: QueueItem) => {
		setAllocationModal({
			isOpen: true,
			personnel: item,
		});
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this queue item?")) {
			return;
		}

		setDeletingIds(prev => new Set(prev.add(id)));

		try {
			await deleteEntry.mutateAsync(id);
			toast.success("Queue item deleted successfully");
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setDeletingIds(prev => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	const handleFormSubmit = () => {
		setShowForm(false);
		setEditingItem(null);
		fetchQueueItems();
	};

	if (loading || unitsLoading) {
		return <LoadingState isLoading={true} children={null} />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-[#1B365D] dark:text-foreground">Queue List</h1>
					<p className="text-muted-foreground">
						Manage the waiting list for incoming personnel
					</p>
				</div>
				<Button onClick={handleAdd} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					Add to Queue
				</Button>
			</div>

			<QueueSummaryCards queueItems={filteredItems} />

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
			/>

			<div className="flex justify-between items-center">
				<QueueViewToggle viewMode={viewMode} onViewChange={setViewMode} />
				<p className="text-sm text-muted-foreground">
					Showing {filteredItems.length} of {transformedQueueItems.length} personnel
				</p>
			</div>

			{viewMode === 'card' ? (
				<QueueCardView 
					queueItems={filteredItems}
					onEdit={handleEdit}
					onAllocate={handleAllocate}
				/>
			) : (
				<QueueTableView
					queueItems={filteredItems}
					onEdit={handleEdit}
					onDelete={handleDelete}
					deletingIds={deletingIds}
				/>
			)}

			<AllocationModal
				isOpen={allocationModal.isOpen}
				onClose={() => {
					setAllocationModal({ isOpen: false, personnel: null });
					// Refresh queue data after closing allocation modal
					fetchQueueItems();
				}}
				personnel={allocationModal.personnel}
			/>
		</div>
	);
}
