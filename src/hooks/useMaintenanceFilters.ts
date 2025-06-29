import { useState, useMemo } from "react";

export const useMaintenanceFilters = <T extends Record<string, any>>(
	items: T[],
	getSearchableFields: (item: T) => string[],
	getStatusFromItem: (item: T) => string,
	getPriorityFromItem?: (item: T) => string,
	getCategoryFromItem?: (item: T) => string,
	getUnitTypeFromItem?: (item: T) => string
) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [unitTypeFilter, setUnitTypeFilter] = useState("all");

	// Get unique unit types and categories
	const availableUnitTypes = useMemo(() => {
		if (!getUnitTypeFromItem) return [];
		const unitTypes = new Set<string>();
		items.forEach((item) => {
			const unitType = getUnitTypeFromItem(item);
			if (unitType) unitTypes.add(unitType);
		});
		return Array.from(unitTypes).sort();
	}, [items, getUnitTypeFromItem]);

	const availableCategories = useMemo(() => {
		if (!getCategoryFromItem) return [];
		const categories = new Set<string>();
		items.forEach((item) => {
			const category = getCategoryFromItem(item);
			if (category) categories.add(category);
		});
		return Array.from(categories).sort();
	}, [items, getCategoryFromItem]);

	// Filter logic
	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			// Search filter
			const matchesSearch =
				searchTerm === "" ||
				getSearchableFields(item).some((field) =>
					field?.toLowerCase().includes(searchTerm.toLowerCase())
				);

			// Status filter
			const matchesStatus =
				statusFilter === "all" ||
				getStatusFromItem(item) === statusFilter;

			// Priority filter
			const matchesPriority =
				!getPriorityFromItem ||
				priorityFilter === "all" ||
				getPriorityFromItem(item) === priorityFilter;

			// Category filter
			const matchesCategory =
				!getCategoryFromItem ||
				categoryFilter === "all" ||
				getCategoryFromItem(item) === categoryFilter;

			// Unit type filter
			const matchesUnitType =
				!getUnitTypeFromItem ||
				unitTypeFilter === "all" ||
				getUnitTypeFromItem(item) === unitTypeFilter;

			return (
				matchesSearch &&
				matchesStatus &&
				matchesPriority &&
				matchesCategory &&
				matchesUnitType
			);
		});
	}, [
		items,
		searchTerm,
		statusFilter,
		priorityFilter,
		categoryFilter,
		unitTypeFilter,
		getSearchableFields,
		getStatusFromItem,
		getPriorityFromItem,
		getCategoryFromItem,
		getUnitTypeFromItem,
	]);

	return {
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		priorityFilter,
		setPriorityFilter,
		categoryFilter,
		setCategoryFilter,
		unitTypeFilter,
		setUnitTypeFilter,
		filteredItems,
		availableUnitTypes,
		availableCategories,
	};
};