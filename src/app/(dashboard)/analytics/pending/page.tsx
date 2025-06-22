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
import { Users, Clock, Shield, Activity, RefreshCw, Plus } from "lucide-react";
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

interface PendingData {
	id: string;
	personnelData?: {
		fullName?: string;
		rank?: string;
		serviceNumber?: string;
		maritalStatus?: string;
		category?: string;
		gender?: string;
	};
	unitData?: {
		quarterName?: string;
		accommodationType?: string;
	};
	createdAt: string;
	queue?: {
		dependents?: Array<{
			name: string;
			age: number;
			gender: string;
		}>;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
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

export default function PendingAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [pendingData, setPendingData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

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
				armOfService: getArmOfService(item.personnelData?.serviceNumber || ""),
				rank: item.personnelData?.rank,
				maritalStatus: item.personnelData?.maritalStatus,
				category: item.personnelData?.category,
				gender: item.personnelData?.gender,
				accommodationType: item.unitData?.accommodationType,
				processingDays: Math.ceil(
					(new Date().getTime() - new Date(item.createdAt).getTime()) /
						(1000 * 60 * 60 * 24)
				),
				createdMonth: new Date(item.createdAt).toLocaleString("default", {
					month: "short",
				}),
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

		const officers = pendingData.filter((p) => p.category === "Officer").length;
		const ncos = pendingData.filter((p) => p.category === "NCOs").length;

		const byArm = pendingData.reduce((acc, person) => {
			const arm = person.armOfService || "Unknown";
			acc[arm] = (acc[arm] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byAccommodationType = pendingData.reduce((acc, item) => {
			const type = item.accommodationType || "Unknown";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			totalPending,
			avgProcessingTime,
			officers,
			ncos,
			byArm: Object.entries(byArm).map(([name, value]) => ({ name, value })),
			byAccommodationType: Object.entries(byAccommodationType).map(
				([name, value]) => ({ name, value })
			),
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

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const pendingAnalytics = getPendingAnalytics();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Pending Allocation Analytics</h1>
					<p className='text-muted-foreground'>
						Insights on pending allocation requests
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchPendingData()} variant='outline'>
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

			<div className='grid gap-4 md:grid-cols-2'>
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
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Pending by Accommodation Type</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={pendingAnalytics.byAccommodationType}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Bar dataKey='value' fill='#ffc658' />
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
						data={pendingData}
						onEdit={() => handleEditChart(chart)}
						onDelete={() => handleDeleteChart(chart.id)}
					/>
				))}
			</div>
		</div>
	);
}
