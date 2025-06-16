import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Bed } from "lucide-react";
import { useAccommodationData } from "@/hooks/useAccommodationData";
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
	const { units } = useAccommodationData();
	const [viewMode, setViewMode] = useState<"card" | "compact">("card");
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		unit: DHQLivingUnitWithHousingType | null;
	}>({
		isOpen: false,
		unit: null,
	});

	// Filter vacant units that match the personnel's category
	const availableUnits = units.filter(
		(unit) => unit.status === "Vacant" && unit.category === currentUnit.category
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
			toast.success(`Transfer Successful: ${result.personnelName} has been transferred from ${result.transferDetails.from} to ${result.transferDetails.to}`);

			// Refresh the data
			await mutate("/api/dhq-living-units?status=Occupied");
			await mutate("/api/dhq-living-units?status=Vacant");

			return true;
		} catch (error) {
			console.error("Error processing transfer:", error);
			toast.error(`Transfer Failed: ${error instanceof Error ? error.message : "Failed to process transfer"}`);
			return false;
		}
	}

	const handleConfirmTransferRequest = async () => {
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
						<DialogTitle>Request Transfer</DialogTitle>
						<DialogDescription>
							Request transfer for {currentUnit.currentOccupantName} to another
							unit. This will proceed with immediate transfer. Showing{" "}
							{availableUnits.length} vacant{" "}
							{currentUnit.category.toLowerCase()} units.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Current Unit Information */}
						<Card className='border-blue-200 bg-blue-50'>
							<CardContent className='p-4'>
								<h4 className='font-medium text-blue-900 mb-2'>
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
						{availableUnits.length === 0 ? (
							<Card>
								<CardContent className='p-8 text-center'>
									<p className='text-gray-500'>
										No vacant {currentUnit.category.toLowerCase()} units
										available
									</p>
								</CardContent>
							</Card>
						) : (
							<div
								className={
									viewMode === "card" ? "space-y-4" : "grid grid-cols-2 gap-4"
								}>
								{availableUnits.map((unit) => (
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
														{unit.housingType && (
															<Badge variant='outline' className='text-xs'>
																{unit.housingType.name}
															</Badge>
														)}
													</div>
												</div>

												<Button
													size='sm'
													onClick={() => handleRequestTransferClick(unit)}
													className='flex items-center gap-2'>
													<Home className='h-4 w-4' />
													Select for Transfer
												</Button>
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
						<Button onClick={handleConfirmTransferRequest}>
							Confirm Transfer
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
