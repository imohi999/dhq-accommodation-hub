
import { useState, useMemo } from "react";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

export const useAccommodationFilters = (units: DHQLivingUnitWithHousingType[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quarterNameFilter, setQuarterNameFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [housingTypeFilter, setHousingTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [blockNameFilter, setBlockNameFilter] = useState("all");
  const [flatHouseRoomFilter, setFlatHouseRoomFilter] = useState("all");
  const [unitNameFilter, setUnitNameFilter] = useState("all");

  // Filter logic
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch = searchTerm === "" ||
        Object.values(unit).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesQuarterName = quarterNameFilter === "all" || unit.quarterName === quarterNameFilter;
      const matchesLocation = locationFilter === "all" || unit.location === locationFilter;
      const matchesCategory = categoryFilter === "all" || unit.category === categoryFilter;
      const matchesHousingType = housingTypeFilter === "all" || unit.accomodation_type_id === housingTypeFilter;
      const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
      const matchesOccupancy = occupancyFilter === "all" || unit.type_of_occupancy === occupancyFilter;
      const matchesBlockName = blockNameFilter === "all" || unit.blockName === blockNameFilter;
      const matchesFlatHouseRoom = flatHouseRoomFilter === "all" || unit.flat_house_room_name === flatHouseRoomFilter;
      const matchesUnitName = unitNameFilter === "all" || unit.unit_name === unitNameFilter;

      return matchesSearch && matchesQuarterName && matchesLocation && matchesCategory &&
        matchesHousingType && matchesStatus && matchesOccupancy && matchesBlockName &&
        matchesFlatHouseRoom && matchesUnitName;
    });
  }, [units, searchTerm, quarterNameFilter, locationFilter, categoryFilter, housingTypeFilter,
    statusFilter, occupancyFilter, blockNameFilter, flatHouseRoomFilter, unitNameFilter]);

  return {
    searchTerm,
    setSearchTerm,
    quarterNameFilter,
    setQuarterNameFilter,
    locationFilter,
    setLocationFilter,
    categoryFilter,
    setCategoryFilter,
    housingTypeFilter,
    setHousingTypeFilter,
    statusFilter,
    setStatusFilter,
    occupancyFilter,
    setOccupancyFilter,
    blockNameFilter,
    setBlockNameFilter,
    flatHouseRoomFilter,
    setFlatHouseRoomFilter,
    unitNameFilter,
    setUnitNameFilter,
    filteredUnits
  };
};
