"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";

interface InspectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	allocation: any;
	onComplete: () => void;
}

export function InspectionModal({
	isOpen,
	onClose,
	allocation,
	onComplete,
}: InspectionModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [inspectionForm, setInspectionForm] = useState({
		inspector_svc_no: "",
		inspector_name: "",
		inspector_rank: "",
		inspector_category: "",
		inspector_appointment: "",
		inspection_date: format(new Date(), "yyyy-MM-dd"),
		remarks: "",
	});

	console.log({ allocation: JSON.stringify(allocation) });

	const [inventoryStatus, setInventoryStatus] = useState<
		Record<string, string>
	>({});

	const hasExistingInspection = allocation?.clearance_inspections?.length > 0;
	const latestInspection = hasExistingInspection
		? allocation.clearance_inspections[0]
		: null;

	// Safe date formatting function
	const formatSafeDate = (dateValue: any, defaultText = "N/A") => {
		if (!dateValue) return defaultText;
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return defaultText;
			return format(date, "dd MMM yyyy");
		} catch {
			return defaultText;
		}
	};

	const handleSubmit = async () => {
		if (!inspectionForm.inspector_svc_no || !inspectionForm.inspector_name) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/allocations/clearance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					past_allocation_id: allocation.id,
					...inspectionForm,
					inventory_status: inventoryStatus,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save inspection");
			}

			toast.success("Inspection logged successfully");
			onComplete();
		} catch (error) {
			console.error("Error saving inspection:", error);
			toast.error("Failed to save inspection");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{hasExistingInspection
							? "View Inspection"
							: "Log Clearance Inspection"}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Allocation Details */}
					<div className='bg-muted/50 p-4 rounded-lg'>
						<h3 className='font-semibold mb-2'>Allocation Details</h3>
						<div className='grid grid-cols-2 gap-2 text-sm'>
							<div>
								<span className='text-muted-foreground'>Personnel:</span>{" "}
								{allocation.personnelData?.rank ||
									allocation.personnel_data?.rank}{" "}
								{allocation.personnelData?.fullName ||
									allocation.personnel_data?.fullName}{" "}
								(
								{allocation.personnelData?.serviceNumber ||
									allocation.personnel_data?.serviceNumber}
								)
							</div>
							<div>
								<span className='text-muted-foreground'>Unit:</span>{" "}
								{allocation.unitData?.unitName ||
									allocation.unit_data?.unitName}{" "}
								-{" "}
								{allocation.unitData?.quarterName ||
									allocation.unit_data?.quarterName}
							</div>
							<div>
								<span className='text-muted-foreground'>Period:</span>{" "}
								{formatSafeDate(
									allocation.allocation_start_date ||
										allocation.allocationStartDate
								)}{" "}
								-
								{formatSafeDate(
									allocation.allocation_end_date ||
										allocation.allocationEndDate,
									"Present"
								)}
							</div>
						</div>
					</div>

					{/* Inventory List */}
					<div>
						<h3 className='font-semibold mb-2'>Inventory Inspection</h3>
						<div className='border rounded-lg'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Item Description</TableHead>
										<TableHead>Location</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Original Status</TableHead>
										<TableHead>Inspection Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{allocation.inventory?.map((item: any) => (
										<TableRow key={item.id}>
											<TableCell>{item.item_description}</TableCell>
											<TableCell>{item.item_location}</TableCell>
											<TableCell>{item.quantity}</TableCell>
											<TableCell>
												<Badge
													variant={
														item.item_status === "Functional"
															? "default"
															: "destructive"
													}
													className={
														item.item_status === "Functional"
															? "bg-green-100 text-green-800"
															: ""
													}>
													{item.item_status}
												</Badge>
											</TableCell>
											<TableCell>
												{hasExistingInspection ? (
													<Badge
														variant={
															latestInspection?.inventory_status?.[item.id] ===
															"Functional"
																? "default"
																: "destructive"
														}
														className={
															latestInspection?.inventory_status?.[item.id] ===
															"Functional"
																? "bg-green-100 text-green-800"
																: ""
														}>
														{latestInspection?.inventory_status?.[item.id] ||
															"Not Inspected"}
													</Badge>
												) : (
													<Select
														value={inventoryStatus[item.id] || ""}
														onValueChange={(value) =>
															setInventoryStatus((prev) => ({
																...prev,
																[item.id]: value,
															}))
														}>
														<SelectTrigger className='w-32'>
															<SelectValue placeholder='Select status' />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='Functional'>
																Functional
															</SelectItem>
															<SelectItem value='Non Functional'>
																Non Functional
															</SelectItem>
															<SelectItem value='Missing'>Missing</SelectItem>
														</SelectContent>
													</Select>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>

					{/* Inspector Information */}
					{hasExistingInspection ? (
						<div className='bg-muted/50 p-4 rounded-lg'>
							<h3 className='font-semibold mb-2'>Inspector Information</h3>
							<div className='grid grid-cols-2 gap-2 text-sm'>
								<div>
									<span className='text-muted-foreground'>Service No:</span>{" "}
									{latestInspection.inspector_svc_no}
								</div>
								<div>
									<span className='text-muted-foreground'>Name:</span>{" "}
									{latestInspection.inspector_name}
								</div>
								<div>
									<span className='text-muted-foreground'>Rank:</span>{" "}
									{latestInspection.inspector_rank}
								</div>
								<div>
									<span className='text-muted-foreground'>Category:</span>{" "}
									{latestInspection.inspector_category}
								</div>
								<div>
									<span className='text-muted-foreground'>Appointment:</span>{" "}
									{latestInspection.inspector_appointment}
								</div>
								<div>
									<span className='text-muted-foreground'>
										Inspection Date:
									</span>{" "}
									{formatSafeDate(latestInspection.inspection_date)}
								</div>
							</div>
							{latestInspection.remarks && (
								<div className='mt-2'>
									<span className='text-muted-foreground'>Remarks:</span>{" "}
									{latestInspection.remarks}
								</div>
							)}
						</div>
					) : (
						<div className='space-y-4'>
							<h3 className='font-semibold'>Inspector Information</h3>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='inspector_svc_no'>Service Number *</Label>
									<Input
										id='inspector_svc_no'
										value={inspectionForm.inspector_svc_no}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspector_svc_no: e.target.value,
											}))
										}
										placeholder='Enter service number'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='inspector_name'>Name *</Label>
									<Input
										id='inspector_name'
										value={inspectionForm.inspector_name}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspector_name: e.target.value,
											}))
										}
										placeholder='Enter inspector name'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='inspector_rank'>Rank *</Label>
									<Input
										id='inspector_rank'
										value={inspectionForm.inspector_rank}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspector_rank: e.target.value,
											}))
										}
										placeholder='Enter rank'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='inspector_category'>Category *</Label>
									<Input
										id='inspector_category'
										value={inspectionForm.inspector_category}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspector_category: e.target.value,
											}))
										}
										placeholder='Enter category'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='inspector_appointment'>Appointment *</Label>
									<Input
										id='inspector_appointment'
										value={inspectionForm.inspector_appointment}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspector_appointment: e.target.value,
											}))
										}
										placeholder='Enter appointment'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='inspection_date'>Inspection Date *</Label>
									<Input
										id='inspection_date'
										type='date'
										value={inspectionForm.inspection_date}
										onChange={(e) =>
											setInspectionForm((prev) => ({
												...prev,
												inspection_date: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='remarks'>Remarks</Label>
								<Textarea
									id='remarks'
									value={inspectionForm.remarks}
									onChange={(e) =>
										setInspectionForm((prev) => ({
											...prev,
											remarks: e.target.value,
										}))
									}
									placeholder='Enter any remarks...'
									rows={3}
								/>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className='flex justify-end gap-2'>
						<Button variant='outline' onClick={onClose}>
							{hasExistingInspection ? "Close" : "Cancel"}
						</Button>
						{!hasExistingInspection && (
							<LoadingButton onClick={handleSubmit} loading={isLoading}>
								Save Inspection
							</LoadingButton>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
