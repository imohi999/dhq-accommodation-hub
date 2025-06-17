import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Check, ChevronsUpDown } from "lucide-react";
import { Unit } from "@/types/queue";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}: QueueFiltersProps) => {
	const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);

	const handleResetFilters = () => {
		onSearchChange("");
		onGenderChange("all");
		onMaritalStatusChange("all");
		onCategoryChange("all");
		onUnitChange("all");
		onArmOfServiceChange("all");
		onDependentsChange("all");
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
					<Select value={armOfServiceFilter} onValueChange={onArmOfServiceChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Services' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Services</SelectItem>
							<SelectItem value='Army'>Army</SelectItem>
							<SelectItem value='Navy'>Navy</SelectItem>
							<SelectItem value='Air Force'>Air Force</SelectItem>
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
								variant="outline"
								role="combobox"
								aria-expanded={unitPopoverOpen}
								className="w-full justify-between font-normal"
							>
								{unitFilter === "all" 
									? "All Units" 
									: units.find((unit) => unit.name === unitFilter)?.name || "All Units"}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-full p-0">
							<Command>
								<CommandInput placeholder="Search units..." />
								<CommandEmpty>No unit found.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										value="all"
										onSelect={() => {
											onUnitChange("all");
											setUnitPopoverOpen(false);
										}}
									>
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
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													unitFilter === unit.name ? "opacity-100" : "opacity-0"
												)}
											/>
											{unit.name}
										</CommandItem>
									))}
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
		</div>
	);
};
