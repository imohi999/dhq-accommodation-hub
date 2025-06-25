import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { AccommodationType } from "@/types/accommodation";

interface FilterOptions {
	quarterNames: string[];
	locations: string[];
	categories: string[];
	blockNames: string[];
	flatHouseRoomNames: string[];
	unitNames: string[];
	statuses: string[];
	occupancyTypes: string[];
}

interface AccommodationFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	quarterNameFilter: string;
	onQuarterNameChange: (value: string) => void;
	locationFilter: string;
	onLocationChange: (value: string) => void;
	categoryFilter: string;
	onCategoryChange: (value: string) => void;
	housingTypeFilter: string;
	onHousingTypeChange: (value: string) => void;
	statusFilter: string;
	onStatusChange: (value: string) => void;
	occupancyFilter: string;
	onOccupancyChange: (value: string) => void;
	blockNameFilter: string;
	onBlockNameChange: (value: string) => void;
	flatHouseRoomFilter: string;
	onFlatHouseRoomChange: (value: string) => void;
	unitNameFilter: string;
	onUnitNameChange: (value: string) => void;
	filterOptions: FilterOptions;
	housingTypes: AccommodationType[];
}

export const AccommodationFilters = ({
	searchTerm,
	onSearchChange,
	quarterNameFilter,
	onQuarterNameChange,
	locationFilter,
	onLocationChange,
	categoryFilter,
	onCategoryChange,
	housingTypeFilter,
	onHousingTypeChange,
	statusFilter,
	onStatusChange,
	occupancyFilter,
	onOccupancyChange,
	blockNameFilter,
	onBlockNameChange,
	flatHouseRoomFilter,
	onFlatHouseRoomChange,
	unitNameFilter,
	onUnitNameChange,
	filterOptions,
	housingTypes,
}: AccommodationFiltersProps) => {
	// Provide default values if filterOptions is not yet loaded or invalid
	const safeFilterOptions = (filterOptions && typeof filterOptions === 'object' && !Array.isArray(filterOptions))
		? filterOptions 
		: {
		quarterNames: [],
		locations: [],
		categories: [],
		blockNames: [],
		flatHouseRoomNames: [],
		unitNames: [],
		statuses: ['Vacant', 'Occupied', 'Not In Use'],
		occupancyTypes: ['Single', 'Shared'],
	};

	return (
		<div className='space-y-4'>
			{/* Search Bar */}
			<div className='relative'>
				<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Search all fields...'
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className='pl-8'
				/>
			</div>

			{/* Filters Grid */}
			<div className='grid gap-4 md:grid-cols-3 lg:grid-cols-5'>
				<Select value={quarterNameFilter} onValueChange={onQuarterNameChange}>
					<SelectTrigger>
						<SelectValue placeholder='Quarter Name' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Quarter Names</SelectItem>
						{safeFilterOptions.quarterNames.map((name, index) => (
							<SelectItem key={index} value={name}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={locationFilter} onValueChange={onLocationChange}>
					<SelectTrigger>
						<SelectValue placeholder='Location' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Locations</SelectItem>
						{safeFilterOptions.locations.map((location, index) => (
							<SelectItem key={index} value={location}>
								{location}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={categoryFilter} onValueChange={onCategoryChange}>
					<SelectTrigger>
						<SelectValue placeholder='Category' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Categories</SelectItem>
						{safeFilterOptions.categories.map((category, index) => (
							<SelectItem key={index} value={category}>
								{category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={housingTypeFilter} onValueChange={onHousingTypeChange}>
					<SelectTrigger>
						<SelectValue placeholder='Accommodation Type' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Accommodation Types</SelectItem>
						{housingTypes.map((type, index) => (
							<SelectItem key={index} value={type.id}>
								{type.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={statusFilter} onValueChange={onStatusChange}>
					<SelectTrigger>
						<SelectValue placeholder='Status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Status</SelectItem>
						<SelectItem value='Vacant'>Vacant</SelectItem>
						<SelectItem value='Occupied'>Occupied</SelectItem>
						<SelectItem value='Not In Use'>Not In Use</SelectItem>
					</SelectContent>
				</Select>

				<Select value={occupancyFilter} onValueChange={onOccupancyChange}>
					<SelectTrigger>
						<SelectValue placeholder='Occupancy Type' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Occupancy Types</SelectItem>
						<SelectItem value='Single'>Single</SelectItem>
						<SelectItem value='Shared'>Shared</SelectItem>
					</SelectContent>
				</Select>

				<Select value={blockNameFilter} onValueChange={onBlockNameChange}>
					<SelectTrigger>
						<SelectValue placeholder='Block Name' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Block Names</SelectItem>
						{safeFilterOptions.blockNames.map((name, index) => (
							<SelectItem key={index} value={name}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={flatHouseRoomFilter}
					onValueChange={onFlatHouseRoomChange}>
					<SelectTrigger>
						<SelectValue placeholder='Flat/House/Room' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Flat/House/Room</SelectItem>
						{safeFilterOptions.flatHouseRoomNames.map((name, index) => (
							<SelectItem key={index} value={name}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={unitNameFilter} onValueChange={onUnitNameChange}>
					<SelectTrigger>
						<SelectValue placeholder='Quarters Name' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Quarters Names</SelectItem>
						{safeFilterOptions.unitNames.map((name, index) => (
							<SelectItem key={index} value={name}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
