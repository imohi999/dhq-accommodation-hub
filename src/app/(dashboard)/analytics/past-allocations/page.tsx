"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AreaChart,
	Area,
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
	Archive,
	Calendar,
	TrendingUp,
	Clock,
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

interface PastData {
	id: string;
	personnelData?: {
		rank?: string;
		phone?: string;
		category?: string;
		fullName?: string;
		serviceNumber?: string;
		maritalStatus?: string;
		gender?: string;
	};
	unitData?: {
		location?: string;
		unitName?: string;
		quarterName?: string;
		accommodationType?: string;
		noOfRooms?: number;
	};
	unit?: {
		quarterName?: string;
		location?: string;
		noOfRooms?: number;
		status?: string;
		typeOfOccupancy?: string;
		bq?: boolean;
		noOfRoomsInBq?: number;
		blockName?: string;
		flatHouseRoomName?: string;
		unitName?: string;
	};
	allocationStartDate: string;
	allocationEndDate?: string | null;
	durationDays?: number;
	reasonForLeaving?: string;
	queue?: {
		id?: string;
		sequence?: number;
		fullName?: string;
		svcNo?: string;
		gender?: string;
		armOfService?: string;
		category?: string;
		rank?: string;
		maritalStatus?: string;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		currentUnit?: string;
		appointment?: string;
		dependents?: Array<{
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


const formatDuration = (days: number): string => {
	if (days === 0) return "0 days";

	const years = Math.floor(days / 365);
	const months = Math.floor((days % 365) / 30);
	const remainingDays = days % 30;

	const parts = [];
	if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
	if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
	if (remainingDays > 0)
		parts.push(`${remainingDays} day${remainingDays > 1 ? "s" : ""}`);

	return parts.join(", ");
};

export default function PastAllocationsAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [pastData, setPastData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

	// Chart selection state - must be defined before conditional returns
	const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [chartsInitialized, setChartsInitialized] = useState(false);

	useEffect(() => {
		fetchPastData();
		// Load saved charts from localStorage
		const savedCharts = localStorage.getItem("pastAnalyticsCharts");
		if (savedCharts) {
			setCharts(JSON.parse(savedCharts));
		}
	}, []);

	const fetchPastData = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/allocations/past");
			const data = await response.json();

			const transformedPast = (
				Array.isArray(data) ? data : (data as any).data || []
			).map((item: PastData) => ({
				...item,
				armOfService: item.queue?.armOfService || "Unknown",
				rank: item.personnelData?.rank || item.queue?.rank,
				maritalStatus:
					item.queue?.maritalStatus || item.personnelData?.maritalStatus,
				category: item.queue?.category || item.personnelData?.category,
				gender: item.queue?.gender || item.personnelData?.gender,
				quarterName: item.unit?.quarterName || item.unitData?.quarterName,
				location: item.unit?.location || item.unitData?.location,
				accommodationType: item.unitData?.accommodationType,
				noOfRooms: item.unit?.noOfRooms || item.unitData?.noOfRooms,
				totalDependents:
					(item.queue?.noOfAdultDependents || 0) +
					(item.queue?.noOfChildDependents || 0),
				durationCategory: !item.durationDays
					? "Unknown"
					: item.durationDays <= 30
					? "0-30 days"
					: item.durationDays <= 90
					? "31-90 days"
					: item.durationDays <= 180
					? "91-180 days"
					: item.durationDays <= 365
					? "181-365 days"
					: ">365 days",
				startMonth: item.allocationStartDate
					? new Date(item.allocationStartDate).toLocaleString("default", {
							month: "short",
					  })
					: "Unknown",
				startYear: item.allocationStartDate
					? new Date(item.allocationStartDate).getFullYear()
					: new Date().getFullYear(),
				endMonth: item.allocationEndDate
					? new Date(item.allocationEndDate).toLocaleString("default", {
							month: "short",
					  })
					: "Ongoing",
				endYear: item.allocationEndDate
					? new Date(item.allocationEndDate).getFullYear()
					: new Date().getFullYear(),
			}));

			setPastData(transformedPast);
		} catch (error) {
			console.error("Failed to fetch past data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getTurnoverStats = () => {
		const completedAllocations = pastData.filter((p) => p.durationDays);

		const avgOccupancyDuration =
			completedAllocations.length > 0
				? Math.round(
						completedAllocations.reduce(
							(acc, p) => acc + (p.durationDays || 0),
							0
						) / completedAllocations.length
				  )
				: 0;

		const quarterTurnover = pastData.reduce((acc, allocation) => {
			const quarterName = allocation.unit?.quarterName || "Unknown";
			if (!acc[quarterName]) {
				acc[quarterName] = { count: 0, totalDuration: 0 };
			}
			acc[quarterName].count += 1;
			acc[quarterName].totalDuration += allocation.durationDays || 0;
			return acc;
		}, {} as Record<string, { count: number; totalDuration: number }>);

		const monthlyTurnover = Array.from({ length: 12 }, (_, i) => {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			const monthYear = date.toLocaleString("default", {
				month: "short",
				year: "numeric",
			});

			const count = pastData.filter((p) => {
				if (!p.allocationEndDate) return false;
				const endDate = new Date(p.allocationEndDate);
				return (
					endDate.getMonth() === date.getMonth() &&
					endDate.getFullYear() === date.getFullYear()
				);
			}).length;

			return { month: monthYear, deallocations: count };
		}).reverse();

		const thisMonth = pastData.filter((p) => {
			if (!p.allocationEndDate) return false;
			const endDate = new Date(p.allocationEndDate);
			const now = new Date();
			return (
				endDate.getMonth() === now.getMonth() &&
				endDate.getFullYear() === now.getFullYear()
			);
		}).length;

		const longestStay = Math.max(
			...pastData.map((p) => p.durationDays || 0),
			0
		);

		return {
			avgOccupancyDuration,
			totalDeallocations: pastData.length,
			quarterTurnover: Object.entries(quarterTurnover).map(
				([quarter, data]) => {
					const typedData = data as { count: number; totalDuration: number };
					return {
						quarter,
						turnoverCount: typedData.count,
						avgDuration:
							typedData.count > 0
								? Math.round(typedData.totalDuration / typedData.count)
								: 0,
					};
				}
			),
			monthlyTurnover,
			thisMonth,
			longestStay,
		};
	};

	const handleSaveChart = (config: ChartConfig) => {
		const configWithTab = { ...config, tab: "past" };
		let newCharts;
		if (editingChart) {
			newCharts = charts.map((c) =>
				c.id === editingChart.id ? configWithTab : c
			);
		} else {
			newCharts = [...charts, configWithTab];
		}
		setCharts(newCharts);
		localStorage.setItem("pastAnalyticsCharts", JSON.stringify(newCharts));
		setShowChartBuilder(false);
		setEditingChart(undefined);
	};

	const handleDeleteChart = (chartId: string) => {
		const newCharts = charts.filter((c) => c.id !== chartId);
		setCharts(newCharts);
		localStorage.setItem("pastAnalyticsCharts", JSON.stringify(newCharts));
	};

	const handleEditChart = (chart: ChartConfig) => {
		setEditingChart(chart);
		setShowChartBuilder(true);
	};

	// Define static chart IDs
	const staticChartIds = [
		"monthly-deallocation-trend",
		"duration-distribution",
		"top-quarters-turnover",
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

	const turnoverStats = getTurnoverStats();

	// Define all static charts
	const staticCharts = [
		{
			id: "monthly-deallocation-trend",
			title: "Monthly Deallocation Trend",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Monthly Deallocation Trend</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={350}>
							<AreaChart
								data={turnoverStats.monthlyTurnover}
								margin={{ left: 5, right: 5, top: 5, bottom: 80 }}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='month'
									{...chartStyles.axis}
									angle={-45}
									textAnchor='end'
									interval={0}
									tick={{ ...chartStyles.axis.tick, width: 100 }}
								/>
								<YAxis {...chartStyles.axis} />
								<Tooltip
									contentStyle={chartStyles.tooltip.contentStyle}
									itemStyle={chartStyles.tooltip.itemStyle}
									labelStyle={chartStyles.tooltip.labelStyle}
									cursor={chartStyles.tooltip.cursor}
								/>
								<Area
									type='monotone'
									dataKey='deallocations'
									stroke='#8884d8'
									fill='#8884d8'
									fillOpacity={0.6}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			),
		},
		{
			id: "duration-distribution",
			title: "Duration Distribution",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Duration Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={pastData.reduce((acc, item) => {
										const category = item.durationCategory || "Unknown";
										const existing = acc.find(
											(entry: { name: string; value: number }) =>
												entry.name === category
										);
										if (existing) {
											existing.value++;
										} else {
											acc.push({ name: category, value: 1 });
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
									{[
										"0-30 days",
										"31-90 days",
										"91-180 days",
										"181-365 days",
										">365 days",
										"Unknown",
									].map((entry, index) => (
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
			id: "top-quarters-turnover",
			title: "Top Quarters by Turnover",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Top Quarters by Turnover</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart
								data={turnoverStats.quarterTurnover
									.sort((a, b) => b.turnoverCount - a.turnoverCount)
									.slice(0, 10)}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis
									dataKey='quarter'
									{...chartStyles.angledAxis}
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
								<Bar dataKey='turnoverCount' fill='#ff7300' />
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
				data={pastData}
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
					content: "Past Allocations Analytics - Selected Charts\\A Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\\A Total Charts Selected: ${
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
						Past Allocations Analytics
					</h1>
					<p className='text-muted-foreground'>
						Historical allocation trends and turnover insights
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchPastData()} variant='outline'>
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
								currentTab='past'
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Past</CardTitle>
						<Archive className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-xl font-bold'>{pastData.length}</div>
						<p className='text-xs text-muted-foreground'>
							Historical allocations
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Avg Duration</CardTitle>
						<Calendar className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-xl font-bold'>
							{formatDuration(turnoverStats.avgOccupancyDuration)}
						</div>
						<p className='text-xs text-muted-foreground'>Average occupancy</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>This Month</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{turnoverStats.thisMonth}</div>
						<p className='text-xs text-muted-foreground'>Deallocations</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Longest Stay</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-xl font-bold'>
							{formatDuration(turnoverStats.longestStay)}
						</div>
						<p className='text-xs text-muted-foreground'>Maximum duration</p>
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
