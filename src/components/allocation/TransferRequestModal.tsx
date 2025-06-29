import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Bed } from "lucide-react";
import { useAllUnits } from "@/hooks/useAllUnits";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { toast } from "react-toastify";
import { ScopedMutator } from "swr";

interface TransferRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentUnit: DHQLivingUnitWithHousingType;
	mutate: ScopedMutator;
}

export const TransferRequestModal = ({
	isOpen,
	onClose,
	currentUnit,
	mutate,
}: TransferRequestModalProps) => {
	const { units } = useAllUnits();
	const [viewMode, setViewMode] = useState<"card" | "compact">("card");
	const [searchTerm, setSearchTerm] = useState("");
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithHousingType | null;
	}>({
		isOpen: false,
		unit: null,
	});

	console.log({ currentUnit });

	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{}
	);

	// Filter vacant units that match the personnel's category
	console.log({ units: units.length });

	const eligibleUnits = units.filter(
		(unit) => unit.status === "Vacant" && unit.category === currentUnit.category
	);

	// Filter units based on search term
	const filteredUnits = eligibleUnits.filter(
		(unit) =>
			unit.quarterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.flatHouseRoomName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleRequestTransferClick = (unit: DHQLivingUnitWithHousingType) => {
		setConfirmDialog({
			isOpen: true,
			unit,
		});
	};

	async function createTransferRequest(
		fromUnitId: string,
		toUnitId: string
	): Promise<boolean> {
		setLoadingStates((prev) => ({ ...prev, [`transfer_${toUnitId}`]: true }));
		try {
			const response = await fetch("/api/allocations/transfer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ fromUnitId, toUnitId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to process transfer");
			}

			const result = await response.json();

			// Show success toast
			toast.success(
				`Transfer Successful: ${result.personnelName} has requested transfer from ${result.transferDetails.from}`
			);

			// Refresh the data
			await mutate("/api/dhq-living-units?status=Occupied");
			await mutate("/api/dhq-living-units?status=Vacant");

			return true;
		} catch (error) {
			console.error("Error processing transfer:", error);
			toast.error(
				`Transfer Failed: ${
					error instanceof Error ? error.message : "Failed to process transfer"
				}`
			);
			return false;
		} finally {
			setLoadingStates((prev) => ({
				...prev,
				[`transfer_${toUnitId}`]: false,
			}));
		}
	}

	const handleConfirmTransferRequest = async () => {
		console.log({ confirmDialog });

		if (confirmDialog.unit) {
			const success = await createTransferRequest(
				currentUnit.id,
				confirmDialog.unit.id
			);
			if (success) {
				setConfirmDialog({ isOpen: false, unit: null });
				onClose();
			}
		}
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Re-allocate</DialogTitle>
						<DialogDescription>
							Request re-allocation for {currentUnit.currentOccupantName} to
							another unit. This will proceed with immediate transfer. Showing{" "}
							{filteredUnits.length} of {eligibleUnits.length} vacant{" "}
							{currentUnit.category.toLowerCase()} units.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Current Unit Information */}
						<Card className='border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'>
							<CardContent className='p-4'>
								<h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>
									Current Living Unit Information
								</h4>
								<div className='grid grid-cols-2 gap-4 text-sm'>
									<div>
										<p>
											<span className='font-medium'>Personnel:</span>{" "}
											{currentUnit.currentOccupantRank}{" "}
											{currentUnit.currentOccupantName}
										</p>
										<p>
											<span className='font-medium'>Service Number:</span>{" "}
											{currentUnit.currentOccupantServiceNumber}
										</p>
										<p>
											<span className='font-medium'>Category:</span>{" "}
											{currentUnit.category}
										</p>
									</div>
									<div>
										<p>
											<span className='font-medium'>Quarter:</span>{" "}
											{currentUnit.quarterName}
										</p>
										<p>
											<span className='font-medium'>Location:</span>{" "}
											{currentUnit.location}
										</p>
										<p>
											<span className='font-medium'>Unit:</span>{" "}
											{currentUnit.blockName} {currentUnit.flatHouseRoomName}
										</p>
										<p>
											<span className='font-medium'>Occupancy Start:</span>{" "}
											{currentUnit.occupancyStartDate
												? new Date(
														currentUnit.occupancyStartDate
												  ).toLocaleDateString()
												: "N/A"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Search Bar */}
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='search'>
									Search Available {currentUnit.category} Units
								</Label>
								<Badge variant='outline' className='text-xs'>
									{filteredUnits.length} of {eligibleUnits.length} units available
								</Badge>
							</div>

							<Input
								id='search'
								placeholder='Search by quarter, location, block, or room...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* View Toggle */}
						<div className='flex gap-2'>
							<Button
								variant={viewMode === "card" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("card")}>
								Card View
							</Button>
							<Button
								variant={viewMode === "compact" ? "default" : "outline"}
								size='sm'
								onClick={() => setViewMode("compact")}>
								Compact View
							</Button>
						</div>

						{/* Available Units List */}
						{filteredUnits.length === 0 ? (
							<Card>
								<CardContent className='p-8 text-center'>
									<p className='text-muted-foreground'>
										{eligibleUnits.length === 0 
											? `No vacant ${currentUnit.category.toLowerCase()} units available`
											: 'No units match your search criteria'
										}
									</p>
									{eligibleUnits.length > 0 && searchTerm && (
										<p className='text-sm text-muted-foreground mt-2'>
											Try adjusting your search terms
										</p>
									)}
								</CardContent>
							</Card>
						) : (
							<div
								className={
									viewMode === "card" ? "space-y-4" : "grid grid-cols-2 gap-4"
								}>
								{filteredUnits.map((unit) => (
									<Card
										key={unit.id}
										className='hover:shadow-md transition-shadow'>
										<CardContent
											className={viewMode === "card" ? "p-4" : "p-3"}>
											<div className='flex items-start justify-between'>
												<div
													className={
														viewMode === "card" ? "space-y-2" : "space-y-1"
													}>
													<div className='flex items-center gap-2'>
														<Home className='h-4 w-4 text-muted-foreground' />
														<h4
															className={
																viewMode === "card"
																	? "font-medium"
																	: "text-sm font-medium"
															}>
															{unit.quarterName}
														</h4>
													</div>

													<div
														className={
															viewMode === "card"
																? "space-y-1 text-sm"
																: "text-xs space-y-1"
														}>
														<div className='flex items-center gap-2 text-muted-foreground'>
															<MapPin className='h-3 w-3' />
															<span>{unit.location}</span>
														</div>
														<p>
															<span className='font-medium'>Block:</span>{" "}
															{unit.blockName}
														</p>
														<p>
															<span className='font-medium'>Unit:</span>{" "}
															{unit.flatHouseRoomName}
														</p>
														<div className='flex items-center gap-2'>
															<Bed className='h-3 w-3' />
															<span>{unit.noOfRooms} rooms</span>
														</div>
														{unit.accommodationType && (
															<Badge variant='outline' className='text-xs'>
																{unit.accommodationType.name}
															</Badge>
														)}
													</div>
												</div>

												<LoadingButton
													size='sm'
													onClick={() => handleRequestTransferClick(unit)}
													loading={loadingStates[`transfer_${unit.id}`]}
													loadingText='Selecting...'
													className='flex items-center gap-2'>
													<Home className='h-4 w-4' />
													Select for Transfer
												</LoadingButton>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Transfer Request Confirmation Dialog */}
			<Dialog
				open={confirmDialog.isOpen}
				onOpenChange={(open) =>
					setConfirmDialog({ ...confirmDialog, isOpen: open })
				}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Transfer</DialogTitle>
						<DialogDescription>
							Are you sure you want to transfer{" "}
							{currentUnit.currentOccupantName} from {currentUnit.quarterName}{" "}
							{currentUnit.blockName} {currentUnit.flatHouseRoomName} to{" "}
							{confirmDialog.unit?.quarterName} {confirmDialog.unit?.blockName}{" "}
							{confirmDialog.unit?.flatHouseRoomName}? This will immediately
							transfer the personnel to the new unit.
						</DialogDescription>
					</DialogHeader>
					<div className='flex justify-end gap-2'>
						<Button
							variant='outline'
							onClick={() => setConfirmDialog({ isOpen: false, unit: null })}>
							Cancel
						</Button>
						<LoadingButton
							onClick={handleConfirmTransferRequest}
							loading={
								confirmDialog.unit
									? loadingStates[`transfer_${confirmDialog.unit.id}`]
									: false
							}
							loadingText='Transferring...'>
							Confirm Transfer
						</LoadingButton>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
