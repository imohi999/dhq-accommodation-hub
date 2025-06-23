import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, RotateCcw, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Unit } from "@/types/queue";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface QueueFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	genderFilter: string;
	onGenderChange: (value: string) => void;
	maritalStatusFilter: string;
	onMaritalStatusChange: (value: string) => void;
	categoryFilter: string;
	onCategoryChange: (value: string) => void;
	unitFilter: string;
	onUnitChange: (value: string) => void;
	armOfServiceFilter: string;
	onArmOfServiceChange: (value: string) => void;
	dependentsFilter: string;
	onDependentsChange: (value: string) => void;
	units: Unit[];
	onUnitsRefresh?: () => void;
}

export const QueueFilters = ({
	searchTerm,
	onSearchChange,
	genderFilter,
	onGenderChange,
	maritalStatusFilter,
	onMaritalStatusChange,
	categoryFilter,
	onCategoryChange,
	unitFilter,
	onUnitChange,
	armOfServiceFilter,
	onArmOfServiceChange,
	dependentsFilter,
	onDependentsChange,
	units,
	onUnitsRefresh,
}: QueueFiltersProps) => {
	const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
	const [createUnitDialogOpen, setCreateUnitDialogOpen] = useState(false);
	const [newUnitName, setNewUnitName] = useState("");
	const [newUnitDescription, setNewUnitDescription] = useState("");
	const [isCreatingUnit, setIsCreatingUnit] = useState(false);

	const handleResetFilters = () => {
		onSearchChange("");
		onGenderChange("all");
		onMaritalStatusChange("all");
		onCategoryChange("all");
		onUnitChange("all");
		onArmOfServiceChange("all");
		onDependentsChange("all");
	};

	const handleCreateUnit = async () => {
		if (!newUnitName.trim()) {
			toast.error("Unit name is required");
			return;
		}

		setIsCreatingUnit(true);
		try {
			const response = await fetch("/api/units/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: newUnitName.trim(),
					description: newUnitDescription.trim() || null,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create unit");
			}

			const newUnit = await response.json();
			toast.success(`Unit "${newUnit.name}" created successfully`);

			// Reset form
			setNewUnitName("");
			setNewUnitDescription("");
			setCreateUnitDialogOpen(false);

			// Select the newly created unit
			onUnitChange(newUnit.name);

			// Refresh units list
			if (onUnitsRefresh) {
				onUnitsRefresh();
			}
		} catch (error) {
			console.error("Error creating unit:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create unit"
			);
		} finally {
			setIsCreatingUnit(false);
		}
	};

	return (
		<div className='bg-white dark:bg-card p-6 rounded-lg border mb-6'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-lg font-semibold'>Filters</h3>
				<Button
					variant='outline'
					size='sm'
					onClick={handleResetFilters}
					className='flex items-center gap-2'>
					<RotateCcw className='h-4 w-4' />
					Reset Filters
				</Button>
			</div>

			{/* First row: Search and Service Branch */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
				<div className='space-y-2'>
					<Label htmlFor='search'>Search</Label>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
						<Input
							id='search'
							placeholder='Search by any field...'
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>

				<div className='space-y-2'>
					<Label>Service Branch</Label>
					<Select
						value={armOfServiceFilter}
						onValueChange={onArmOfServiceChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Services' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Services</SelectItem>
							<SelectItem value='Nigerian Army'>Nigerian Army</SelectItem>
							<SelectItem value='Nigerian Navy'>Nigerian Navy</SelectItem>
							<SelectItem value='Nigerian Air Force'>
								Nigerian Air Force
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Second row: Other filters */}
			<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
				<div className='space-y-2'>
					<Label>Category</Label>
					<Select value={categoryFilter} onValueChange={onCategoryChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Categories' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Categories</SelectItem>
							<SelectItem value='NCOs'>NCOs</SelectItem>
							<SelectItem value='Officer'>Officer</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label>Current Unit</Label>
					<Popover open={unitPopoverOpen} onOpenChange={setUnitPopoverOpen}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={unitPopoverOpen}
								className='w-full justify-between font-normal'>
								{unitFilter === "all"
									? "All Units"
									: units.find((unit) => unit.name === unitFilter)?.name ||
									  "All Units"}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search units...' />
								<CommandEmpty>No unit found.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										value='all'
										onSelect={() => {
											onUnitChange("all");
											setUnitPopoverOpen(false);
										}}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												unitFilter === "all" ? "opacity-100" : "opacity-0"
											)}
										/>
										All Units
									</CommandItem>
									{units.map((unit) => (
										<CommandItem
											key={unit.id}
											value={unit.name}
											onSelect={(currentValue) => {
												onUnitChange(currentValue);
												setUnitPopoverOpen(false);
											}}>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													unitFilter === unit.name ? "opacity-100" : "opacity-0"
												)}
											/>
											{unit.name}
										</CommandItem>
									))}
									{/* Always show Create New Unit button at the end */}
									<div className='px-2 py-1 border-t'>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => {
												setCreateUnitDialogOpen(true);
												setUnitPopoverOpen(false);
											}}
											className='w-full justify-start text-sm h-8'>
											<Plus className='h-4 w-4 mr-2' />
											Create New Unit
										</Button>
									</div>
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<div className='space-y-2'>
					<Label>Marital Status</Label>
					<Select
						value={maritalStatusFilter}
						onValueChange={onMaritalStatusChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Status</SelectItem>
							<SelectItem value='Single'>Single</SelectItem>
							<SelectItem value='Married'>Married</SelectItem>
							<SelectItem value='Divorced'>Divorced</SelectItem>
							<SelectItem value='Widowed'>Widowed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label>Dependents</Label>
					<Select value={dependentsFilter} onValueChange={onDependentsChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Personnel' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Personnel</SelectItem>
							<SelectItem value='with'>With Dependents</SelectItem>
							<SelectItem value='without'>Without Dependents</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label>Gender</Label>
					<Select value={genderFilter} onValueChange={onGenderChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Genders' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Genders</SelectItem>
							<SelectItem value='Male'>Male</SelectItem>
							<SelectItem value='Female'>Female</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Create Unit Dialog */}
			<Dialog
				open={createUnitDialogOpen}
				onOpenChange={setCreateUnitDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Unit</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='unit-name'>Unit Name</Label>
							<Input
								id='unit-name'
								value={newUnitName}
								onChange={(e) => setNewUnitName(e.target.value)}
								placeholder='Enter unit name...'
								disabled={isCreatingUnit}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='unit-description'>Description (Optional)</Label>
							<Textarea
								id='unit-description'
								value={newUnitDescription}
								onChange={(e) => setNewUnitDescription(e.target.value)}
								placeholder='Enter unit description...'
								disabled={isCreatingUnit}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setCreateUnitDialogOpen(false);
								setNewUnitName("");
								setNewUnitDescription("");
							}}
							disabled={isCreatingUnit}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateUnit}
							disabled={isCreatingUnit || !newUnitName.trim()}>
							{isCreatingUnit ? "Creating..." : "Create Unit"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
