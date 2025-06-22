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

export default function ActiveAllocationsAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [activeData, setActiveData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();

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
					armOfService: getArmOfService(item.currentOccupantServiceNumber || ""),
					rank: item.currentOccupantRank || "",
					maritalStatus: currentOccupant?.queue?.maritalStatus || "Unknown",
					personnelCategory: currentOccupant?.queue?.category || item.category || "Unknown",
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

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const occupancyStats = getOccupancyStats();
	const dependentsImpact = getDependentsImpact();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Active Allocations Analytics</h1>
					<p className='text-muted-foreground'>
						Current occupancy and population insights
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={() => fetchActiveData()} variant='outline'>
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

			<div className='grid gap-4 md:grid-cols-2'>
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
										const existing = acc.find((item: { name: string; value: number }) => item.name === type);
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

				<Card>
					<CardHeader>
						<CardTitle>Units by Service Branch</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart
								data={activeData.reduce((acc, unit) => {
									const arm = unit.armOfService || "Unknown";
									const existing = acc.find((item: { name: string; value: number }) => item.name === arm);
									if (existing) {
										existing.value++;
									} else {
										acc.push({ name: arm, value: 1 });
									}
									return acc;
								}, [] as Array<{ name: string; value: number }>)}>
								<CartesianGrid {...chartStyles.grid} />
								<XAxis dataKey='name' {...chartStyles.angledAxis} />
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
			</div>

			<div className='grid gap-4 md:grid-cols-2 mt-6'>
				{charts.map((chart) => (
					<DynamicChart
						key={chart.id}
						config={chart}
						data={activeData}
						onEdit={() => handleEditChart(chart)}
						onDelete={() => handleDeleteChart(chart.id)}
					/>
				))}
			</div>
		</div>
	);
}
