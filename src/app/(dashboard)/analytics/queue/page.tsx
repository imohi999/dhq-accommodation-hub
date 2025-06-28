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
	Clock,
	TrendingUp,
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

interface QueueData {
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

export default function QueueAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [queueData, setQueueData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

	// Chart selection state - must be defined before conditional returns
	const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [chartsInitialized, setChartsInitialized] = useState(false);

	useEffect(() => {
		fetchQueueData();
		// Load saved charts from localStorage
		const savedCharts = localStorage.getItem("queueAnalyticsCharts");
		if (savedCharts) {
			setCharts(JSON.parse(savedCharts));
		}
	}, []);

	const fetchQueueData = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/queue");
			const data = await response.json();

			const transformedQueue = (
				Array.isArray(data) ? data : (data as any).data || []
			).map((item: QueueData) => ({
				...item,
				// Use armOfService directly from API, no need to derive it
				totalDependents: item.noOfAdultDependents + item.noOfChildDependents,
				waitDays: Math.ceil(
					(new Date().getTime() - new Date(item.entryDateTime).getTime()) /
						(1000 * 60 * 60 * 24)
				),
				entryMonth: new Date(item.entryDateTime).toLocaleString("default", {
					month: "short",
				}),
				entryYear: new Date(item.entryDateTime).getFullYear(),
				// Additional computed fields for analytics
				hasDependents: item.noOfAdultDependents + item.noOfChildDependents > 0,
				dependentCategory:
					item.noOfAdultDependents > 0 && item.noOfChildDependents > 0
						? "Both"
						: item.noOfAdultDependents > 0
						? "Adults Only"
						: item.noOfChildDependents > 0
						? "Children Only"
						: "None",
			}));

			setQueueData(transformedQueue);
		} catch (error) {
			console.error("Failed to fetch queue data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getQueueAnalytics = () => {
		const totalInQueue = queueData.length;

		const waitTimes = queueData.map((person) => {
			const entryDate = new Date(person.entryDateTime);
			const today = new Date();
			const diffTime = Math.abs(today.getTime() - entryDate.getTime());
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		});

		const avgWaitTime =
			waitTimes.length > 0
				? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
				: 0;

		const medianWaitTime =
			waitTimes.length > 0
				? waitTimes.sort((a, b) => a - b)[Math.floor(waitTimes.length / 2)]
				: 0;

		const byArm = queueData.reduce((acc, person) => {
			const arm = person.armOfService || "Unknown";
			// Only count known service branches
			if (arm !== "Unknown" && arm !== "") {
				acc[arm] = (acc[arm] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		const byCategory = queueData.reduce((acc, person) => {
			const category = person.category || "Unknown";
			// Only count known categories
			if (category !== "Unknown" && category !== "") {
				acc[category] = (acc[category] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		return {
			totalInQueue,
			avgWaitTime,
			medianWaitTime,
			byArm: Object.entries(byArm).map(([name, value]) => ({ name, value })),
			byCategory: Object.entries(byCategory).map(([name, value]) => ({
				name,
				value,
			})),
		};
	};

	const handleSaveChart = (config: ChartConfig) => {
		const configWithTab = { ...config, tab: "queue" };
		let newCharts;
		if (editingChart) {
			newCharts = charts.map((c) =>
				c.id === editingChart.id ? configWithTab : c
			);
		} else {
			newCharts = [...charts, configWithTab];
		}
		setCharts(newCharts);
		localStorage.setItem("queueAnalyticsCharts", JSON.stringify(newCharts));
		setShowChartBuilder(false);
		setEditingChart(undefined);
	};

	const handleDeleteChart = (chartId: string) => {
		const newCharts = charts.filter((c) => c.id !== chartId);
		setCharts(newCharts);
		localStorage.setItem("queueAnalyticsCharts", JSON.stringify(newCharts));
	};

	const handleEditChart = (chart: ChartConfig) => {
		setEditingChart(chart);
		setShowChartBuilder(true);
	};

	// Define static chart IDs
	const staticChartIds = ["queue-by-service", "queue-by-category"];

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

	const queueAnalytics = getQueueAnalytics();

	// Define all static charts
	const staticCharts = [
		{
			id: "queue-by-service",
			title: "Queue by Service Branch",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Queue by Service Branch</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={queueAnalytics.byArm}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{queueAnalytics.byArm.map((entry, index) => (
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
			id: "queue-by-category",
			title: "Queue by Category",
			element: (
				<Card>
					<CardHeader>
						<CardTitle>Queue by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={queueAnalytics.byCategory}>
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
								<Bar dataKey='value' fill='#82ca9d' />
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
				data={queueData}
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
					content: "Queue Analytics - Selected Charts\\A Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\\A Total Charts Selected: ${
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
						Queue Analytics
					</h1>
					<p className='text-muted-foreground'>
						Real-time insights for accommodation queue management
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchQueueData()} variant='outline'>
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
								currentTab='queue'
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Queue Size</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{queueAnalytics.totalInQueue}
						</div>
						<p className='text-xs text-muted-foreground'>Personnel waiting</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Avg Wait Time</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-xl font-bold'>
							{formatDuration(queueAnalytics.avgWaitTime)}
						</div>
						<p className='text-xs text-muted-foreground'>Average duration</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Median Wait</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-xl font-bold'>
							{formatDuration(queueAnalytics.medianWaitTime)}
						</div>
						<p className='text-xs text-muted-foreground'>Median duration</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Categories</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{queueAnalytics.byCategory.length}
						</div>
						<p className='text-xs text-muted-foreground'>
							Different categories
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
