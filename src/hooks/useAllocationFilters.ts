import { useState, useMemo } from "react";

export const useAllocationFilters = <T extends Record<string, any>>(
	items: T[],
	getSearchableFields: (item: T) => string[],
	getServiceFromItem: (item: T) => string,
	getCategoryFromItem: (item: T) => string,
	getQuarterFromItem?: (item: T) => string,
	getUnitTypeFromItem?: (item: T) => string
) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [armOfServiceFilter, setArmOfServiceFilter] = useState("all");
	const [quarterFilter, setQuarterFilter] = useState("all");
	const [unitTypeFilter, setUnitTypeFilter] = useState("all");

	// Get unique quarters and unit types
	const availableQuarters = useMemo(() => {
		if (!getQuarterFromItem) return [];
		const quarters = new Set<string>();
		items.forEach((item) => {
			const quarter = getQuarterFromItem(item);
			if (quarter) quarters.add(quarter);
		});
		return Array.from(quarters).sort();
	}, [items, getQuarterFromItem]);

	const availableUnitTypes = useMemo(() => {
		if (!getUnitTypeFromItem) return [];
		const types = new Set<string>();
		items.forEach((item) => {
			const type = getUnitTypeFromItem(item);
			if (type) types.add(type);
		});
		return Array.from(types).sort();
	}, [items, getUnitTypeFromItem]);

	// Filter logic
	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			// Search filter
			const matchesSearch =
				searchTerm === "" ||
				getSearchableFields(item).some((field) =>
					field?.toLowerCase().includes(searchTerm.toLowerCase())
				);

			// Service filter
			const matchesService =
				armOfServiceFilter === "all" ||
				getServiceFromItem(item) === armOfServiceFilter;

			// Category filter
			const matchesCategory =
				categoryFilter === "all" ||
				getCategoryFromItem(item) === categoryFilter;

			// Quarter filter
			const matchesQuarter =
				!getQuarterFromItem ||
				quarterFilter === "all" ||
				getQuarterFromItem(item) === quarterFilter;

			// Unit type filter
			const matchesUnitType =
				!getUnitTypeFromItem ||
				unitTypeFilter === "all" ||
				getUnitTypeFromItem(item) === unitTypeFilter;

			return (
				matchesSearch &&
				matchesService &&
				matchesCategory &&
				matchesQuarter &&
				matchesUnitType
			);
		});
	}, [
		items,
		searchTerm,
		armOfServiceFilter,
		categoryFilter,
		quarterFilter,
		unitTypeFilter,
		getSearchableFields,
		getServiceFromItem,
		getCategoryFromItem,
		getQuarterFromItem,
		getUnitTypeFromItem,
	]);

	return {
		searchTerm,
		setSearchTerm,
		categoryFilter,
		setCategoryFilter,
		armOfServiceFilter,
		setArmOfServiceFilter,
		quarterFilter,
		setQuarterFilter,
		unitTypeFilter,
		setUnitTypeFilter,
		filteredItems,
		availableQuarters,
		availableUnitTypes,
	};
};