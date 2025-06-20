import { useState, useEffect } from "react";
import { mutate as globalMutate } from "swr";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { useAccommodationData } from "@/hooks/useAccommodationData";
import { useAllocation } from "@/hooks/useAllocation";
import {
	Home,
	Users,
	MapPin,
	Building,
	Phone,
	Calendar,
	User,
	Shield,
} from "lucide-react";

interface AllocationModalProps {
	isOpen: boolean;
	onClose: () => void;
	personnel: QueueItem | null;
}

export const AllocationModal = ({
	isOpen,
	onClose,
	personnel,
}: AllocationModalProps) => {
	const { units, loading: unitsLoading } = useAccommodationData();
	const { createAllocationRequest, loading: allocationLoading } =
		useAllocation();
	const [selectedUnitId, setSelectedUnitId] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");

	// Filter for vacant units that match personnel category
	const eligibleUnits = units.filter(
		(unit) =>
			unit.status === "Vacant" &&
			personnel &&
			unit.category === personnel.category
	);

	// Filter units based on search term
	const filteredUnits = eligibleUnits.filter(
		(unit) =>
			unit.quarterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.flatHouseRoomName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const selectedUnit = eligibleUnits.find((unit) => unit.id === selectedUnitId);

	const handleAllocate = async () => {
		if (!personnel || !selectedUnit) return;

		console.log("Starting allocation process for:", personnel.full_name);
		console.log("Selected unit:", selectedUnit.quarterName);

		const result = await createAllocationRequest(personnel, selectedUnit);
		if (result) {
			console.log("Allocation request created successfully, closing modal");
			// Manually trigger cache revalidation for pending allocations
			await globalMutate("/api/allocations/requests?status=pending");
			// Also refresh all allocation requests
			await globalMutate((key) => typeof key === 'string' && key.includes('/api/allocations/requests'));
			onClose();
			setSelectedUnitId("");
			setSearchTerm("");
		}
	};

	const handleClose = () => {
		onClose();
		setSelectedUnitId("");
		setSearchTerm("");
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	};

	if (!personnel) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Allocate Accommodation</DialogTitle>
					<DialogDescription>
						Select an available {personnel.category} unit for{" "}
						{personnel.full_name}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Personnel Summary - Enhanced */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<User className='h-5 w-5' />
								Personnel Details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{/* Basic Information */}
								<div className='space-y-3'>
									<h4 className='font-semibold text-sm text-muted-foreground border-b pb-1'>
										BASIC INFORMATION
									</h4>
									<div className='space-y-2'>
										<div>
											<p className='text-xs text-muted-foreground'>Full Name</p>
											<p className='font-medium'>{personnel.full_name}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Rank</p>
											<p className='font-medium'>{personnel.rank}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Service Number
											</p>
											<p className='font-medium'>{personnel.svc_no}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Gender</p>
											<p className='font-medium'>{personnel.gender}</p>
										</div>
									</div>
								</div>

								{/* Service Information */}
								<div className='space-y-3'>
									<h4 className='font-semibold text-sm text-muted-foreground border-b pb-1'>
										SERVICE INFORMATION
									</h4>
									<div className='space-y-2'>
										<div>
											<p className='text-xs text-muted-foreground'>Category</p>
											<Badge variant='secondary'>{personnel.category}</Badge>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Arm of Service
											</p>
											<p className='font-medium'>{personnel.arm_of_service}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Current Unit
											</p>
											<p className='font-medium'>
												{personnel.current_unit || "N/A"}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Appointment
											</p>
											<p className='font-medium'>
												{personnel.appointment || "N/A"}
											</p>
										</div>
									</div>
								</div>

								{/* Personal & Family Information */}
								<div className='space-y-3'>
									<h4 className='font-semibold text-sm text-muted-foreground border-b pb-1'>
										PERSONAL & FAMILY
									</h4>
									<div className='space-y-2'>
										<div>
											<p className='text-xs text-muted-foreground'>
												Marital Status
											</p>
											<p className='font-medium'>{personnel.marital_status}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Adult Dependents
											</p>
											<p className='font-medium'>
												{personnel.no_of_adult_dependents}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Child Dependents
											</p>
											<p className='font-medium'>
												{personnel.no_of_child_dependents}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Phone</p>
											<p className='font-medium'>{personnel.phone || "N/A"}</p>
										</div>
									</div>
								</div>

								{/* Service Dates */}
								<div className='space-y-3 md:col-span-2 lg:col-span-3'>
									<h4 className='font-semibold text-sm text-muted-foreground border-b pb-1'>
										SERVICE DATES
									</h4>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div>
											<p className='text-xs text-muted-foreground'>Date TOS</p>
											<p className='font-medium'>
												{formatDate(personnel.date_tos)}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Date SOS</p>
											<p className='font-medium'>
												{formatDate(personnel.date_sos)}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Entry Date
											</p>
											<p className='font-medium'>
												{formatDate(personnel.entry_date_time)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Unit Selection */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='search'>
								Search Available {personnel.category} Units
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

						{eligibleUnits.length === 0 ? (
							<div className='text-center p-8 text-muted-foreground'>
								<Home className='h-8 w-8 mx-auto mb-2 opacity-50' />
								<p>No vacant {personnel.category} units available</p>
								<p className='text-sm'>
									Only units matching the personnel&apos;s category (
									{personnel.category}) are shown
								</p>
							</div>
						) : (
							<div>
								<Label htmlFor='unit'>Select Unit</Label>
								<Select
									value={selectedUnitId}
									onValueChange={setSelectedUnitId}>
									<SelectTrigger>
										<SelectValue placeholder='Select a unit' />
									</SelectTrigger>
									<SelectContent>
										{filteredUnits.map((unit) => (
											<SelectItem key={unit.id} value={unit.id}>
												{unit.quarterName} - {unit.blockName}{" "}
												{unit.flat_house_room_name}({unit.no_of_rooms} rooms) -{" "}
												{unit.location}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					{/* Selected Unit Preview */}
					{selectedUnit && (
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Selected Unit</CardTitle>
								<CardDescription>
									{selectedUnit.quarterName} - {selectedUnit.location}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
									<div className='flex items-center gap-2'>
										<Building className='h-4 w-4 text-muted-foreground' />
										<div>
											<p className='text-sm text-muted-foreground'>Block</p>
											<p className='font-medium'>{selectedUnit.blockName}</p>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										<Home className='h-4 w-4 text-muted-foreground' />
										<div>
											<p className='text-sm text-muted-foreground'>Unit</p>
											<p className='font-medium'>
												{selectedUnit.flat_house_room_name}
											</p>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										<Users className='h-4 w-4 text-muted-foreground' />
										<div>
											<p className='text-sm text-muted-foreground'>Rooms</p>
											<p className='font-medium'>{selectedUnit.no_of_rooms}</p>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										<Shield className='h-4 w-4 text-muted-foreground' />
										<div>
											<p className='text-sm text-muted-foreground'>Category</p>
											<p className='font-medium'>{selectedUnit.category}</p>
										</div>
									</div>
								</div>
								<div className='mt-4 flex gap-2'>
									<Badge variant='secondary'>
										{selectedUnit.housing_type?.name}
									</Badge>
									<Badge variant='outline'>
										{selectedUnit.type_of_occupancy}
									</Badge>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleAllocate}
						disabled={
							!selectedUnitId ||
							allocationLoading ||
							unitsLoading ||
							eligibleUnits.length === 0
						}>
						{allocationLoading
							? "Creating Request..."
							: "Create Allocation Request"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
