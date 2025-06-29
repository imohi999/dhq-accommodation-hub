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

interface MaintenanceFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusChange: (value: string) => void;
	priorityFilter?: string;
	onPriorityChange?: (value: string) => void;
	categoryFilter?: string;
	onCategoryChange?: (value: string) => void;
	unitTypeFilter?: string;
	onUnitTypeChange?: (value: string) => void;
	availableUnitTypes?: string[];
	availableCategories?: string[];
	isRequestView?: boolean;
}

export const MaintenanceFilters = ({
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusChange,
	priorityFilter,
	onPriorityChange,
	categoryFilter,
	onCategoryChange,
	unitTypeFilter,
	onUnitTypeChange,
	availableUnitTypes = [],
	availableCategories = [],
	isRequestView = false,
}: MaintenanceFiltersProps) => {
	const handleResetFilters = () => {
		onSearchChange("");
		onStatusChange("all");
		onPriorityChange?.("all");
		onCategoryChange?.("all");
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

			{/* First row: Search and Status */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
				<div className='space-y-2'>
					<Label htmlFor='search'>Search</Label>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
						<Input
							id='search'
							placeholder={isRequestView 
								? 'Search by unit, description, reporter...' 
								: 'Search by unit, task name, description...'
							}
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>

				<div className='space-y-2'>
					<Label>Status</Label>
					<Select value={statusFilter} onValueChange={onStatusChange}>
						<SelectTrigger>
							<SelectValue placeholder='All Statuses' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Statuses</SelectItem>
							{isRequestView ? (
								<>
									<SelectItem value='Pending'>Pending</SelectItem>
									<SelectItem value='In Progress'>In Progress</SelectItem>
									<SelectItem value='Completed'>Completed</SelectItem>
									<SelectItem value='Rejected'>Rejected</SelectItem>
								</>
							) : (
								<>
									<SelectItem value='Pending'>Pending</SelectItem>
									<SelectItem value='Overdue'>Overdue</SelectItem>
									<SelectItem value='Completed'>Completed</SelectItem>
								</>
							)}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Second row: Other filters */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{priorityFilter !== undefined && onPriorityChange && (
					<div className='space-y-2'>
						<Label>Priority</Label>
						<Select value={priorityFilter} onValueChange={onPriorityChange}>
							<SelectTrigger>
								<SelectValue placeholder='All Priorities' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Priorities</SelectItem>
								<SelectItem value='Emergency'>Emergency</SelectItem>
								<SelectItem value='High'>High</SelectItem>
								<SelectItem value='Medium'>Medium</SelectItem>
								<SelectItem value='Low'>Low</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}

				{categoryFilter !== undefined && onCategoryChange && (
					<div className='space-y-2'>
						<Label>Category</Label>
						<Select value={categoryFilter} onValueChange={onCategoryChange}>
							<SelectTrigger>
								<SelectValue placeholder='All Categories' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{availableCategories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
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
								{availableUnitTypes.map((unitType) => (
									<SelectItem key={unitType} value={unitType}>
										{unitType}
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