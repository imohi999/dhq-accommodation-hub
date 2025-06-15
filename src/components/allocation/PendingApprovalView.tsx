import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAllocation } from "@/hooks/useAllocation";
import { AllocationLetter } from "@/components/allocation/AllocationLetter";
import { APIAllocationRequest } from "@/src/app/(dashboard)/allocations/pending/page";

interface PendingApprovalViewProps {
	requests: APIAllocationRequest[];
}

export const PendingApprovalView = ({ requests }: PendingApprovalViewProps) => {
	const { approveAllocation, refuseAllocation } = useAllocation();
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

	const handleConfirmAction = async () => {
		if (confirmDialog.type === "approve") {
			await approveAllocation(confirmDialog.requestId);
		} else {
			// For refusal, we use the built-in refuseAllocation function
			const request = requests.find((r) => r.id === confirmDialog.requestId);
			if (request) {
				try {
					await refuseAllocation(
						confirmDialog.requestId,
						"Request refused and returned to queue"
					);
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
		(r) => r.personnel?.armOfService === "Army"
	).length;
	const navyRequests = requests.filter(
		(r) => r.personnel?.armOfService === "Navy"
	).length;
	const airForceRequests = requests.filter(
		(r) => r.personnel?.armOfService === "Air Force"
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
										r.personnel.armOfService === "Army" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnel.armOfService === "Army" &&
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
										r.personnel.armOfService === "Navy" &&
										r.personnelData.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnel.armOfService === "Navy" &&
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
										r.personnel.armOfService === "Air Force" &&
										r.personnelData?.category === "Officer"
								).length
							}{" "}
							| Men:{" "}
							{
								requests.filter(
									(r) =>
										r.personnel.armOfService === "Air Force" &&
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
													Svc No: {request.personnel.svcNo} •{" "}
													{request.personnel.currentUnit || "Naval Academy"} •{" "}
													{request.personnel.appointment ||
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

										<Button
											variant='default'
											size='sm'
											onClick={() => handleApproveClick(request)}
											className='flex items-center gap-2 bg-green-600 hover:bg-green-700'>
											<CheckCircle className='h-4 w-4' />
											Approval
										</Button>

										<Button
											variant='destructive'
											size='sm'
											onClick={() => handleRefuseClick(request)}
											className='flex items-center gap-2'>
											<XCircle className='h-4 w-4' />
											Refusal
										</Button>
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
						<Button
							variant={
								confirmDialog.type === "approve" ? "default" : "destructive"
							}
							onClick={handleConfirmAction}
							className={
								confirmDialog.type === "approve"
									? "bg-green-600 hover:bg-green-700"
									: ""
							}>
							{confirmDialog.type === "approve" ? "Approve" : "Refuse"}
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
