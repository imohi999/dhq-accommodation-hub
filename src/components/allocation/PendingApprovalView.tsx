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
	canViewLetter?: boolean;
	canApprove?: boolean;
	canRefuse?: boolean;
}

export const PendingApprovalView = ({
	requests = [],
	mutate,
	canViewLetter = true,
	canApprove = true,
	canRefuse = true,
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
		if (svcNo?.startsWith("NA/")) return "Nigerian Army";
		if (svcNo?.startsWith("NN/")) return "Nigerian Navy";
		if (svcNo?.startsWith("AF/")) return "Nigerian Air Force";
		return "Unknown";
	};

	const armyRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Nigerian Army"
	).length;
	const navyRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Nigerian Navy"
	).length;
	const airForceRequests = requests.filter(
		(r) => getServiceFromSvcNo(r.personnelData?.svcNo) === "Nigerian Air Force"
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
						<CardTitle className='text-sm font-medium'>Nigerian Army</CardTitle>
						<div className='w-4 h-4 rounded-full bg-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{armyRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Army" && r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Army" && r.personnelData.category === "NCOs"
								).length
							}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Nigerian Navy</CardTitle>
						<div className='w-4 h-4 rounded-full bg-blue-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{navyRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Navy" && r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Navy" && r.personnelData.category === "NCOs"
								).length
							}
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
						<div className='text-2xl font-bold'>{airForceRequests}</div>
						<p className='text-xs text-muted-foreground'>
							Officers:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Air Force" &&
										r.personnelData?.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								requests.filter(
									(r) =>
										getServiceFromSvcNo(r.personnelData?.svcNo) ===
											"Nigerian Air Force" &&
										r.personnelData.category === "NCOs"
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
							<CardContent className='p-4'>
								{/* Header Section - Compact */}
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center gap-3'>
										<div className='flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full text-sm font-semibold text-yellow-700'>
											#{index + 1}
										</div>
										<div>
											<h3 className='text-base font-semibold leading-tight'>
												{request.personnelData?.rank}{" "}
												{request.personnelData.fullName}
											</h3>
											<p className='text-xs text-muted-foreground'>
												{request.personnelData?.svcNo} •{" "}
												{getServiceFromSvcNo(request.personnelData?.svcNo)}
											</p>
										</div>
									</div>
								</div>

								{/* Content Section - Optimized Grid */}
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3'>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Category
										</p>
										<p className='font-medium'>
											{request.personnelData?.category}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Unit Type
										</p>
										<p className='font-medium'>
											{request.unitData?.accommodationType}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>Rooms</p>
										<p className='font-medium'>{request.unitData?.noOfRooms}</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Submitted
										</p>
										<p className='font-medium'>
											{new Date(request.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>

								{/* Additional Info and Actions */}
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-xs text-muted-foreground'>
										<span>Unit: {request.unitData?.flatHouseRoomName}</span>
										<span>•</span>
										<span>Quarter: {request.unitData?.quarterName}</span>
										<span>•</span>
										<span>Letter: {request.letterId}</span>
									</div>

									{/* Action Buttons - Compact */}
									<div className='flex items-center gap-2'>
										{canViewLetter && (
											<Button
												variant='outline'
												size='sm'
												onClick={() => setSelectedRequest(request)}
												className='text-xs px-3 py-1 h-auto'>
												<FileText className='h-3 w-3 mr-1' />
												Allocation Letter
											</Button>
										)}

										{canApprove && (
											<LoadingButton
												variant='default'
												size='sm'
												onClick={() => handleApproveClick(request)}
												loading={loadingStates[`approve_${request.id}`]}
												loadingText='Approving...'
												className='text-xs px-3 py-1 h-auto bg-green-600 hover:bg-green-700'>
												<CheckCircle className='h-3 w-3 mr-1' />
												Approve
											</LoadingButton>
										)}

										{canRefuse && (
											<LoadingButton
												variant='destructive'
												size='sm'
												onClick={() => handleRefuseClick(request)}
												loading={loadingStates[`refuse_${request.id}`]}
												loadingText='Refusing...'
												className='text-xs px-3 py-1 h-auto'>
												<XCircle className='h-3 w-3 mr-1' />
												Refuse
											</LoadingButton>
										)}
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
