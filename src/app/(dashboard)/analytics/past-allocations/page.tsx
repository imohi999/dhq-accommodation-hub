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

const getArmOfService = (serviceNumber: string): string => {
	if (!serviceNumber) return "Unknown";
	const prefix = serviceNumber.substring(0, 3).toUpperCase();
	switch (prefix) {
		case "NA/":
			return "Army";
		case "NN/":
			return "Navy";
		case "AF/":
			return "Air Force";
		default:
			return "Unknown";
	}
};

export default function PastAllocationsAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [pastData, setPastData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

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
				armOfService: getArmOfService(
					item.personnelData?.serviceNumber || item.queue?.svcNo || ""
				),
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

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const turnoverStats = getTurnoverStats();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Past Allocations Analytics</h1>
					<p className='text-muted-foreground'>
						Historical allocation trends and turnover insights
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchPastData()} variant='outline'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Refresh Data
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
						<div className='text-2xl font-bold'>{pastData.length}</div>
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
						<div className='text-2xl font-bold'>
							{turnoverStats.avgOccupancyDuration} days
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
						<div className='text-2xl font-bold'>
							{turnoverStats.longestStay} days
						</div>
						<p className='text-xs text-muted-foreground'>Maximum duration</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Monthly Deallocation Trend</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width='100%' height={300}>
						<AreaChart data={turnoverStats.monthlyTurnover}>
							<CartesianGrid {...chartStyles.grid} />
							<XAxis dataKey='month' {...chartStyles.axis} />
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

			<div className='grid gap-4 md:grid-cols-2'>
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
								<XAxis dataKey='quarter' {...chartStyles.angledAxis} />
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
			</div>

			<div className='grid gap-4 md:grid-cols-2 mt-6'>
				{charts.map((chart) => (
					<DynamicChart
						key={chart.id}
						config={chart}
						data={pastData}
						onEdit={() => handleEditChart(chart)}
						onDelete={() => handleDeleteChart(chart.id)}
					/>
				))}
			</div>
		</div>
	);
}
