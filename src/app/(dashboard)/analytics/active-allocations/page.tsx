"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	Users,
	Home,
	UserCheck,
	Building,
	RefreshCw,
	Plus,
	Check,
	Printer,
} from "lucide-react";
import { chartStyles } from "@/components/analytics/chartStyles";
import { LoadingState } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ChartBuilder, ChartConfig } from "@/components/analytics/ChartBuilder";
import { DynamicChart } from "@/components/analytics/DynamicChart";
import {
	ChartSelectionManager,
	useChartSelection,
} from "@/components/analytics/ChartSelectionManager";

interface ActiveData {
	id: string;
	quarterName: string;
	location: string;
	category: string;
	accommodationTypeId: string;
	noOfRooms: number;
	status: string;
	typeOfOccupancy: string;
	bq: boolean;
	noOfRoomsInBq: number;
	blockName: string;
	flatHouseRoomName: string;
	unitName: string;
	blockImageUrl: string | null;
	currentOccupantId: string | null;
	currentOccupantName: string | null;
	currentOccupantRank: string | null;
	currentOccupantServiceNumber: string | null;
	occupancyStartDate: string | null;
	createdAt: string;
	updatedAt: string;
	accommodationType: {
		id: string;
		name: string;
		description: string;
		createdAt: string;
	};
	occupants: Array<{
		id: string;
		unitId: string;
		queueId: string;
		fullName: string;
		rank: string;
		serviceNumber: string;
		phone: string | null;
		email: string | null;
		emergencyContact: string | null;
		occupancyStartDate: string;
		isCurrent: boolean;
		createdAt: string;
		updatedAt: string;
		queue: {
			id: string;
			sequence: number;
			fullName: string;
			svcNo: string;
			gender: string;
			armOfService: string;
			category: string;
			rank: string;
			maritalStatus: string;
			noOfAdultDependents: number;
			noOfChildDependents: number;
			currentUnit: string | null;
			appointment: string | null;
			dateTos: string | null;
			dateSos: string | null;
			phone: string | null;
			entryDateTime: string;
			createdAt: string;
			updatedAt: string;
			dependents: Array<{
				name: string;
				age: number;
				gender: string;
			}> | null;
		};
	}>;
}

const COLORS = [
	"#8884d8",
	"#82ca9d",
	"#ffc658",
	"#ff7300",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#0088FE",
];


