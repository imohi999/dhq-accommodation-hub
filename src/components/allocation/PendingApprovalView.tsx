import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { AllocationLetter } from "@/components/allocation/AllocationLetter";
import { APIAllocationRequest } from "@/src/app/(dashboard)/allocations/pending/page";
import { toast } from "react-toastify";
import { KeyedMutator } from "swr";

interface PendingApprovalViewProps {
	requests: APIAllocationRequest[];
	mutate: KeyedMutator<APIAllocationRequest[]>;
}

export const PendingApprovalView = ({
	requests = [],
	mutate,
}: PendingApprovalViewProps) => {
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		type: "approve" | "refuse";
		requestId: string;
		personnelName: string;
	}>({
		isOpen: false,
		type: "approve",
		requestId: "",
		personnelName: "",
	});
	const [selectedRequest, setSelectedRequest] =
		useState<APIAllocationRequest | null>(null);
	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{}
	);

	console.log({ requests: JSON.stringify(requests) });

	const handleApproveClick = (request: APIAllocationRequest) => {
		setConfirmDialog({
			isOpen: true,
			type: "approve",
			requestId: request.id,
			personnelName: request?.personnelData.fullName,
		});
	};

	const handleRefuseClick = (request: APIAllocationRequest) => {
		setConfirmDialog({
			isOpen: true,
			type: "refuse",
			requestId: request.id,
			personnelName: request.personnelData?.fullName,
		});
	};

	async function approveAllocation(requestId: string) {
		setLoadingStates((prev) => ({ ...prev, [`approve_${requestId}`]: true }));
		try {
			const response = await fetch("/api/allocations/approve", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ requestId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to approve allocation");
			}

			const result = await response.json();

			// Show success toast
			toast.success("Allocation request approved successfully");

			// Mutate the data to refresh the list
			await mutate();

			return result;
		} catch (error) {
			console.error("Error approving allocation:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to approve allocation"
			);
			throw error;
		} finally {
			setLoadingStates((prev) => ({
				...prev,
				[`approve_${requestId}`]: false,
			}));
		}
	}

	async function refuseAllocation(requestId: string) {
		setLoadingStates((prev) => ({ ...prev, [`refuse_${requestId}`]: true }));
		try {
			const response = await fetch("/api/allocations/refuse", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ requestId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to approve allocation");
			}

			const result = await response.json();

			toast.success("Allocation request was refused");

			// Mutate the data to refresh the list
			await mutate();

			return result;
		} catch (error) {
			console.error("Error approving allocation:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to approve allocation"
			);
			throw error;
		} finally {
			setLoadingStates((prev) => ({ ...prev, [`refuse_${requestId}`]: false }));
		}
	}

	const handleConfirmAction = async () => {
		if (confirmDialog.type === "approve") {
			await approveAllocation(confirmDialog.requestId);
		} else {
			const request = requests.find((r) => r.id === confirmDialog.requestId);
			if (request) {
				try {
					await refuseAllocation(confirmDialog.requestId);
					await mutate();
				} catch (error) {
					console.error("Error in refusal process:", error);
				}
			}
		}

		setConfirmDialog({
			isOpen: false,
			type: "approve",
			requestId: "",
			personnelName: "",
		});
	};

	// Summary cards
	const totalPending = requests.length;
	const officerRequests = requests.filter(
		(r) => r.personnelData?.category === "Officer"
	).length;
	const menRequests = requests.filter(
		(r) => r.personnelData?.category === "NCOs"
	).length;
	// Extract service from service number prefix
	const getServiceFromSvcNo = (svcNo: string) => {
		if (svcNo?.startsWith("NA/")) return "Army";
		if (svcNo?.startsWith("NN/")) return "Navy";
		if (svcNo?.startsWith("AF/")) return "Air Force";
		return "Unknown";
	};

	const armyRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Army"
	).length;
	const navyRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Navy"
	).length;
	const airForceRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Air Force"
	).length;

	return (
		<div className='space-y-6'>
			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Pending Allocations
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{totalPending}</div>
						<p className='text-xs text-muted-foreground'>
							Officers: {officerRequests} | NCOs: {menRequests}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Army</CardTitle>
						<div className='w-4 h-4 rounded-full bg-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{armyRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) === "Army" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) === "Army" &&
										r.personnelData.category === "NCOs"
								).length
							}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Navy</CardTitle>
						<div className='w-4 h-4 rounded-full bg-blue-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{navyRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) === "Navy" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) === "Navy" &&
										r.personnelData.category === "NCOs"
								).length
							}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Air Force</CardTitle>
						<div className='w-4 h-4 rounded-full bg-cyan-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{airForceRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Air Force" && r.personnelData?.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Air Force" && r.personnelData.category === "NCOs"
								).length
							}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Pending Requests Cards */}
			{requests.length === 0 ? (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-muted-foreground'>
							No pending allocation requests
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{requests.map((request, index) => (
						<Card
							key={request.id}
							className='hover:shadow-md transition-shadow'>
							<CardContent className='p-6'>
								<div className='flex items-start justify-between'>
									<div className='flex items-start space-x-4'>
										<div className='flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full'>
											<span className='text-lg font-bold text-yellow-800'>
												{index + 1}
											</span>
										</div>

										<div className='space-y-3'>
											<div>
												<h3 className='text-lg font-semibold'>
													{request.personnelData?.rank}{" "}
													{request.personnelData.fullName}
												</h3>
												<p className='text-sm text-muted-foreground'>
													{getServiceFromSvcNo(request.personnelData?.svcNo)} •{" "}
													{request.personnelData?.currentUnit}
												</p>
												<div className='flex items-center gap-2 mt-1'>
													<Badge variant='outline' className='text-xs'>
														{new Date(request.createdAt).toLocaleDateString()}{" "}
														{new Date(request.createdAt).toLocaleTimeString(
															[],
															{ hour: "2-digit", minute: "2-digit" }
														)}
													</Badge>
												</div>
											</div>

											<div>
												<p className='text-sm font-medium'>
													Letter No: {request.letterId}
												</p>
												<p className='text-sm text-muted-foreground'>
													{request.unitData?.accommodationType} •
													{request.unitData?.noOfRooms} Room(s) •
													{request.unitData?.flatHouseRoomName}
												</p>
												<Badge className='bg-yellow-100 text-yellow-800 mt-1'>
													Pending Review
												</Badge>
											</div>
										</div>
									</div>

									<div className='flex items-center gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setSelectedRequest(request)}
											className='flex items-center gap-2'>
											<FileText className='h-4 w-4' />
											View Letter
										</Button>

										<LoadingButton
											variant='default'
											size='sm'
											onClick={() => handleApproveClick(request)}
											loading={loadingStates[`approve_${request.id}`]}
											loadingText='Approving...'
											className='flex items-center gap-2 bg-green-600 hover:bg-green-700'>
											<CheckCircle className='h-4 w-4' />
											Approval
										</LoadingButton>

										<LoadingButton
											variant='destructive'
											size='sm'
											onClick={() => handleRefuseClick(request)}
											loading={loadingStates[`refuse_${request.id}`]}
											loadingText='Refusing...'
											className='flex items-center gap-2'>
											<XCircle className='h-4 w-4' />
											Not Approved
										</LoadingButton>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Confirmation Dialog */}
			<Dialog
				open={confirmDialog.isOpen}
				onOpenChange={(open) =>
					setConfirmDialog({ ...confirmDialog, isOpen: open })
				}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{confirmDialog.type === "approve"
								? "Approve Allocation"
								: "Refuse Allocation"}
						</DialogTitle>
						<DialogDescription>
							{confirmDialog.type === "approve"
								? `Are you sure you want to approve the allocation request for ${confirmDialog.personnelName}? This will move the request to Active Allocations.`
								: `Are you sure you want to refuse the allocation request for ${confirmDialog.personnelName}? This will return them to the queue at position #1.`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() =>
								setConfirmDialog({ ...confirmDialog, isOpen: false })
							}>
							Cancel
						</Button>
						<LoadingButton
							variant={
								confirmDialog.type === "approve" ? "default" : "destructive"
							}
							onClick={handleConfirmAction}
							loading={
								loadingStates[
									`${confirmDialog.type}_${confirmDialog.requestId}`
								]
							}
							loadingText={
								confirmDialog.type === "approve"
									? "Approving..."
									: "Refusing..."
							}
							className={
								confirmDialog.type === "approve"
									? "bg-green-600 hover:bg-green-700"
									: ""
							}>
							{confirmDialog.type === "approve" ? "Approve" : "Refuse"}
						</LoadingButton>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Allocation Letter Dialog */}
			{selectedRequest && (
				<AllocationLetter
					isOpen={!!selectedRequest}
					onClose={() => setSelectedRequest(null)}
					allocationRequest={selectedRequest}
				/>
			)}
		</div>
	);
};

const datahh = [
	{
		id: "43d8062e-ee82-4a69-91c4-3254b53ae12b",
		personnelId: "alloc-11",
		unitId: "14007193-4f8b-4cab-bf69-b484c1e66951",
		letterId: "DHQ/GAR/ABJ/2025/9487/LOG",
		personnelData: {
			rank: "Brig Gen",
			phone: "+234-8011111111",
			svcNo: "NA/11111/75",
			category: "Officer",
			fullName: "Taiwo Adegoke",
			currentUnit: "DHQ",
			maritalStatus: "Married",
		},
		unitData: {
			location: "Abuja FCT",
			unitName: "Block 4 House 3",
			noOfRooms: 3,
			quarterName: "Senior Officers Quarters Abuja",
			accommodationType: "Three Bedroom Flat",
		},
		allocationDate: "2025-06-17T20:13:26.440Z",
		status: "pending",
		approvedBy: null,
		approvedAt: null,
		refusalReason: null,
		createdAt: "2025-06-17T20:13:26.440Z",
		updatedAt: "2025-06-17T20:13:26.440Z",
		unit: {
			id: "14007193-4f8b-4cab-bf69-b484c1e66951",
			quarterName: "Senior Officers Quarters Abuja",
			location: "Abuja FCT",
			category: "Officer",
			accommodationTypeId: "e325e19c-f673-4cb2-b36c-0345c2f9f206",
			noOfRooms: 3,
			status: "Vacant",
			typeOfOccupancy: "Family",
			bq: true,
			noOfRoomsInBq: 1,
			blockName: "Block 4",
			flatHouseRoomName: "House 3",
			unitName: "Block 4 House 3",
			blockImageUrl: null,
			currentOccupantId: null,
			currentOccupantName: null,
			currentOccupantRank: null,
			currentOccupantServiceNumber: null,
			occupancyStartDate: null,
			createdAt: "2025-06-17T20:12:57.580Z",
			updatedAt: "2025-06-17T20:12:57.580Z",
			accommodationType: {
				id: "e325e19c-f673-4cb2-b36c-0345c2f9f206",
				name: "Three Bedroom Flat",
				description: "Three bedroom apartment",
				createdAt: "2025-06-17T20:12:43.071Z",
			},
		},
	},
	{
		id: "cda6f159-1b2c-4915-935c-021b280e60fd",
		personnelId: "alloc-8",
		unitId: "6357efc0-dc22-4fbb-8b1c-7cd1a9b61ebf",
		letterId: "DHQ/GAR/ABJ/2025/6104/LOG",
		personnelData: {
			rank: "2nd Lt",
			phone: "+234-8088888888",
			svcNo: "NN/88888/90",
			category: "Officer",
			fullName: "Grace Okafor",
			currentUnit: "Air Defence",
			maritalStatus: "Single",
		},
		unitData: {
			location: "Lagos Cantonment",
			unitName: "Block 3 Flat 5",
			noOfRooms: 2,
			quarterName: "Eagle Officers Quarters Lagos Cantonment",
			accommodationType: "Two Bedroom Flat",
		},
		allocationDate: "2025-06-17T20:13:16.707Z",
		status: "pending",
		approvedBy: "admin",
		approvedAt: "2025-06-17T20:13:16.707Z",
		refusalReason: null,
		createdAt: "2025-06-17T20:13:25.538Z",
		updatedAt: "2025-06-17T20:13:25.538Z",
		unit: {
			id: "6357efc0-dc22-4fbb-8b1c-7cd1a9b61ebf",
			quarterName: "Eagle Officers Quarters Lagos Cantonment",
			location: "Lagos Cantonment",
			category: "Officer",
			accommodationTypeId: "644aa118-5dbb-40ef-8e9d-e79873662859",
			noOfRooms: 2,
			status: "Vacant",
			typeOfOccupancy: "Family",
			bq: false,
			noOfRoomsInBq: 0,
			blockName: "Block 3",
			flatHouseRoomName: "Flat 5",
			unitName: "Block 3 Flat 5",
			blockImageUrl: null,
			currentOccupantId: null,
			currentOccupantName: null,
			currentOccupantRank: null,
			currentOccupantServiceNumber: null,
			occupancyStartDate: null,
			createdAt: "2025-06-17T20:12:56.680Z",
			updatedAt: "2025-06-17T20:12:56.680Z",
			accommodationType: {
				id: "644aa118-5dbb-40ef-8e9d-e79873662859",
				name: "Two Bedroom Flat",
				description: "Two bedroom apartment",
				createdAt: "2025-06-17T20:12:43.407Z",
			},
		},
	},
	{
		id: "c16876f8-7d3c-42a6-a250-de7dc8516edf",
		personnelId: "alloc-5",
		unitId: "3e272d0b-cfaa-4a4f-aef1-3a2b0f52eb32",
		letterId: "DHQ/GAR/ABJ/2025/8710/LOG",
		personnelData: {
			rank: "Capt",
			phone: "+234-8055555555",
			svcNo: "NN/55555/85",
			category: "Officer",
			fullName: "Ebenezer Adebisi",
			currentUnit: "MPB",
			maritalStatus: "Single",
		},
		unitData: {
			location: "Lagos Cantonment",
			unitName: "Block 3 Flat 3",
			noOfRooms: 2,
			quarterName: "Eagle Officers Quarters Lagos Cantonment",
			accommodationType: "Two Bedroom Flat",
		},
		allocationDate: "2025-06-17T20:13:24.615Z",
		status: "pending",
		approvedBy: "admin",
		approvedAt: "2025-06-17T20:13:15.744Z",
		refusalReason: "Pending documentation",
		createdAt: "2025-06-17T20:13:24.615Z",
		updatedAt: "2025-06-17T20:13:24.615Z",
		unit: {
			id: "3e272d0b-cfaa-4a4f-aef1-3a2b0f52eb32",
			quarterName: "Eagle Officers Quarters Lagos Cantonment",
			location: "Lagos Cantonment",
			category: "Officer",
			accommodationTypeId: "644aa118-5dbb-40ef-8e9d-e79873662859",
			noOfRooms: 2,
			status: "Vacant",
			typeOfOccupancy: "Family",
			bq: false,
			noOfRoomsInBq: 0,
			blockName: "Block 3",
			flatHouseRoomName: "Flat 3",
			unitName: "Block 3 Flat 3",
			blockImageUrl: null,
			currentOccupantId: null,
			currentOccupantName: null,
			currentOccupantRank: null,
			currentOccupantServiceNumber: null,
			occupancyStartDate: null,
			createdAt: "2025-06-17T20:12:56.097Z",
			updatedAt: "2025-06-17T20:12:56.097Z",
			accommodationType: {
				id: "644aa118-5dbb-40ef-8e9d-e79873662859",
				name: "Two Bedroom Flat",
				description: "Two bedroom apartment",
				createdAt: "2025-06-17T20:12:43.407Z",
			},
		},
	},
	{
		id: "e137c72b-39cc-4116-898e-0a4197755786",
		personnelId: "alloc-2",
		unitId: "1f39b183-022f-4d3b-8242-0d4d45b86a07",
		letterId: "DHQ/GAR/ABJ/2025/9378/LOG",
		personnelData: {
			rank: "Col",
			phone: "+234-8022222222",
			svcNo: "NN/22222/78",
			category: "Officer",
			fullName: "Amina Garba",
			currentUnit: "Naval Command",
			maritalStatus: "Married",
		},
		unitData: {
			location: "Mogadishu Cantonment",
			unitName: "Block 1 Flat 3",
			noOfRooms: 1,
			quarterName: "Dike Officers Quarters Mogadishu Cantonment",
			accommodationType: "One Bedroom Flat",
		},
		allocationDate: "2025-06-17T20:13:22.553Z",
		status: "pending",
		approvedBy: null,
		approvedAt: null,
		refusalReason: null,
		createdAt: "2025-06-17T20:13:22.553Z",
		updatedAt: "2025-06-17T20:13:22.553Z",
		unit: {
			id: "1f39b183-022f-4d3b-8242-0d4d45b86a07",
			quarterName: "Dike Officers Quarters Mogadishu Cantonment",
			location: "Mogadishu Cantonment",
			category: "Officer",
			accommodationTypeId: "6775548e-9191-4e12-b8ac-626e38d15403",
			noOfRooms: 1,
			status: "Vacant",
			typeOfOccupancy: "Single",
			bq: false,
			noOfRoomsInBq: 0,
			blockName: "Block 1",
			flatHouseRoomName: "Flat 3",
			unitName: "Block 1 Flat 3",
			blockImageUrl: null,
			currentOccupantId: null,
			currentOccupantName: null,
			currentOccupantRank: null,
			currentOccupantServiceNumber: null,
			occupancyStartDate: null,
			createdAt: "2025-06-17T20:12:54.036Z",
			updatedAt: "2025-06-17T20:12:54.036Z",
			accommodationType: {
				id: "6775548e-9191-4e12-b8ac-626e38d15403",
				name: "One Bedroom Flat",
				description: "One bedroom apartment",
				createdAt: "2025-06-17T20:12:42.489Z",
			},
		},
	},
];
