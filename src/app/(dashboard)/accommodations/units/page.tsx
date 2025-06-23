"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Plus, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { AccommodationSummaryCards } from "@/components/accommodation/AccommodationSummaryCards";
import { AccommodationFilters } from "@/components/accommodation/AccommodationFilters";
import { AccommodationViewToggle } from "@/components/accommodation/AccommodationViewToggle";
import { AccommodationCardView } from "@/components/accommodation/AccommodationCardView";
import { AccommodationTableView } from "@/components/accommodation/AccommodationTableView";
import { ImportModal } from "@/components/accommodation/ImportModal";
import { AccommodationFormModal } from "@/components/accommodation/AccommodationFormModal";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useAccommodationFilters } from "@/hooks/useAccommodationFilters";
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

	const { units, housingTypes, loading, refetch } = useAccommodationData();
	const [viewMode, setViewMode] = useState<"card" | "compact" | "table">(
		"card"
	);
	const [showForm, setShowForm] = useState(false);
	const [showImportModal, setShowImportModal] = useState(false);
	const [editingUnit, setEditingUnit] =
		useState<DHQLivingUnitWithHousingType | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

	const {
		searchTerm,
		setSearchTerm,
		quarterNameFilter,
		setQuarterNameFilter,
		locationFilter,
		setLocationFilter,
		categoryFilter,
		setCategoryFilter,
		housingTypeFilter,
		setHousingTypeFilter,
		statusFilter,
		setStatusFilter,
		occupancyFilter,
		setOccupancyFilter,
		blockNameFilter,
		setBlockNameFilter,
		flatHouseRoomFilter,
		setFlatHouseRoomFilter,
		unitNameFilter,
		setUnitNameFilter,
		filteredUnits,
	} = useAccommodationFilters(units);

	const handleAdd = () => {
		setEditingUnit(null);
		setShowForm(true);
	};

	const handleEdit = (unit: DHQLivingUnitWithHousingType) => {
		setEditingUnit(unit);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (
			!confirm("Are you sure you want to delete this accommodation quarters?")
		) {
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
				toast.error(error.error || "Failed to delete accommodation quarters");
				return;
			}

			toast.success("Accommodation quarters deleted successfully");

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
		toast.success("Successfully imported accommodation quarters");
	};

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
						DHQ Accommodation
					</h1>
					<p className='text-muted-foreground'>
						Manage accommodation quarters for military personnel
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
							Add Quarters
						</Button>
					)}
				</div>
			</div>

			<AccommodationSummaryCards units={filteredUnits} />

			<AccommodationFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				quarterNameFilter={quarterNameFilter}
				onQuarterNameChange={setQuarterNameFilter}
				locationFilter={locationFilter}
				onLocationChange={setLocationFilter}
				categoryFilter={categoryFilter}
				onCategoryChange={setCategoryFilter}
				housingTypeFilter={housingTypeFilter}
				onHousingTypeChange={setHousingTypeFilter}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				occupancyFilter={occupancyFilter}
				onOccupancyChange={setOccupancyFilter}
				blockNameFilter={blockNameFilter}
				onBlockNameChange={setBlockNameFilter}
				flatHouseRoomFilter={flatHouseRoomFilter}
				onFlatHouseRoomChange={setFlatHouseRoomFilter}
				unitNameFilter={unitNameFilter}
				onUnitNameChange={setUnitNameFilter}
				units={units}
				housingTypes={housingTypes}
			/>

			<div className='flex justify-between items-center'>
				<AccommodationViewToggle
					viewMode={viewMode}
					onViewChange={setViewMode}
				/>
				<p className='text-sm text-muted-foreground'>
					Showing {filteredUnits.length} of {units.length} quarters
				</p>
			</div>

			{viewMode === "table" ? (
				<AccommodationTableView
					units={filteredUnits}
					onEdit={handleEdit}
					onDelete={handleDelete}
					deleteLoading={deleteLoading}
					canEdit={canEdit("accommodation.units")}
					canDelete={canDelete("accommodation.units")}
					canExport={canExportAccommodation()}
				/>
			) : (
				<AccommodationCardView
					units={filteredUnits}
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
