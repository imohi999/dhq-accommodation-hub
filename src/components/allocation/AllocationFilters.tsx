import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface AllocationFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	categoryFilter: string;
	onCategoryChange: (value: string) => void;
	armOfServiceFilter: string;
	onArmOfServiceChange: (value: string) => void;
	quarterFilter?: string;
	onQuarterChange?: (value: string) => void;
	unitTypeFilter?: string;
	onUnitTypeChange?: (value: string) => void;
	availableQuarters?: string[];
	availableUnitTypes?: string[];
}

export const AllocationFilters = ({
	searchTerm,
	onSearchChange,
	categoryFilter,
	onCategoryChange,
	armOfServiceFilter,
	onArmOfServiceChange,
	quarterFilter,
	onQuarterChange,
	unitTypeFilter,
	onUnitTypeChange,
	availableQuarters = [],
	availableUnitTypes = [],
}: AllocationFiltersProps) => {
	const handleResetFilters = () => {
		onSearchChange("");
		onCategoryChange("all");
		onArmOfServiceChange("all");
		onQuarterChange?.("all");
		onUnitTypeChange?.("all");
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
							placeholder='Search by name, service number, or unit...'
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
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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

				{quarterFilter !== undefined && onQuarterChange && (
					<div className='space-y-2'>
						<Label>Quarter</Label>
						<Select value={quarterFilter} onValueChange={onQuarterChange}>
							<SelectTrigger>
								<SelectValue placeholder='All Quarters' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Quarters</SelectItem>
								{availableQuarters.map((quarter) => (
									<SelectItem key={quarter} value={quarter}>
										{quarter}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{unitTypeFilter !== undefined && onUnitTypeChange && (
					<div className='space-y-2'>
						<Label>Unit Type</Label>
						<Select value={unitTypeFilter} onValueChange={onUnitTypeChange}>
							<SelectTrigger>
								<SelectValue placeholder='All Unit Types' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Unit Types</SelectItem>
								{availableUnitTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>
		</div>
	);
};