"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, FileText, ClipboardCheck } from "lucide-react";
import { useClearanceData } from "@/hooks/useClearanceData";
import { LoadingState } from "@/components/ui/spinner";
import { InspectionModal } from "./InspectionModal";
import { ClearanceLetter } from "./ClearanceLetter";
import { format } from "date-fns";

export function ClearanceView() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
	const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
	const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

	const { data, isLoading, mutate } = useClearanceData();

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

	const filteredData = data?.filter((allocation: any) => {
		const searchLower = searchTerm.toLowerCase();
		const personnelData = allocation.personnel_data;

		return (
			personnelData?.serviceNumber?.toLowerCase().includes(searchLower) ||
			personnelData?.fullName?.toLowerCase().includes(searchLower) ||
			allocation.unit_data?.unitName?.toLowerCase().includes(searchLower) ||
			allocation.unit_data?.quarterName?.toLowerCase().includes(searchLower)
		);
	});

	const handleInspectionComplete = () => {
		mutate();
		setIsInspectionModalOpen(false);
	};

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='container mx-auto py-6 space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl font-bold'>
						Clearance Management
					</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Manage accommodation clearance inspections and generate clearance
						letters
					</p>
				</CardHeader>
				<CardContent>
					<div className='mb-4'>
						<div className='relative'>
							<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by service number, name, or unit...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8'
							/>
						</div>
					</div>

					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Service No</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Unit</TableHead>
									<TableHead>Allocation Period</TableHead>
									<TableHead>Inspections</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredData?.map((allocation: any) => {
									const personnelData = allocation.personnel_data;
									const unitData = allocation.unit_data;
									const hasInspection =
										Array.isArray(allocation.clearance_inspections) &&
										allocation.clearance_inspections.length > 0;
									const latestInspection = hasInspection
										? allocation.clearance_inspections[
												allocation.clearance_inspections.length - 1
										  ]
										: null;

									return (
										<TableRow key={allocation.id}>
											<TableCell className='font-medium'>
												{personnelData?.serviceNumber}
											</TableCell>
											<TableCell>
												<div>
													<p className='font-medium'>
														{personnelData?.fullName}
													</p>
													<p className='text-sm text-muted-foreground'>
														{personnelData?.rank} - {personnelData?.category}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<p className='font-medium'>{unitData?.unitName}</p>
													<p className='text-sm text-muted-foreground'>
														{unitData?.quarterName}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className='text-sm'>
													<p>
														{formatSafeDate(allocation.allocation_start_date)} -
														{formatSafeDate(
															allocation.allocation_end_date,
															"Present"
														)}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{hasInspection ? (
													<div className='space-y-1'>
														<Badge
															variant='outline'
															className='bg-green-50 text-green-700 border-green-200'>
															Inspected
														</Badge>
														<p className='text-xs text-muted-foreground'>
															{formatSafeDate(
																latestInspection?.inspection_date
															)}
														</p>
														<p className='text-xs text-muted-foreground'>
															by {latestInspection?.inspector_name}
														</p>
													</div>
												) : (
													<Badge
														variant='outline'
														className='bg-orange-50 text-orange-700 border-orange-200'>
														Pending
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<div className='flex gap-2'>
													<Button
														size='sm'
														variant='outline'
														onClick={() => {
															setSelectedAllocation(allocation);
															setIsInspectionModalOpen(true);
														}}>
														<ClipboardCheck className='h-4 w-4 mr-1' />
														{hasInspection ? "View" : "Inspect"}
													</Button>
													{hasInspection && (
														<Button
															size='sm'
															onClick={() => {
																setSelectedAllocation(allocation);
																setIsLetterModalOpen(true);
															}}>
															<FileText className='h-4 w-4 mr-1' />
															Clearance Letter
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{selectedAllocation && (
				<>
					<InspectionModal
						isOpen={isInspectionModalOpen}
						onClose={() => setIsInspectionModalOpen(false)}
						allocation={selectedAllocation}
						onComplete={handleInspectionComplete}
					/>

					<ClearanceLetter
						isOpen={isLetterModalOpen}
						onClose={() => setIsLetterModalOpen(false)}
						allocation={selectedAllocation}
					/>
				</>
			)}
		</div>
	);
}
