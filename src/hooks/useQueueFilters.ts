
import { useState, useMemo } from "react";
import { QueueItem } from "@/types/queue";

export const useQueueFilters = (queueItems: QueueItem[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [maritalStatusFilter, setMaritalStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [armOfServiceFilter, setArmOfServiceFilter] = useState("all");
  const [dependentsFilter, setDependentsFilter] = useState("all");
  const [imageFilter, setImageFilter] = useState("all");

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
      const matchesArmOfService = armOfServiceFilter === "all" || item.arm_of_service === armOfServiceFilter;
      
      // Dependents filter logic
      let matchesDependents = true;
      if (dependentsFilter === "with") {
        matchesDependents = (item.dependents && item.dependents.length > 0) || 
                           item.no_of_adult_dependents > 0 || 
                           item.no_of_child_dependents > 0;
      } else if (dependentsFilter === "without") {
        matchesDependents = (!item.dependents || item.dependents.length === 0) && 
                           item.no_of_adult_dependents === 0 && 
                           item.no_of_child_dependents === 0;
      }

      // Image filter logic
      let matchesImage = true;
      if (imageFilter === "with") {
        matchesImage = item.image_url !== null && item.image_url !== undefined && item.image_url !== '';
      } else if (imageFilter === "without") {
        matchesImage = item.image_url === null || item.image_url === undefined || item.image_url === '';
      }

      return matchesSearch && matchesGender && matchesMaritalStatus && 
             matchesCategory && matchesUnit && matchesArmOfService && matchesDependents && matchesImage;
    });
  }, [queueItems, searchTerm, genderFilter, maritalStatusFilter, categoryFilter, 
      unitFilter, armOfServiceFilter, dependentsFilter, imageFilter]);

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
    armOfServiceFilter,
    setArmOfServiceFilter,
    dependentsFilter,
    setDependentsFilter,
    imageFilter,
    setImageFilter,
    filteredItems
  };
};
