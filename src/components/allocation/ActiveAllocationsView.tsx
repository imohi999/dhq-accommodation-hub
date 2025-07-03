import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	ArrowRightLeft,
	UserMinus,
	FileText,
	Home,
	AlertTriangle,
	User,
} from "lucide-react";
import { AllocationLetter } from "./AllocationLetter";
import { EvictionNotice } from "./EvictionNotice";
import { TransferRequestModal } from "./TransferRequestModal";
import { toast } from "react-toastify";
import {
	useOccupiedUnits,
	DHQLivingUnitWithOccupants,
} from "@/services/occupiedUnitsApi";
import { usePermissions } from "@/hooks/usePermissions";
import { AllocationFilters } from "./AllocationFilters";
import { useAllocationFilters } from "@/hooks/useAllocationFilters";

interface ActiveAllocationsViewProps {
	occupiedUnits: DHQLivingUnitWithOccupants[];
}

export const ActiveAllocationsView = ({
	occupiedUnits,
}: ActiveAllocationsViewProps) => {
	const { hasPermission } = usePermissions();
	const { mutate: mutateOccupiedUnits } = useOccupiedUnits();

	const canViewLetter = hasPermission("allocations.active", "view_letter");
	const canEjectionNotice = hasPermission(
		"allocations.active",
		"ejection_notice"
	);
	const canTransfer = hasPermission("allocations.active", "transfer");
	const canPostOut = hasPermission("allocations.active", "post_out");

	const [deallocateDialog, setDeallocateDialog] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithOccupants | null;
		reason: string;
	}>({
		isOpen: false,
		unit: null,
		reason: "",
	});

	const [allocationLetter, setAllocationLetter] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithOccupants | null;
	}>({
		isOpen: false,
		unit: null,
	});

	const [transferModal, setTransferModal] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithOccupants | null;
	}>({
		isOpen: false,
		unit: null,
	});

	const [evictionNotice, setEvictionNotice] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithOccupants | null;
	}>({
		isOpen: false,
		unit: null,
	});

	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{}
	);

	const handleDeallocateClick = (unit: DHQLivingUnitWithOccupants) => {
		setDeallocateDialog({
			isOpen: true,
			unit,
			reason: "",
		});
	};

	async function deallocatePersonnel(unitId: string, reason: string) {
		setLoadingStates((prev) => ({ ...prev, [`deallocate_${unitId}`]: true }));
		try {
			const response = await fetch("/api/dhq-living-units/deallocate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ unitId, reason }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to deallocate unit");
			}

			const result = await response.json();

			// Show success toast
			toast.success("Personnel deallocated successfully");

			// Mutate the data to refresh the list
			await mutateOccupiedUnits();

			return result;
		} catch (error) {
			console.error("Error deallocating personnel:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to deallocate personnel"
			);
			throw error;
		} finally {
			setLoadingStates((prev) => ({
				...prev,
				[`deallocate_${unitId}`]: false,
			}));
		}
	}

	const handleDeallocateConfirm = async () => {
		if (deallocateDialog.unit && deallocateDialog.reason.trim()) {
			await deallocatePersonnel(
				deallocateDialog.unit.id,
				deallocateDialog.reason
			);
			setDeallocateDialog({
				isOpen: false,
				unit: null,
				reason: "",
			});
		}
	};

	const handleViewLetterClick = (unit: DHQLivingUnitWithOccupants) => {
		setAllocationLetter({
			isOpen: true,
			unit,
		});
	};

	const handleTransferClick = (unit: DHQLivingUnitWithOccupants) => {
		setTransferModal({
			isOpen: true,
			unit,
		});
	};

	const handleEvictionNoticeClick = (unit: DHQLivingUnitWithOccupants) => {
		setEvictionNotice({
			isOpen: true,
			unit,
		});
	};

	//

	// Create a mock allocation request for the letter from unit data
	const currentYear = new Date().getFullYear();

	function generateRandomFourDigitNumber() {
		return Math.floor(1000 + Math.random() * 9000);
	}

	const paddedCount = generateRandomFourDigitNumber();
	const letterId = `DHQ/GAR/ABJ/${currentYear}/${paddedCount}/LOG`;

	const createMockAllocationRequest = (unit: DHQLivingUnitWithOccupants) => {
		const currentOccupant = unit.occupants?.find((o) => o.isCurrent);
		const armOfService =
			currentOccupant?.queue?.armOfService || "Nigerian Navy";

		return {
			id: unit.id,
			personnelId: unit.currentOccupantId || unit.id,
			queueId: unit.currentOccupantId || unit.id,
			unitId: unit.id,
			letterId: letterId,
			personnelData: {
				id: unit.currentOccupantId || unit.id,
				rank: unit.currentOccupantRank || "",
				phone: "",
				svcNo: unit.currentOccupantServiceNumber || "",
				gender: "Male",
				category: unit.category,
				fullName: unit.currentOccupantName || "",
				sequence: 1,
				appointment: "Staff Officer",
				currentUnit: "Naval Academy",
				armOfService: armOfService,
				entryDateTime: new Date().toISOString(),
				maritalStatus: "Single",
				noOfAdultDependents: 0,
				noOfChildDependents: 0,
			},
			unitData: {
				id: unit.id,
				status: unit.status,
				category: unit.category,
				location: unit.location,
				blockName: unit.blockName,
				noOfRooms: unit.noOfRooms,
				accommodationType: unit.accommodationType?.name || unit.category,
				quarterName: unit.quarterName,
				flatHouseRoomName: unit.flatHouseRoomName,
			},
			allocationDate: unit.occupancyStartDate || new Date().toISOString(),
			status: "approved",
			approvedBy: null,
			approvedAt: unit.occupancyStartDate || new Date().toISOString(),
			refusalReason: null,
			createdAt: unit.occupancyStartDate || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			personnelName: unit.currentOccupantName || "",
			personnel: {
				id: unit.currentOccupantId || unit.id,
				sequence: 1,
				fullName: unit.currentOccupantName || "",
				svcNo: unit.currentOccupantServiceNumber || "",
				gender: "Male",
				armOfService: armOfService,
				category: unit.category,
				rank: unit.currentOccupantRank || "",
				maritalStatus: "Single",
				noOfAdultDependents: 0,
				noOfChildDependents: 0,
				currentUnit: "Naval Academy",
				appointment: "Academy Instructor",
				dateTos: null,
				dateSos: null,
				phone: "",
				entryDateTime: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			unit: {
				id: unit.id,
				quarterName: unit.quarterName,
				location: unit.location,
				category: unit.category,
				accommodationTypeId: unit.accommodationTypeId,
				noOfRooms: unit.noOfRooms,
				status: unit.status,
				typeOfOccupancy: unit.typeOfOccupancy,
				bq: unit.bq,
				noOfRoomsInBq: unit.noOfRoomsInBq,
				blockName: unit.blockName,
				flatHouseRoomName: unit.flatHouseRoomName,
				unitName:
					unit.unitName || `${unit.blockName} ${unit.flatHouseRoomName}`,
				blockImageUrl: unit.blockImageUrl,
				currentOccupantId: unit.currentOccupantId,
				currentOccupantName: unit.currentOccupantName,
				currentOccupantRank: unit.currentOccupantRank,
				currentOccupantServiceNumber: unit.currentOccupantServiceNumber,
				occupancyStartDate: unit.occupancyStartDate,
				createdAt: unit.createdAt,
				updatedAt: unit.updatedAt,
				accommodationType: unit.accommodationType
					? {
							id: unit.accommodationType.id,
							name: unit.accommodationType.name,
							description: unit.accommodationType.description || "",
							createdAt: unit.accommodationType.createdAt,
					  }
					: {
							id: unit.accommodationTypeId,
							name: unit.category,
							description: "",
							createdAt: new Date().toISOString(),
					  },
			},
			queue: currentOccupant?.queue
				? {
						...currentOccupant.queue,
						id: currentOccupant.queue.id,
						sequence: currentOccupant.queue.sequence,
						fullName: currentOccupant.queue.fullName,
						svcNo: currentOccupant.queue.svcNo,
						gender: currentOccupant.queue.gender,
						armOfService: currentOccupant.queue.armOfService,
						category: currentOccupant.queue.category,
						rank: currentOccupant.queue.rank,
						maritalStatus: currentOccupant.queue.maritalStatus,
						noOfAdultDependents: currentOccupant.queue.noOfAdultDependents,
						noOfChildDependents: currentOccupant.queue.noOfChildDependents,
						currentUnit: currentOccupant.queue.currentUnit,
						appointment: currentOccupant.queue.appointment,
						dateTos: currentOccupant.queue.dateTos,
						dateSos: currentOccupant.queue.dateSos,
						phone: currentOccupant.queue.phone,
						entryDateTime: currentOccupant.queue.entryDateTime,
						createdAt: currentOccupant.queue.createdAt,
						updatedAt: currentOccupant.queue.updatedAt,
						dependents: currentOccupant.queue.dependents || [],
						hasAllocationRequest: currentOccupant.queue.hasAllocationRequest,
				  }
				: {
						id: unit.currentOccupantId || unit.id,
						sequence: 1,
						fullName: unit.currentOccupantName || "",
						svcNo: unit.currentOccupantServiceNumber || "",
						gender: "Male",
						armOfService: armOfService,
						category: unit.category,
						rank: unit.currentOccupantRank || "",
						maritalStatus: "Single",
						noOfAdultDependents: 0,
						noOfChildDependents: 0,
						currentUnit: "Naval Academy",
						appointment: "Staff Officer",
						dateTos: null,
						dateSos: null,
						phone: "",
						entryDateTime: new Date().toISOString(),
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						dependents: [],
						hasAllocationRequest: true,
				  },
		};
	};

	// Get service from occupant's queue data
	const getServiceFromUnit = (unit: DHQLivingUnitWithOccupants) => {
		const currentOccupant = unit.occupants?.find((o) => o.isCurrent);
		return currentOccupant?.queue?.armOfService || "Unknown";
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
		filteredItems,
		availableQuarters,
		availableUnitTypes,
	} = useAllocationFilters(
		occupiedUnits,
		(item) => [
			item.currentOccupantName || "",
			item.currentOccupantServiceNumber || "",
			item.currentOccupantRank || "",
			item.quarterName || "",
			item.flatHouseRoomName || "",
			item.blockName || "",
			item.location || "",
		],
		(item) => getServiceFromUnit(item),
		(item) => item.category || "",
		(item) => item.quarterName || "",
		(item) => item.accommodationType?.name || item.category || ""
	);

	// Calculate summary statistics based on filtered items
	const totalActiveAllocations = filteredItems.length;
	const officerAllocations = filteredItems.filter(
		(unit) => unit.category === "Officer"
	).length;
	const ncoAllocations = filteredItems.filter(
		(unit) => unit.category === "NCO"
	).length;

	// Calculate by service
	const armyAllocations = filteredItems.filter(
		(unit) => getServiceFromUnit(unit) === "Nigerian Army"
	);
	const navyAllocations = filteredItems.filter(
		(unit) => getServiceFromUnit(unit) === "Nigerian Navy"
	);
	const airForceAllocations = filteredItems.filter(
		(unit) => getServiceFromUnit(unit) === "Nigerian Air Force"
	);

	const armyOfficers = armyAllocations.filter(
		(unit) => unit.category === "Officer"
	).length;
	const armyNCO = armyAllocations.filter(
		(unit) => unit.category === "NCO"
	).length;
	const navyOfficers = navyAllocations.filter(
		(unit) => unit.category === "Officer"
	).length;
	const navyNCO = navyAllocations.filter(
		(unit) => unit.category === "NCO"
	).length;
	const airForceOfficers = airForceAllocations.filter(
		(unit) => unit.category === "Officer"
	).length;
	const airForceNCO = airForceAllocations.filter(
		(unit) => unit.category === "NCO"
	).length;

	return (
		<div className='space-y-6'>
			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Active Allocations
						</CardTitle>
						<Home className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{totalActiveAllocations}</div>
						<p className='text-xs text-muted-foreground'>
							Officers: {officerAllocations} | NCO: {ncoAllocations}
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
							Officers: {armyOfficers} | NCO: {armyNCO}
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
							Officers: {navyOfficers} | NCO: {navyNCO}
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
							Officers: {airForceOfficers} | NCO: {airForceNCO}
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
				availableQuarters={availableQuarters}
				availableUnitTypes={availableUnitTypes}
			/>

			{/* Show count info */}
			<div className='flex justify-between items-center'>
				<p className='text-sm text-muted-foreground'>
					Showing {filteredItems.length} of {occupiedUnits.length} active
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
							unitTypeFilter !== "all"
								? "No active allocations match your filters"
								: "No active allocations"}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{filteredItems.map((unit) => (
						<Card key={unit.id} className='hover:shadow-md transition-shadow'>
							<CardContent className='p-4'>
								{/* Header Section - Compact */}
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center gap-3'>
										{(() => {
											const currentOccupant = unit.occupants?.find(
												(o) => o.isCurrent
											);
											const imageUrl = currentOccupant?.queue?.imageUrl;
											return imageUrl ? (
												<div className='relative w-32 h-32'>
													<Image
														src={imageUrl}
														alt={unit.currentOccupantName || ""}
														fill
														sizes="128px"
														className='rounded-full object-cover border-2 border-gray-200'
													/>
												</div>
											) : (
												<div className='flex items-center justify-center w-32 h-32 bg-green-100 rounded-full'>
													<User className='h-16 w-16 text-green-700' />
												</div>
											);
										})()}
										<div>
											<h3 className='text-base font-semibold leading-tight'>
												{unit.currentOccupantRank} {unit.currentOccupantName}
											</h3>
											<p className='text-xs text-muted-foreground'>
												{unit.currentOccupantServiceNumber} •{" "}
												{getServiceFromUnit(unit)}
											</p>
										</div>
									</div>
									{/* Action Buttons - Compact */}
									<div className='flex items-center gap-2'>
										{canViewLetter && (
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleViewLetterClick(unit)}
												className='text-xs px-3 py-1 h-auto'>
												<FileText className='h-3 w-3 mr-1' />
												Allocation Letter
											</Button>
										)}

										{canEjectionNotice && (
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleEvictionNoticeClick(unit)}
												className='text-xs px-3 py-1 h-auto'>
												<AlertTriangle className='h-3 w-3 mr-1' />
												Ejection Notice
											</Button>
										)}

										{canTransfer && (
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleTransferClick(unit)}
												className='text-xs px-3 py-1 h-auto'>
												<ArrowRightLeft className='h-3 w-3 mr-1' />
												Re-allocate
											</Button>
										)}

										{canPostOut && (
											<LoadingButton
												variant='destructive'
												size='sm'
												onClick={() => handleDeallocateClick(unit)}
												loading={loadingStates[`deallocate_${unit.id}`]}
												loadingText='Posting...'
												className='text-xs px-3 py-1 h-auto'>
												<UserMinus className='h-3 w-3 mr-1' />
												Posted Out
											</LoadingButton>
										)}
									</div>
								</div>

								{/* Content Section - Optimized Grid */}
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3'>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Category
										</p>
										<p className='font-medium'>{unit.category}</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Accommodation Type
										</p>
										<p className='font-medium'>
											{unit.accommodationType?.name || unit.category}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>Rooms</p>
										<p className='font-medium'>{unit.noOfRooms}</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Occupied Since
										</p>
										<p className='font-medium'>
											{unit.occupancyStartDate
												? new Date(unit.occupancyStartDate).toLocaleDateString()
												: "N/A"}
										</p>
									</div>
								</div>

								{/* Additional Info and Actions */}
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-xs text-muted-foreground'>
										<span>Quarter&apos;s Name: {unit.quarterName}</span>
										<span>•</span>
										<span>{unit.unitName}</span>
										<span>•</span>
										<span>Location: {unit.location}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Post Out Confirmation Dialog */}
			<Dialog
				open={deallocateDialog.isOpen}
				onOpenChange={(open) => {
					if (!open) {
						setDeallocateDialog({ isOpen: false, unit: null, reason: "" });
					}
				}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Post Out Personnel</DialogTitle>
						<DialogDescription>
							Are you sure you want to post out{" "}
							{deallocateDialog.unit?.currentOccupantName}? This will mark their
							accommodation as vacant and move them to Past Allocations.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='reason'>Reason for Posting Out *</Label>
							<Textarea
								id='reason'
								placeholder='Enter reason for posting out (e.g., Posted to another unit, Retirement, Transfer, etc.)'
								value={deallocateDialog.reason}
								onChange={(e) =>
									setDeallocateDialog({
										...deallocateDialog,
										reason: e.target.value,
									})
								}
								className='min-h-[100px]'
							/>
							{deallocateDialog.reason.trim() === "" && (
								<p className='text-sm text-destructive'>Reason is required</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() =>
								setDeallocateDialog({ isOpen: false, unit: null, reason: "" })
							}>
							Cancel
						</Button>
						<LoadingButton
							variant='destructive'
							onClick={handleDeallocateConfirm}
							disabled={!deallocateDialog.reason.trim()}
							loading={
								deallocateDialog.unit
									? loadingStates[`deallocate_${deallocateDialog.unit.id}`]
									: false
							}
							loadingText='Posting Out...'>
							Post Out
						</LoadingButton>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Allocation Letter Modal */}
			{allocationLetter.unit && (
				<AllocationLetter
					isOpen={allocationLetter.isOpen}
					onClose={() => setAllocationLetter({ isOpen: false, unit: null })}
					allocationRequest={createMockAllocationRequest(allocationLetter.unit)}
				/>
			)}

			{/* Transfer Request Modal */}
			{transferModal.unit && (
				<TransferRequestModal
					isOpen={transferModal.isOpen}
					onClose={() => setTransferModal({ isOpen: false, unit: null })}
					currentUnit={transferModal.unit}
					mutate={() => mutateOccupiedUnits()}
					// queueId={transferModal.}
				/>
			)}

			{/* Eviction Notice Modal */}
			{evictionNotice.unit && (
				<EvictionNotice
					isOpen={evictionNotice.isOpen}
					onClose={() => setEvictionNotice({ isOpen: false, unit: null })}
					unit={createMockAllocationRequest(evictionNotice.unit)}
				/>
			)}
		</div>
	);
};
