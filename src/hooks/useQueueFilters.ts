
import { useState, useMemo } from "react";
import { QueueItem } from "@/types/queue";

export const useQueueFilters = (queueItems: QueueItem[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [maritalStatusFilter, setMaritalStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  // Filter logic
  const filteredItems = useMemo(() => {
    return queueItems.filter((item) => {
      const matchesSearch = searchTerm === "" ||
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesGender = genderFilter === "all" || item.gender === genderFilter;
      const matchesMaritalStatus = maritalStatusFilter === "all" || item.marital_status === maritalStatusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesUnit = unitFilter === "all" || item.current_unit === unitFilter;

      return matchesSearch && matchesGender && matchesMaritalStatus && matchesCategory && matchesUnit;
    });
  }, [queueItems, searchTerm, genderFilter, maritalStatusFilter, categoryFilter, unitFilter]);

  return {
    searchTerm,
    setSearchTerm,
    genderFilter,
    setGenderFilter,
    maritalStatusFilter,
    setMaritalStatusFilter,
    categoryFilter,
    setCategoryFilter,
    unitFilter,
    setUnitFilter,
    filteredItems
  };
};
