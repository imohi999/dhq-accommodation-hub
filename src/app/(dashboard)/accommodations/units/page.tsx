"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { AccommodationSummaryCards } from "@/components/accommodation/AccommodationSummaryCards";
import { AccommodationFilters } from "@/components/accommodation/AccommodationFilters";
import { AccommodationViewToggle } from "@/components/accommodation/AccommodationViewToggle";
import { AccommodationCardView } from "@/components/accommodation/AccommodationCardView";
import { AccommodationTableView } from "@/components/accommodation/AccommodationTableView";
import { ImportModal } from "@/components/accommodation/ImportModal";
import { AccommodationFormModal } from "@/components/accommodation/AccommodationFormModal";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useAccommodationFilters } from "@/hooks/useAccommodationFilters";
import { useAccommodationSummary } from "@/hooks/useAccommodationSummary";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { usePermissions } from "@/hooks/usePermissions";
// Removed Supabase import - using API instead

export default function DHQLivingUnits() {
	// Permission checks
	const {
		canAddQuarters,
		canEdit,
		canDelete,
		canImport,
		canExportAccommodation,
		canViewHistory,
		canMaintenanceRequest,
		canInventory,
	} = usePermissions();

	const [viewMode, setViewMode] = useState<"card" | "compact" | "table">(
		"card"
	);
	const [showForm, setShowForm] = useState(false);
	const [showImportModal, setShowImportModal] = useState(false);
	const [editingUnit, setEditingUnit] =
		useState<DHQLivingUnitWithHousingType | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

	// Get filters and pagination from the hook
	const filters = useAccommodationFilters();
	const apiFilters = filters.getApiFilters();

	// Fetch data with server-side filtering
	const { units, housingTypes, refetch, pagination } =
		useAccommodationData(apiFilters);

	// Fetch summary data separately
	const { summary, loading: summaryLoading } = useAccommodationSummary();

	// Fetch filter options
	const { filterOptions, loading: filterOptionsLoading } = useFilterOptions();

	const handleAdd = () => {
		setEditingUnit(null);
		setShowForm(true);
	};

	const handleEdit = (unit: DHQLivingUnitWithHousingType) => {
		setEditingUnit(unit);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this accommodation units?")) {
			return;
		}

		setDeleteLoading(id);
		try {
			const response = await fetch(`/api/dhq-living-units/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				console.error("Error deleting unit:", error);
				toast.error(error.error || "Failed to delete accommodation units");
				return;
			}

			toast.success("Accommodation units deleted successfully");

			refetch();
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleImportComplete = () => {
		refetch();
		toast.success("Successfully imported accommodation units");
	};

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
						DHQ Accommodation
					</h1>
					<p className='text-muted-foreground'>
						Manage accommodation units for military personnel
					</p>
				</div>
				<div className='flex gap-2'>
					{canImport() && (
						<Button
							onClick={() => setShowImportModal(true)}
							variant='outline'
							className='flex items-center gap-2'>
							<Upload className='h-4 w-4' />
							Import
						</Button>
					)}
					{canAddQuarters() && (
						<Button onClick={handleAdd} className='flex items-center gap-2'>
							<Plus className='h-4 w-4' />
							Add Unit
						</Button>
					)}
				</div>
			</div>

			<AccommodationSummaryCards summary={summary} loading={summaryLoading} />

			<AccommodationFilters
				searchTerm={filters.searchTerm}
				onSearchChange={filters.setSearchTerm}
				quarterNameFilter={filters.quarterNameFilter}
				onQuarterNameChange={filters.setQuarterNameFilter}
				locationFilter={filters.locationFilter}
				onLocationChange={filters.setLocationFilter}
				categoryFilter={filters.categoryFilter}
				onCategoryChange={filters.setCategoryFilter}
				housingTypeFilter={filters.housingTypeFilter}
				onHousingTypeChange={filters.setHousingTypeFilter}
				statusFilter={filters.statusFilter}
				onStatusChange={filters.setStatusFilter}
				occupancyFilter={filters.occupancyFilter}
				onOccupancyChange={filters.setOccupancyFilter}
				blockNameFilter={filters.blockNameFilter}
				onBlockNameChange={filters.setBlockNameFilter}
				flatHouseRoomFilter={filters.flatHouseRoomFilter}
				onFlatHouseRoomChange={filters.setFlatHouseRoomFilter}
				unitNameFilter={filters.unitNameFilter}
				onUnitNameChange={filters.setUnitNameFilter}
				filterOptions={filterOptions}
				housingTypes={housingTypes}
				onResetFilters={filters.resetFilters}
			/>

			<div className='flex justify-between items-center'>
				<AccommodationViewToggle
					viewMode={viewMode}
					onViewChange={setViewMode}
				/>
				<p className='text-sm text-muted-foreground'>
					Showing {units.length} of {pagination?.totalCount || 0} quarters
				</p>
			</div>

			{viewMode === "table" ? (
				<AccommodationTableView
					units={units}
					onEdit={handleEdit}
					onDelete={handleDelete}
					deleteLoading={deleteLoading}
					canEdit={canEdit("accommodation.units")}
					canDelete={canDelete("accommodation.units")}
					canExport={canExportAccommodation()}
				/>
			) : (
				<AccommodationCardView
					units={units}
					viewMode={viewMode}
					onEdit={handleEdit}
					onDelete={handleDelete}
					deleteLoading={deleteLoading}
					canEdit={canEdit("accommodation.units")}
					canDelete={canDelete("accommodation.units")}
					canViewHistory={canViewHistory()}
					canMaintenanceRequest={canMaintenanceRequest()}
					canInventory={canInventory()}
				/>
			)}

			{/* Pagination Controls */}
			{pagination && pagination.totalCount > 0 && (
				<div className='mt-4'>
					<PaginationControls
						page={pagination.page}
						pageSize={pagination.pageSize}
						totalCount={pagination.totalCount}
						totalPages={pagination.totalPages}
						hasNextPage={pagination.hasNextPage}
						hasPreviousPage={pagination.hasPreviousPage}
						onPageChange={filters.setPage}
						onPageSizeChange={filters.setPageSize}
					/>
				</div>
			)}

			<ImportModal
				isOpen={showImportModal}
				onClose={() => setShowImportModal(false)}
				onImportComplete={handleImportComplete}
				housingTypes={housingTypes}
			/>

			<AccommodationFormModal
				isOpen={showForm}
				onClose={() => setShowForm(false)}
				onSuccess={refetch}
				editingUnit={editingUnit}
				housingTypes={housingTypes}
			/>
		</div>
	);
}
