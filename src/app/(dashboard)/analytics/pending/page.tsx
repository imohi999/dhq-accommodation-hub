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
	LineChart,
	Line,
} from "recharts";
import {
	Users,
	Clock,
	Shield,
	Activity,
	RefreshCw,
	Plus,
	Check,
	Printer,
} from "lucide-react";
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
import { chartStyles } from "@/components/analytics/chartStyles";
import {
	ChartSelectionManager,
	useChartSelection,
} from "@/components/analytics/ChartSelectionManager";

interface PendingData {
	id: string;
	personnelId: string;
	queueId: string;
	unitId: string;
	letterId: string;
	personnelData: {
		id: string;
		rank: string;
		phone: string;
		svcNo: string;
		gender: string;
		category: string;
		fullName: string;
		sequence: number;
		appointment: string;
		currentUnit: string;
		armOfService: string;
		entryDateTime: string;
		maritalStatus: string;
		noOfAdultDependents: number;
		noOfChildDependents: number;
	};
	unitData: {
		location: string;
		unitName: string;
		noOfRooms: number;
		quarterName: string;
		accommodationType: string;
	};
	allocationDate: string;
	status: string;
	approvedBy: string | null;
	approvedAt: string | null;
	refusalReason: string | null;
	createdAt: string;
	updatedAt: string;
	unit: {
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
	};
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
		currentUnit: string;
		appointment: string;
		dateTos: string | null;
		dateSos: string | null;
		phone: string;
		entryDateTime: string;
		createdAt: string;
		updatedAt: string;
		dependents: Array<{
			name: string;
			age: number;
			gender: string;
		}> | null;
	};
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

