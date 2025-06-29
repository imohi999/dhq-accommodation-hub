import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { useAllUnits } from "@/hooks/useAllUnits";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

interface MaintenanceRequest {
	id: string;
	unitId: string;
	unitName: string;
	issueCategory: string;
	issueDescription: string;
	priorityLevel: string;
	reportedBy: string;
	reportedAt: string;
	status: string;
	remarks: string;
	createdAt: string;
	updatedAt: string;
}

const ISSUE_CATEGORIES = [
	"Plumbing",
	"Electrical",
	"HVAC",
	"Structural",
	"Appliance",
	"Security",
	"Other",
];
const PRIORITIES = ["Low", "Medium", "High", "Emergency"];
const STATUSES = ["Pending", "In Progress", "Completed", "Rejected"];

export function MaintenanceRequestForm({
	initial,
	onClose,
	onComplete,
}: {
	initial?: MaintenanceRequest | null;
	onClose?: () => void;
	onComplete?: () => void;
}) {
	const [form, setForm] = useState({
		issueCategory: "",
		issueDescription: "",
		priorityLevel: "Medium",
		reportedBy: "",
		reportedAt: "",
		status: "Pending",
		remarks: "",
	});
	const [selectedUnit, setSelectedUnit] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [quarterNameFilter, setQuarterNameFilter] = useState("all");
	const [locationFilter, setLocationFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	const { units, loading } = useAllUnits();

	// Extract unique filter options from units
	const filterOptions = {
		quarterNames: [...new Set(units.map(u => u.quarterName).filter(Boolean))].sort(),
		locations: [...new Set(units.map(u => u.location).filter(Boolean))].sort(),
		statuses: [...new Set(units.map(u => u.status).filter(Boolean))].sort()
	};

	// Filter units based on search term and filters
	const filteredUnits = units.filter((unit) => {
		// Search filter
		const matchesSearch = !searchTerm || (
			unit.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.quarterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.blockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			unit.flatHouseRoomName?.toLowerCase().includes(searchTerm.toLowerCase())
		);

		// Quarter name filter
		const matchesQuarter = quarterNameFilter === "all" || unit.quarterName === quarterNameFilter;

		// Location filter
		const matchesLocation = locationFilter === "all" || unit.location === locationFilter;

		// Status filter
		const matchesStatus = statusFilter === "all" || unit.status === statusFilter;

		return matchesSearch && matchesQuarter && matchesLocation && matchesStatus;
	});

	useEffect(() => {
		if (initial) {
			setForm({
				issueCategory: initial.issueCategory || "",
				issueDescription: initial.issueDescription || "",
				priorityLevel: initial.priorityLevel || "Medium",
				reportedBy: initial.reportedBy || "",
				reportedAt: initial.reportedAt,
				status: initial.status || "Pending",
				remarks: initial.remarks || "",
			});
			setSelectedUnit(initial.unitId);
		} else {
			setForm({
				issueCategory: "",
				issueDescription: "",
				priorityLevel: "Medium",
				reportedBy: "",
				reportedAt: "",
				status: "Pending",
				remarks: "",
			});
			setSelectedUnit("");
		}
	}, [initial]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!selectedUnit) {
			toast.error("Please select a unit");
			return;
		}

		setSubmitting(true);

		const unit = units.find((u) => u.id === selectedUnit);
		const submitData = {
			...form,
			unitId: selectedUnit,
			unitName: unit?.unitName || "",
			recordType: "request",
		};

		try {
			let response;
			if (initial && initial.id) {
				response = await fetch(`/api/maintenance/requests/${initial.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(submitData),
				});
			} else {
				response = await fetch("/api/maintenance/requests", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(submitData),
				});
			}

			if (!response.ok) throw new Error("Failed to save request");

			toast.success(
				initial
					? "Request updated successfully"
					: "Request created successfully"
			);
			if (onComplete) onComplete();
		} catch (error) {
			console.error("Error saving request:", error);
			toast.error("Failed to save request");
		}

		setSubmitting(false);
	}

	if (loading) {
		return <div className='p-6 text-muted-foreground'>Loading units...</div>;
	}

	return (
		<div className='bg-white dark:bg-card border rounded-lg p-6 mb-6 space-y-6 shadow-lg'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<Label>Issue Category</Label>
					<Select
						value={form.issueCategory}
						onValueChange={(val) =>
							setForm((f) => ({ ...f, issueCategory: val }))
						}
						required>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select Category' />
						</SelectTrigger>
						<SelectContent>
							{ISSUE_CATEGORIES.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					</div>
					<div>
						<Label>Priority Level</Label>
					<Select
						value={form.priorityLevel}
						onValueChange={(val) =>
							setForm((f) => ({ ...f, priorityLevel: val }))
						}
						required>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select Priority' />
						</SelectTrigger>
						<SelectContent>
							{PRIORITIES.map((priority) => (
								<SelectItem key={priority} value={priority}>
									{priority}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<Label>Status</Label>
					<Select
						value={form.status}
						onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
						required>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select Status' />
						</SelectTrigger>
						<SelectContent>
							{STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					</div>
					<div>
						<Label>Reported By</Label>
						<Input
							value={form.reportedBy}
							onChange={(e) =>
								setForm((f) => ({ ...f, reportedBy: e.target.value }))
							}
							required
							autoComplete='off'
						/>
					</div>
				</div>

				<div>
					<Label>Issue Description</Label>
				<Textarea
					value={form.issueDescription}
					onChange={(e) =>
						setForm((f) => ({ ...f, issueDescription: e.target.value }))
					}
					required
				/>
				</div>

				<div>
					<Label>Remarks</Label>
					<Input
						value={form.remarks}
						onChange={(e) =>
							setForm((f) => ({ ...f, remarks: e.target.value }))
						}
						autoComplete='off'
					/>
				</div>

				<div className='flex gap-2'>
				<LoadingButton
					type='submit'
					loading={submitting}
					loadingText={initial ? "Updating..." : "Creating..."}>
						{initial ? "Update Request" : "Create Request"}
					</LoadingButton>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						disabled={submitting}>
						Cancel
					</Button>
				</div>
			</form>

			{!initial && (
				<div className='border-t pt-6'>
					<h3 className='text-lg font-semibold mb-4'>Select Quarter</h3>

					{/* Search Bar */}
					<div className='mb-4'>
						<Label htmlFor='search' className='mb-2'>Search Quarters</Label>
						<Input
							id='search'
							type='text'
							placeholder='Search by quarter name, location, block, or room...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full'
						/>
					</div>

					{/* Filters */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-4'>
						<div>
							<Label className='text-xs text-muted-foreground mb-1'>Quarter Name</Label>
							<Select
								value={quarterNameFilter}
								onValueChange={setQuarterNameFilter}>
								<SelectTrigger className='w-full h-9'>
									<SelectValue placeholder='All Quarters' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Quarters</SelectItem>
									{filterOptions.quarterNames.map((name) => (
										<SelectItem key={name} value={name}>
											{name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label className='text-xs text-muted-foreground mb-1'>Location</Label>
							<Select
								value={locationFilter}
								onValueChange={setLocationFilter}>
								<SelectTrigger className='w-full h-9'>
									<SelectValue placeholder='All Locations' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Locations</SelectItem>
									{filterOptions.locations.map((location) => (
										<SelectItem key={location} value={location}>
											{location}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label className='text-xs text-muted-foreground mb-1'>Status</Label>
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}>
								<SelectTrigger className='w-full h-9'>
									<SelectValue placeholder='All Statuses' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Statuses</SelectItem>
									{filterOptions.statuses.map((status) => (
										<SelectItem key={status} value={status}>
											<Badge 
												variant={status === 'Vacant' ? 'outline' : 'secondary'}
												className='text-xs'>
												{status}
											</Badge>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Selected Unit Display */}
					{selectedUnit && (
						<div className='mb-4 p-3 bg-muted/50 rounded-lg'>
							<p className='text-sm font-medium'>Selected Unit:</p>
							<p className='text-sm text-muted-foreground'>
								{units.find(u => u.id === selectedUnit)?.unitName} - 
								{units.find(u => u.id === selectedUnit)?.quarterName}
							</p>
						</div>
					)}

					<div className='mb-2'>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-muted-foreground'>
								{(searchTerm || quarterNameFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'all') && (
									<>
										Showing {filteredUnits.length} of {units.length} quarters
									</>
								)}
							</span>
							{(quarterNameFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'all') && (
								<Button
									variant='ghost'
									size='sm'
									onClick={() => {
										setQuarterNameFilter('all');
										setLocationFilter('all');
										setStatusFilter('all');
										setSearchTerm('');
									}}
									className='h-7 px-2 text-xs'>
									Clear filters
								</Button>
							)}
						</div>
					</div>

					<div className='max-h-64 overflow-y-auto border rounded-lg'>
						{filteredUnits.length === 0 ? (
							<div className='p-8 text-center text-muted-foreground'>
								{searchTerm ? (
									<>
										<p>No quarters match your search criteria</p>
										<p className='text-sm mt-2'>Try adjusting your search terms</p>
									</>
								) : (
									<p>No quarters available</p>
								)}
							</div>
						) : (
							<div className='grid gap-2 p-4'>
								{filteredUnits.map((unit: DHQLivingUnitWithHousingType) => (
									<div 
										key={unit.id} 
										className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
											selectedUnit === unit.id ? 'bg-muted' : ''
										}`}
										onClick={() => setSelectedUnit(unit.id)}>
										<Checkbox
											id={unit.id}
											checked={selectedUnit === unit.id}
											onCheckedChange={() => setSelectedUnit(unit.id)}
										/>
										<label htmlFor={unit.id} className='text-sm flex-1 cursor-pointer'>
											{unit.unitName} - {unit.quarterName} ({unit.status})
										</label>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
