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
import {
	CheckCircle,
	XCircle,
	FileText,
	Clock,
	Loader2,
	User,
	Home,
} from "lucide-react";
import { AllocationLetter } from "@/components/allocation/AllocationLetter";
import { APIAllocationRequest } from "@/src/app/(dashboard)/allocations/pending/page";
import { toast } from "react-toastify";
import { KeyedMutator } from "swr";
import { AllocationFilters } from "./AllocationFilters";
import { useAllocationFilters } from "@/hooks/useAllocationFilters";

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
		request: APIAllocationRequest | null;
	}>({
		isOpen: false,
		type: "approve",
		request: null,
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
			request: request,
		});
	};

	const handleRefuseClick = (request: APIAllocationRequest) => {
		setConfirmDialog({
			isOpen: true,
			type: "refuse",
			request: request,
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
		if (!confirmDialog.request) return;

		if (confirmDialog.type === "approve") {
			await approveAllocation(confirmDialog.request.id);
		} else {
			try {
				await refuseAllocation(confirmDialog.request.id);
				await mutate();
			} catch (error) {
				console.error("Error in refusal process:", error);
			}
		}

		setConfirmDialog({
			isOpen: false,
			type: "approve",
			request: null,
		});
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
		requests,
		(item) => [
			item.personnelData?.fullName || "",
			item.personnelData?.svcNo || "",
			item.personnelData?.rank || "",
			item.unitData?.quarterName || "",
			item.unitData?.flatHouseRoomName || "",
			item.letterId || "",
		],
		(item) =>
			item.queue?.armOfService || item.personnelData?.armOfService || "",
		(item) => item.personnelData?.category || "",
		(item) => item.unitData?.quarterName || "",
		(item) => item.unitData?.accommodationType || ""
	);

	// Summary cards based on filtered items
	const totalPending = filteredItems.length;
	const officerRequests = filteredItems.filter(
		(r) => r.personnelData?.category === "Officer"
	).length;
	const menRequests = filteredItems.filter(
		(r) => r.personnelData?.category === "NCOs"
	).length;

	const armyRequests = filteredItems.filter(
		(r) =>
			(r.queue?.armOfService || r.personnelData?.armOfService) ===
			"Nigerian Army"
	).length;
	const navyRequests = filteredItems.filter(
		(r) =>
			(r.queue?.armOfService || r.personnelData?.armOfService) ===
			"Nigerian Navy"
	).length;
	const airForceRequests = filteredItems.filter(
		(r) =>
			(r.queue?.armOfService || r.personnelData?.armOfService) ===
			"Nigerian Air Force"
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
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
											"Nigerian Army" && r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
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
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
											"Nigerian Navy" && r.personnelData.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
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
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
											"Nigerian Air Force" &&
										r.personnelData?.category === "Officer"
								).length
							}{" "}
							| NCOs:{" "}
							{
								filteredItems.filter(
									(r) =>
										(r.queue?.armOfService || r.personnelData?.armOfService) ===
											"Nigerian Air Force" &&
										r.personnelData.category === "NCOs"
								).length
							}
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
					Showing {filteredItems.length} of {requests.length} pending requests
				</p>
			</div>

			{/* Pending Requests Cards */}
			{filteredItems.length === 0 ? (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-muted-foreground'>
							{searchTerm ||
							categoryFilter !== "all" ||
							armOfServiceFilter !== "all" ||
							quarterFilter !== "all" ||
							unitTypeFilter !== "all"
								? "No pending requests match your filters"
								: "No pending allocation requests"}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{filteredItems.map((request, index) => (
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
												{request.queue?.armOfService ||
													request.personnelData?.armOfService ||
													"Unknown"}
											</p>
										</div>
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
												Approved
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
												Not Approved
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
										<p className='font-medium'>
											{request.personnelData?.category}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='font-medium text-muted-foreground'>
											Accommodation Type
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
										<span>Quarters Name: {request.unitData?.quarterName}</span>
										<span>•</span>
										<span>{request.unit.unitName}</span>
										<span>•</span>
										<span>Letter: {request.letterId}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Enhanced Confirmation Dialog */}
			<Dialog
				open={confirmDialog.isOpen}
				onOpenChange={(open) => {
					// Prevent closing while loading
					const isLoading =
						confirmDialog.request &&
						(loadingStates[`approve_${confirmDialog.request.id}`] ||
							loadingStates[`refuse_${confirmDialog.request.id}`]);
					if (!isLoading) {
						setConfirmDialog({ ...confirmDialog, isOpen: open });
					}
				}}>
				<DialogContent className='max-w-3xl'>
					<DialogHeader>
						<DialogTitle>
							{confirmDialog.type === "approve"
								? "Approve Allocation Request"
								: "Refuse Allocation Request"}
						</DialogTitle>
						<DialogDescription>
							Review the allocation details before{" "}
							{confirmDialog.type === "approve" ? "approving" : "refusing"} this
							request
						</DialogDescription>
					</DialogHeader>

					{/* Loading overlay */}
					{confirmDialog.request &&
						(loadingStates[`approve_${confirmDialog.request.id}`] ||
							loadingStates[`refuse_${confirmDialog.request.id}`]) && (
							<div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg'>
								<div className='flex flex-col items-center gap-2'>
									<Loader2 className='h-8 w-8 animate-spin text-primary' />
									<p className='text-sm text-muted-foreground'>
										{confirmDialog.type === "approve"
											? "Approving allocation..."
											: "Refusing allocation..."}
									</p>
								</div>
							</div>
						)}

					{confirmDialog.request && (
						<div className='space-y-4'>
							{/* Personnel Information Card */}
							<Card>
								<CardHeader>
									<CardTitle className='text-base flex items-center gap-2'>
										<User className='h-4 w-4' />
										Personnel Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-xs text-muted-foreground'>Name</p>
											<p className='font-medium'>
												{confirmDialog.request.personnelData?.rank}{" "}
												{confirmDialog.request.personnelData?.fullName}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>
												Service Number
											</p>
											<p className='font-medium'>
												{confirmDialog.request.personnelData?.svcNo}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Category</p>
											<Badge variant='secondary'>
												{confirmDialog.request.personnelData?.category}
											</Badge>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Service</p>
											<p className='font-medium'>
												{confirmDialog.request.queue?.armOfService ||
													confirmDialog.request.personnelData?.armOfService ||
													"Unknown"}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Unit Information Card */}
							<Card>
								<CardHeader>
									<CardTitle className='text-base flex items-center gap-2'>
										<Home className='h-4 w-4' />
										Unit Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-xs text-muted-foreground'>Quarter</p>
											<p className='font-medium'>
												{confirmDialog.request.unitData?.quarterName}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Unit</p>
											<p className='font-medium'>
												{confirmDialog.request.unitData?.flatHouseRoomName}
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Type</p>
											<Badge variant='outline'>
												{confirmDialog.request.unitData?.accommodationType}
											</Badge>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Rooms</p>
											<p className='font-medium'>
												{confirmDialog.request.unitData?.noOfRooms} rooms
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Warning/Info Message */}
							<div
								className={`p-4 rounded-lg ${
									confirmDialog.type === "approve"
										? "bg-green-50 dark:bg-green-950"
										: "bg-amber-50 dark:bg-amber-950"
								}`}>
								<p className='text-sm'>
									{confirmDialog.type === "approve"
										? "Approving this request will allocate the unit to the personnel and update their status to 'Active Allocation'."
										: "Refusing this request will return the personnel to the queue at position #1 with priority status."}
								</p>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() =>
								setConfirmDialog({ ...confirmDialog, isOpen: false })
							}
							disabled={
								!!confirmDialog.request &&
								(loadingStates[`approve_${confirmDialog.request.id}`] ||
									loadingStates[`refuse_${confirmDialog.request.id}`])
							}>
							Cancel
						</Button>
						<Button
							variant={
								confirmDialog.type === "approve" ? "default" : "destructive"
							}
							onClick={handleConfirmAction}
							disabled={
								!confirmDialog.request ||
								loadingStates[`approve_${confirmDialog.request.id}`] ||
								loadingStates[`refuse_${confirmDialog.request.id}`]
							}
							className={
								confirmDialog.type === "approve"
									? "bg-green-600 hover:bg-green-700"
									: ""
							}>
							{confirmDialog.request &&
								(loadingStates[`approve_${confirmDialog.request.id}`] ||
									loadingStates[`refuse_${confirmDialog.request.id}`]) && (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								)}
							{confirmDialog.type === "approve"
								? loadingStates[`approve_${confirmDialog.request?.id}`]
									? "Approving..."
									: "Approve Allocation"
								: loadingStates[`refuse_${confirmDialog.request?.id}`]
								? "Refusing..."
								: "Refuse Allocation"}
						</Button>
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