export default function PendingAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [pendingData, setPendingData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

	// Chart selection state - must be defined before conditional returns
	const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [chartsInitialized, setChartsInitialized] = useState(false);

	useEffect(() => {
		fetchPendingData();
		// Load saved charts from localStorage
		const savedCharts = localStorage.getItem("pendingAnalyticsCharts");
		if (savedCharts) {
			setCharts(JSON.parse(savedCharts));
		}
	}, []);

	const fetchPendingData = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/allocations/requests?status=pending");
			const data = await response.json();

			const transformedPending = (
				Array.isArray(data) ? data : (data as any).data || []
			).map((item: PendingData) => ({
				...item,
				armOfService:
					item.personnelData?.armOfService ||
					item.queue?.armOfService ||
					"Unknown",
				rank: item.personnelData?.rank || item.queue?.rank,
				maritalStatus:
					item.personnelData?.maritalStatus || item.queue?.maritalStatus,
				category: item.personnelData?.category || item.queue?.category,
				gender: item.personnelData?.gender || item.queue?.gender,
				accommodationType:
					item.unitData?.accommodationType ||
					item.unit?.accommodationType?.name,
				processingDays: Math.ceil(
					(new Date().getTime() - new Date(item.createdAt).getTime()) /
						(1000 * 60 * 60 * 24)
				),
				createdMonth: new Date(item.createdAt).toLocaleString("default", {
					month: "short",
				}),
				fullName: item.personnelData?.fullName || item.queue?.fullName,
				serviceNumber: item.personnelData?.svcNo || item.queue?.svcNo,
				currentUnit: item.personnelData?.currentUnit || item.queue?.currentUnit,
				appointment: item.personnelData?.appointment || item.queue?.appointment,
				location: item.unitData?.location || item.unit?.location,
				quarterName: item.unitData?.quarterName || item.unit?.quarterName,
				unitName: item.unitData?.unitName || item.unit?.unitName,
				noOfRooms: item.unitData?.noOfRooms || item.unit?.noOfRooms,
				totalDependents:
					(item.queue?.noOfAdultDependents || 0) +
					(item.queue?.noOfChildDependents || 0),
				waitingTimeDays: Math.ceil(
					(new Date().getTime() -
						new Date(item.queue?.entryDateTime || item.createdAt).getTime()) /
						(1000 * 60 * 60 * 24)
				),
			}));

			setPendingData(transformedPending);
		} catch (error) {
			console.error("Failed to fetch pending data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getPendingAnalytics = () => {
		const totalPending = pendingData.length;

		const avgProcessingTime =
			pendingData.length > 0
				? Math.round(
						pendingData.reduce((acc, p) => {
							const created = new Date(p.createdAt);
							const now = new Date();
							return (
								acc +
								Math.ceil(
									(now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
								)
							);
						}, 0) / pendingData.length
				  )
				: 0;

		const avgWaitingTime =
			pendingData.length > 0
				? Math.round(
						pendingData.reduce((acc, p) => acc + (p.waitingTimeDays || 0), 0) /
							pendingData.length
				  )
				: 0;

		const officers = pendingData.filter((p) => p.category === "Officer").length;
		const ncos = pendingData.filter((p) => p.category === "NCOs").length;

		const byArm = pendingData.reduce((acc, person) => {
			const arm = person.armOfService || "Unknown";
			acc[arm] = (acc[arm] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byCategory = pendingData.reduce((acc, person) => {
			const category = person.category || "Unknown";
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byAccommodationType = pendingData.reduce((acc, item) => {
			const type = item.accommodationType || "Unknown";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byMaritalStatus = pendingData.reduce((acc, person) => {
			const status = person.maritalStatus || "Unknown";
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byLocation = pendingData.reduce((acc, item) => {
			const location = item.location || "Unknown";
			acc[location] = (acc[location] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byGender = pendingData.reduce((acc, person) => {
			const gender = person.gender || "Unknown";
			acc[gender] = (acc[gender] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const withDependents = pendingData.filter(
			(p) => p.totalDependents > 0
		).length;
		const withoutDependents = pendingData.filter(
			(p) => p.totalDependents === 0
		).length;

		// Calculate monthly trends
		const monthlyTrends = pendingData.reduce((acc, item) => {
			const month = item.createdMonth;
			acc[month] = (acc[month] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Calculate average dependents by marital status
		const avgDependentsByStatus = (
			Object.entries(
				pendingData.reduce((acc, item) => {
					const status = item.maritalStatus || "Unknown";
					if (!acc[status]) {
						acc[status] = { total: 0, count: 0 };
					}
					acc[status].total += item.totalDependents || 0;
					acc[status].count += 1;
					return acc;
				}, {} as Record<string, { total: number; count: number }>)
			) as [string, { total: number; count: number }][]
		).map(([status, data]) => ({
			name: status,
			avgDependents:
				data.count > 0 ? parseFloat((data.total / data.count).toFixed(1)) : 0,
		}));

		return {
			totalPending,
			avgProcessingTime,
			avgWaitingTime,
			officers,
			ncos,
			withDependents,
			withoutDependents,
			byArm: Object.entries(byArm).map(([name, value]) => ({ name, value })),
			byCategory: Object.entries(byCategory).map(([name, value]) => ({
				name,
				value,
			})),
			byAccommodationType: Object.entries(byAccommodationType).map(
				([name, value]) => ({ name, value })
			),
			byMaritalStatus: Object.entries(byMaritalStatus).map(([name, value]) => ({
				name,
				value,
			})),
			byLocation: Object.entries(byLocation).map(([name, value]) => ({
				name,
				value,
			})),
			byGender: Object.entries(byGender).map(([name, value]) => ({
				name,
				value,
			})),
			monthlyTrends: Object.entries(monthlyTrends).map(([name, value]) => ({
				name,
				value,
			})),
			avgDependentsByStatus,
		};
	};

	const handleSaveChart = (config: ChartConfig) => {
		const configWithTab = { ...config, tab: "pending" };
		let newCharts;
		if (editingChart) {
			newCharts = charts.map((c) =>
				c.id === editingChart.id ? configWithTab : c
			);
		} else {
			newCharts = [...charts, configWithTab];
		}
		setCharts(newCharts);
		localStorage.setItem("pendingAnalyticsCharts", JSON.stringify(newCharts));
		setShowChartBuilder(false);
		setEditingChart(undefined);
	};

	const handleDeleteChart = (chartId: string) => {
		const newCharts = charts.filter((c) => c.id !== chartId);
		setCharts(newCharts);
		localStorage.setItem("pendingAnalyticsCharts", JSON.stringify(newCharts));
	};

	const handleEditChart = (chart: ChartConfig) => {
		setEditingChart(chart);
		setShowChartBuilder(true);
	};

	// Define static chart IDs
	const staticChartIds = [
		"pending-by-service",
		"pending-by-accommodation",
		"processing-time-distribution",
		"pending-by-category",
		"pending-by-marital-status",
		"pending-by-location",
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

	const getProcessingTimeDistribution = () => {
		const ranges = [
			{ range: "0-2 days", min: 0, max: 2, count: 0 },
			{ range: "3-5 days", min: 3, max: 5, count: 0 },
			{ range: "6-10 days", min: 6, max: 10, count: 0 },
			{ range: "11-20 days", min: 11, max: 20, count: 0 },
			{ range: "20+ days", min: 21, max: Infinity, count: 0 },
		];

		pendingData.forEach((item) => {
			const days = item.processingDays || 0;
			const range = ranges.find((r) => days >= r.min && days <= r.max);
			if (range) range.count++;
		});

		return ranges;
	};

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const pendingAnalytics = getPendingAnalytics();
	const processingTimeDistribution = getProcessingTimeDistribution();

	// Define all static charts
	const staticCharts = [
		{
			id: "pending-by-service",
			title: "Pending by Service Branch",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Pending by Service Branch</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={pendingAnalytics.byArm}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{pendingAnalytics.byArm.map((entry, index) => (
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
			id: "pending-by-accommodation",
			title: "Pending by Accommodation Type",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Pending by Accommodation Type</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={400}>
							<BarChart data={pendingAnalytics.byAccommodationType}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='name'
									{...chartStyles.angledAxis}
									height={100}
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
								<Bar dataKey='value' fill='#ffc658' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "processing-time-distribution",
			title: "Processing Time Distribution",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Processing Time Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={processingTimeDistribution}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='range'
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
								<Bar dataKey='count' fill='#82ca9d' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "pending-by-category",
			title: "Pending by Category",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Pending by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={pendingAnalytics.byCategory}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{pendingAnalytics.byCategory.map((entry, index) => (
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
			id: "pending-by-marital-status",
			title: "Pending by Marital Status",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Pending by Marital Status</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={pendingAnalytics.byMaritalStatus}>
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
								<Bar dataKey='value' fill='#ff7300' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "pending-by-location",
			title: "Pending by Location",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Pending by Location</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={pendingAnalytics.byLocation}>
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
				data={pendingData}
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
					content: "Pending Allocation Analytics - Selected Charts\\A Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\\A Total Charts Selected: ${
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
						Pending Allocation Analytics
					</h1>
					<p className='text-muted-foreground'>
						Insights on pending allocation requests
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchPendingData()} variant='outline'>
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
								currentTab='pending'
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Pending</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{pendingAnalytics.totalPending}
						</div>
						<p className='text-xs text-muted-foreground'>Awaiting approval</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Avg Processing Time
						</CardTitle>
						<Activity className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{pendingAnalytics.avgProcessingTime} days
						</div>
						<p className='text-xs text-muted-foreground'>Average wait time</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Officers</CardTitle>
						<Shield className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{pendingAnalytics.officers}
						</div>
						<p className='text-xs text-muted-foreground'>Officer requests</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>NCOs</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{pendingAnalytics.ncos}</div>
						<p className='text-xs text-muted-foreground'>NCO requests</p>
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
