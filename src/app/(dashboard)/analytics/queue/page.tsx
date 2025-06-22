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
import { Users, Clock, TrendingUp, RefreshCw, Plus } from "lucide-react";
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

export default function QueueAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [queueData, setQueueData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

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
				hasDependents: (item.noOfAdultDependents + item.noOfChildDependents) > 0,
				dependentCategory: 
					item.noOfAdultDependents > 0 && item.noOfChildDependents > 0 ? "Both" :
					item.noOfAdultDependents > 0 ? "Adults Only" :
					item.noOfChildDependents > 0 ? "Children Only" : "None",
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
			acc[arm] = (acc[arm] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byCategory = queueData.reduce((acc, person) => {
			const category = person.category || "Unknown";
			acc[category] = (acc[category] || 0) + 1;
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

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const queueAnalytics = getQueueAnalytics();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Queue Analytics</h1>
					<p className='text-muted-foreground'>
						Real-time insights for accommodation queue management
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchQueueData()} variant='outline'>
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
						<div className='text-2xl font-bold'>
							{queueAnalytics.avgWaitTime} days
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
						<div className='text-2xl font-bold'>
							{queueAnalytics.medianWaitTime} days
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

			<div className='grid gap-4 md:grid-cols-2'>
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

				<Card>
					<CardHeader>
						<CardTitle>Queue by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={queueAnalytics.byCategory}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis dataKey='name' {...chartStyles.angledAxis} />
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
			</div>
			<div className='grid gap-4 md:grid-cols-2 mt-6'>
				{charts.map((chart) => (
					<DynamicChart
						key={chart.id}
						config={chart}
						data={queueData}
						onEdit={() => handleEditChart(chart)}
						onDelete={() => handleDeleteChart(chart.id)}
					/>
				))}
			</div>
		</div>
	);
}
