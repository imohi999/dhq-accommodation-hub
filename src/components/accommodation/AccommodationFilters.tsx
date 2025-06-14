
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { DHQLivingUnitWithHousingType, HousingType } from "@/types/accommodation";

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
  units: DHQLivingUnitWithHousingType[];
  housingTypes: HousingType[];
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
  units,
  housingTypes,
}: AccommodationFiltersProps) => {
  // Get unique values for filter options
  const uniqueQuarterNames = [...new Set(units.map(unit => unit.quarter_name))];
  const uniqueLocations = [...new Set(units.map(unit => unit.location))];
  const uniqueCategories = [...new Set(units.map(unit => unit.category))];
  const uniqueBlockNames = [...new Set(units.map(unit => unit.block_name))];
  const uniqueFlatHouseRooms = [...new Set(units.map(unit => unit.flat_house_room_name))];
  const uniqueUnitNames = [...new Set(units.map(unit => unit.unit_name).filter((name): name is string => name !== null))];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search all fields..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Select value={quarterNameFilter} onValueChange={onQuarterNameChange}>
          <SelectTrigger>
            <SelectValue placeholder="Quarter Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quarter Names</SelectItem>
            {uniqueQuarterNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={onLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={housingTypeFilter} onValueChange={onHousingTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Housing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Housing Types</SelectItem>
            {housingTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Vacant">Vacant</SelectItem>
            <SelectItem value="Occupied">Occupied</SelectItem>
            <SelectItem value="Not In Use">Not In Use</SelectItem>
          </SelectContent>
        </Select>

        <Select value={occupancyFilter} onValueChange={onOccupancyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Occupancy Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Occupancy Types</SelectItem>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Shared">Shared</SelectItem>
          </SelectContent>
        </Select>

        <Select value={blockNameFilter} onValueChange={onBlockNameChange}>
          <SelectTrigger>
            <SelectValue placeholder="Block Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Block Names</SelectItem>
            {uniqueBlockNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={flatHouseRoomFilter} onValueChange={onFlatHouseRoomChange}>
          <SelectTrigger>
            <SelectValue placeholder="Flat/House/Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flat/House/Room</SelectItem>
            {uniqueFlatHouseRooms.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={unitNameFilter} onValueChange={onUnitNameChange}>
          <SelectTrigger>
            <SelectValue placeholder="Unit Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Unit Names</SelectItem>
            {uniqueUnitNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
