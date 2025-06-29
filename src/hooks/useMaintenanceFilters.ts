import { useState, useMemo } from "react";

export const useMaintenanceFilters = <T extends Record<string, any>>(
	items: T[],
	getSearchableFields: (item: T) => string[],
	getStatusFromItem: (item: T) => string,
	getPriorityFromItem?: (item: T) => string,
	getCategoryFromItem?: (item: T) => string,
	getQuarterFromItem?: (item: T) => string,
	getLocationFromItem?: (item: T) => string
) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [quarterFilter, setQuarterFilter] = useState("all");
	const [locationFilter, setLocationFilter] = useState("all");

	// Get unique quarters
	const availableQuarters = useMemo(() => {
		if (!getQuarterFromItem) return [];
		const quarters = new Set<string>();
		items.forEach((item) => {
			const quarter = getQuarterFromItem(item);
			if (quarter) quarters.add(quarter);
		});
		return Array.from(quarters).sort();
	}, [items, getQuarterFromItem]);

	// Get unique locations
	const availableLocations = useMemo(() => {
		if (!getLocationFromItem) return [];
		const locations = new Set<string>();
		items.forEach((item) => {
			const location = getLocationFromItem(item);
			if (location) locations.add(location);
		});
		return Array.from(locations).sort();
	}, [items, getLocationFromItem]);

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

			// Quarter filter
			const matchesQuarter =
				!getQuarterFromItem ||
				quarterFilter === "all" ||
				getQuarterFromItem(item) === quarterFilter;

			// Location filter
			const matchesLocation =
				!getLocationFromItem ||
				locationFilter === "all" ||
				getLocationFromItem(item) === locationFilter;

			return (
				matchesSearch &&
				matchesStatus &&
				matchesPriority &&
				matchesCategory &&
				matchesQuarter &&
				matchesLocation
			);
		});
	}, [
		items,
		searchTerm,
		statusFilter,
		priorityFilter,
		categoryFilter,
		quarterFilter,
		locationFilter,
		getSearchableFields,
		getStatusFromItem,
		getPriorityFromItem,
		getCategoryFromItem,
		getQuarterFromItem,
		getLocationFromItem,
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
		quarterFilter,
		setQuarterFilter,
		locationFilter,
		setLocationFilter,
		filteredItems,
		availableQuarters,
		availableLocations,
		availableCategories,
	};
};