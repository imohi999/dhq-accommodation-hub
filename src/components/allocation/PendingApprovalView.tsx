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
	console.log({ requests });

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
	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

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
		setLoadingStates(prev => ({ ...prev, [`approve_${requestId}`]: true }));
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
				error instanceof Error
					? error.message
					: "Failed to approve allocation"
			);
			throw error;
		} finally {
			setLoadingStates(prev => ({ ...prev, [`approve_${requestId}`]: false }));
		}
	}

	async function refuseAllocation(requestId: string) {
		setLoadingStates(prev => ({ ...prev, [`refuse_${requestId}`]: true }));
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
				error instanceof Error
					? error.message
					: "Failed to approve allocation"
			);
			throw error;
		} finally {
			setLoadingStates(prev => ({ ...prev, [`refuse_${requestId}`]: false }));
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
		(r) => r.personnelData?.category === "Men"
	).length;
	const armyRequests = requests.filter(
		(r) => r.personnelData?.armOfService === "Army"
	).length;
	const navyRequests = requests.filter(
		(r) => r.personnelData?.armOfService === "Navy"
	).length;
	const airForceRequests = requests.filter(
		(r) => r.personnelData?.armOfService === "Air Force"
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
							Officers: {officerRequests} | Men: {menRequests}
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
										r.personnelData?.armOfService === "Army" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnelData?.armOfService === "Army" &&
										r.personnelData.category === "Men"
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
										r.personnelData?.armOfService === "Navy" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnelData?.armOfService === "Navy" &&
										r.personnelData.category === "Men"
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
										r.personnelData?.armOfService === "Air Force" &&
										r.personnelData?.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnelData?.armOfService === "Air Force" &&
										r.personnelData.category === "Men"
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
						<p className='text-gray-500'>No pending allocation requests</p>
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
													{request.personnelData.fullName}
												</h3>
												<p className='text-sm text-muted-foreground'>
													Svc No: {request.personnelData?.svcNo} •{" "}
													{request.personnelData?.currentUnit ||
														"Naval Academy"}{" "}
													•{" "}
													{request.personnelData?.appointment ||
														"Academy Instructor"}
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
													Quarter: {request.unitData.quarterName}{" "}
													{request.unit.blockName}{" "}
													{request.unit.flatHouseRoomName}
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
											loadingText="Approving..."
											className='flex items-center gap-2 bg-green-600 hover:bg-green-700'>
											<CheckCircle className='h-4 w-4' />
											Approval
										</LoadingButton>

										<LoadingButton
											variant='destructive'
											size='sm'
											onClick={() => handleRefuseClick(request)}
											loading={loadingStates[`refuse_${request.id}`]}
											loadingText="Refusing..."
											className='flex items-center gap-2'>
											<XCircle className='h-4 w-4' />
											Refusal
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
							loading={loadingStates[`${confirmDialog.type}_${confirmDialog.requestId}`]}
							loadingText={confirmDialog.type === "approve" ? "Approving..." : "Refusing..."}
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