export default function ActiveAllocationsAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [activeData, setActiveData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

	// Chart selection state - must be defined before conditional returns
	const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [chartsInitialized, setChartsInitialized] = useState(false);

	useEffect(() => {
		fetchActiveData();
		// Load saved charts from localStorage
		const savedCharts = localStorage.getItem("activeAnalyticsCharts");
		if (savedCharts) {
			setCharts(JSON.parse(savedCharts));
		}
	}, []);

	const fetchActiveData = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/dhq-living-units?status=Occupied");
			const data = await response.json();

			const transformedActive = (
				Array.isArray(data) ? data : (data as any).data || []
			).map((item: ActiveData) => {
				const currentOccupant = item.occupants?.find((o) => o.isCurrent);
				const totalDependents =
					(currentOccupant?.queue?.noOfAdultDependents || 0) +
					(currentOccupant?.queue?.noOfChildDependents || 0);
				return {
					...item,
					armOfService: currentOccupant?.queue?.armOfService || "Unknown",
					rank: item.currentOccupantRank || "",
					maritalStatus: currentOccupant?.queue?.maritalStatus || "Unknown",
					personnelCategory:
						currentOccupant?.queue?.category || item.category || "Unknown",
					gender: currentOccupant?.queue?.gender || "Unknown",
					totalDependents,
					population: 1 + totalDependents,
					quarterName: item.quarterName || "Unknown",
					accommodationType: item.accommodationType?.name || "Unknown",
					hasBQ: item.bq ? "Yes" : "No",
					occupantName: item.currentOccupantName || "Unknown",
					serviceNumber: item.currentOccupantServiceNumber || "Unknown",
				};
			});

			setActiveData(transformedActive);
		} catch (error) {
			console.error("Failed to fetch active data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getOccupancyStats = () => {
		const totalPopulation = activeData.reduce((acc, unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			const adultDeps = currentOccupant?.queue?.noOfAdultDependents || 0;
			const childDeps = currentOccupant?.queue?.noOfChildDependents || 0;
			return acc + 1 + adultDeps + childDeps;
		}, 0);

		const unitsWithDependents = activeData.filter((unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			const totalDeps =
				(currentOccupant?.queue?.noOfAdultDependents || 0) +
				(currentOccupant?.queue?.noOfChildDependents || 0);
			return totalDeps > 0;
		}).length;

		const quarterOccupancy = activeData.reduce((acc, unit) => {
			const quarterName = unit.quarterName || "Unknown";
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			const population =
				1 +
				(currentOccupant?.queue?.noOfAdultDependents || 0) +
				(currentOccupant?.queue?.noOfChildDependents || 0);

			if (!acc[quarterName]) {
				acc[quarterName] = { units: 0, population: 0 };
			}
			acc[quarterName].units += 1;
			acc[quarterName].population += population;
			return acc;
		}, {} as Record<string, { units: number; population: number }>);

		return {
			totalUnitsOccupied: activeData.length,
			totalPopulation,
			unitsWithDependents,
			quarterOccupancy: Object.entries(quarterOccupancy).map(
				([quarter, data]) => ({
					quarter,
					units: (data as { units: number; population: number }).units,
					population: (data as { units: number; population: number })
						.population,
				})
			),
		};
	};

	const getDependentsImpact = () => {
		const totalDependents = activeData.reduce((acc, unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			return (
				acc +
				(currentOccupant?.queue?.noOfAdultDependents || 0) +
				(currentOccupant?.queue?.noOfChildDependents || 0)
			);
		}, 0);

		const adultDependents = activeData.reduce((acc, unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			return acc + (currentOccupant?.queue?.noOfAdultDependents || 0);
		}, 0);

		const childDependents = activeData.reduce((acc, unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			return acc + (currentOccupant?.queue?.noOfChildDependents || 0);
		}, 0);

		return {
			totalDependents,
			adultDependents,
			childDependents,
			avgDependentsPerUnit:
				activeData.length > 0
					? (totalDependents / activeData.length).toFixed(2)
					: "0",
		};
	};

	const handleSaveChart = (config: ChartConfig) => {
		const configWithTab = { ...config, tab: "active" };
		let newCharts;
		if (editingChart) {
			newCharts = charts.map((c) =>
				c.id === editingChart.id ? configWithTab : c
			);
		} else {
			newCharts = [...charts, configWithTab];
		}
		setCharts(newCharts);
		localStorage.setItem("activeAnalyticsCharts", JSON.stringify(newCharts));
		setShowChartBuilder(false);
		setEditingChart(undefined);
	};

	const handleDeleteChart = (chartId: string) => {
		const newCharts = charts.filter((c) => c.id !== chartId);
		setCharts(newCharts);
		localStorage.setItem("activeAnalyticsCharts", JSON.stringify(newCharts));
	};

	const handleEditChart = (chart: ChartConfig) => {
		setEditingChart(chart);
		setShowChartBuilder(true);
	};

	// Define static chart IDs
	const staticChartIds = [
		"population-by-quarter",
		"accommodation-types",
		"units-by-service",
	];

	// Combine static and dynamic chart IDs
	const dynamicChartIds = charts.map((chart) => chart.id);
	const allChartIds = [...staticChartIds, ...dynamicChartIds];

	// Initialize all charts as selected on first render
	useEffect(() => {
		if (!chartsInitialized && allChartIds.length > 0) {
			setSelectedCharts(new Set(allChartIds));
			setChartsInitialized(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chartsInitialized]);

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const occupancyStats = getOccupancyStats();
	const dependentsImpact = getDependentsImpact();

	// Define all static charts
	const staticCharts = [
		{
			id: "population-by-quarter",
			title: "Population by Quarter",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Population by Quarter</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={600}>
							<BarChart data={occupancyStats.quarterOccupancy}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='quarter'
									{...chartStyles.angledAxis}
									height={180}
									interval={0}
									tick={{ ...chartStyles.angledAxis.tick, width: 120 }}
								/>
								<YAxis {...chartStyles.axis} />
								<Tooltip
									contentStyle={chartStyles.tooltip.contentStyle}
									itemStyle={chartStyles.tooltip.itemStyle}
									labelStyle={chartStyles.tooltip.labelStyle}
									cursor={chartStyles.tooltip.cursor}
								/>
								<Legend {...chartStyles.legend} />
								<Bar dataKey='units' fill='#8884d8' name='Units' />
								<Bar
									dataKey='population'
									fill='#82ca9d'
									name='Total Population'
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "accommodation-types",
			title: "Accommodation Types Distribution",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Accommodation Types Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={activeData.reduce((acc, unit) => {
										const type = unit.accommodationType || "Unknown";
										const existing = acc.find(
											(item: { name: string; value: number }) =>
												item.name === type
										);
										if (existing) {
											existing.value++;
										} else {
											acc.push({ name: type, value: 1 });
										}
										return acc;
									}, [] as Array<{ name: string; value: number }>)}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{activeData
										.reduce((acc, unit) => {
											const type = unit.accommodationType || "Unknown";
											if (!acc.includes(type)) acc.push(type);
											return acc;
										}, [] as string[])
										.map((entry: string, index: number) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
								</Pie>
								<Tooltip
									contentStyle={chartStyles.tooltip.contentStyle}
									itemStyle={chartStyles.tooltip.itemStyle}
									labelStyle={chartStyles.tooltip.labelStyle}
									cursor={chartStyles.tooltip.cursor}
								/>
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "units-by-service",
			title: "Units by Service Branch",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Units by Service Branch</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart
								data={activeData.reduce((acc, unit) => {
									const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
									const arm = currentOccupant?.queue?.armOfService || "Unknown";
									const existing = acc.find(
										(item: { name: string; value: number }) => item.name === arm
									);
									if (existing) {
										existing.value++;
									} else {
										acc.push({ name: arm, value: 1 });
									}
									return acc;
								}, [] as Array<{ name: string; value: number }>)}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='name'
									{...chartStyles.angledAxis}
									interval={0}
									tick={{ ...chartStyles.angledAxis.tick, width: 100 }}
								/>
								<YAxis {...chartStyles.axis} />
								<Tooltip
									contentStyle={chartStyles.tooltip.contentStyle}
									itemStyle={chartStyles.tooltip.itemStyle}
									labelStyle={chartStyles.tooltip.labelStyle}
									cursor={chartStyles.tooltip.cursor}
								/>
								<Bar dataKey='value' fill='#00C49F' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
	];

	// Combine static charts with dynamic charts
	const dynamicChartElements = charts.map((chart) => ({
		id: chart.id,
		title: chart.title,
		element: (
			<DynamicChart
				config={chart}
				data={activeData}
				onEdit={() => handleEditChart(chart)}
				onDelete={() => handleDeleteChart(chart.id)}
			/>
		),
	}));

	const allCharts = [...staticCharts, ...dynamicChartElements];

	// Handle print functionality
	const handlePrint = () => {
		// Get selected charts to print
		const chartsToPrint = allCharts.filter((chart) =>
			selectedCharts.has(chart.id)
		);

		if (chartsToPrint.length === 0) {
			alert("Please select at least one chart to print");
			return;
		}

		// Add custom print styles
		const printStyles = document.createElement("style");
		printStyles.id = "analytics-print-styles";
		printStyles.innerHTML = `
			@media print {
				/* Hide everything except the print container */
				body * {
					visibility: hidden;
				}
				
				/* Show the print container and its contents */
				#print-container,
				#print-container * {
					visibility: visible;
				}
				
				/* Position the print container */
				#print-container {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					padding: 20px;
				}
				
				/* Add header before the first chart */
				#print-container .space-y-6::before {
					content: "Active Allocations Analytics - Selected Charts\\A Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\\A Total Charts Selected: ${
			chartsToPrint.length
		}\\A ";
					display: block;
					text-align: center;
					margin-bottom: 30px;
					font-size: 18px;
					font-weight: bold;
					color: #1B365D;
					white-space: pre-line;
				}
				
				/* Style the charts for print */
				.print-chart {
					break-inside: avoid;
					page-break-inside: avoid;
					margin-bottom: 30px;
				}
				
				/* Ensure charts render properly */
				.recharts-surface {
					overflow: visible !important;
				}
				
				.recharts-responsive-container {
					width: 100% !important;
					height: 300px !important;
				}
				
				/* Page setup */
				@page {
					size: landscape;
					margin: 0.5in;
				}
			}
		`;

		document.head.appendChild(printStyles);

		// Trigger print dialog
		window.print();

		// Remove print styles after printing
		setTimeout(() => {
			const styleElement = document.getElementById("analytics-print-styles");
			if (styleElement) {
				styleElement.remove();
			}
		}, 500);
	};

	// Show all charts by default when not in selection mode
	const visibleCharts = isSelectionMode
		? allCharts.filter((chart) => selectedCharts.has(chart.id))
		: allCharts;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
						Active Allocations Analytics
					</h1>
					<p className='text-muted-foreground'>
						Current occupancy and population insights
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchActiveData()} variant='outline'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Refresh Data
					</Button>
					<Button
						variant={isSelectionMode ? "default" : "outline"}
						size='sm'
						onClick={() => setIsSelectionMode(!isSelectionMode)}>
						{isSelectionMode ? <>Done Selecting</> : <>Select Charts</>}
					</Button>

					<Dialog
						open={showChartBuilder}
						onOpenChange={(open) => {
							if (!open) {
								setShowChartBuilder(false);
								setEditingChart(undefined);
							}
						}}>
						<DialogTrigger asChild>
							<Button
								variant='default'
								onClick={() => {
									setEditingChart(undefined);
									setShowChartBuilder(true);
								}}>
								<Plus className='h-4 w-4 mr-2' />
								Add Chart
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-3xl'>
							<DialogHeader>
								<DialogTitle>
									{editingChart ? "Edit Chart" : "Create New Chart"}
								</DialogTitle>
								<DialogDescription>
									Configure your chart with custom parameters
								</DialogDescription>
							</DialogHeader>
							<ChartBuilder
								onSave={handleSaveChart}
								existingConfig={editingChart}
								onCancel={() => {
									setShowChartBuilder(false);
									setEditingChart(undefined);
								}}
								currentTab='active'
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Active</CardTitle>
						<Home className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{activeData.length}</div>
						<p className='text-xs text-muted-foreground'>Currently occupied</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Population
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{occupancyStats.totalPopulation}
						</div>
						<p className='text-xs text-muted-foreground'>
							Personnel + Dependents
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							With Dependents
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{occupancyStats.unitsWithDependents}
						</div>
						<p className='text-xs text-muted-foreground'>
							{(
								(occupancyStats.unitsWithDependents / activeData.length) *
								100
							).toFixed(0)}
							% of units
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Dependents
						</CardTitle>
						<UserCheck className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{dependentsImpact.totalDependents}
						</div>
						<p className='text-xs text-muted-foreground'>
							{dependentsImpact.adultDependents} adults,{" "}
							{dependentsImpact.childDependents} children
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart Selection Manager for all charts */}
			<ChartSelectionManager
				charts={allCharts}
				isSelectionMode={isSelectionMode}
				onSelectionModeChange={setIsSelectionMode}
				selectedCharts={selectedCharts}
				onSelectedChartsChange={setSelectedCharts}
			/>
		</div>
	);
}
