"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Area,
	AreaChart,
	ScatterChart,
	Scatter,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from "recharts";
import {
	Users,
	Home,
	Clock,
	TrendingUp,
	UserCheck,
	Building,
	Activity,
	Calendar,
	Shield,
	Archive,
	Settings2,
	Plus,
	X,
	Download,
	RefreshCw,
} from "lucide-react";
import { LoadingState } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface QueueData {
	id: string;
	sequence: number;
	fullName: string;
	rank: string;
	svcNo: string;
	maritalStatus: string;
	armOfService?: string;
	arm_of_service?: string;
	category?: string;
	gender?: string;
	noOfAdultDependents?: number;
	noOfChildDependents?: number;
	entryDateTime: string;
	dependents?: Array<{
		name: string;
		age: number;
		gender: string;
	}>;
}

interface ActiveData {
	id: string;
	currentOccupantName: string;
	currentOccupantRank: string;
	currentOccupantServiceNumber: string;
	quarterName?: string;
	quarter_name?: string;
	location?: string;
	noOfRooms?: number | string;
	bq?: boolean;
	noOfRoomsInBq?: number;
	accommodationType?: {
		id: string;
		name: string;
	};
	allocation_date?: string;
	occupancyStartDate?: string;
	occupants?: Array<{
		fullName: string;
		rank: string;
		serviceNumber: string;
		isCurrent: boolean;
		queue?: {
			maritalStatus?: string;
			category?: string;
			gender?: string;
			noOfAdultDependents?: number;
			noOfChildDependents?: number;
			dependents?: Array<{
				name: string;
				age: number;
				gender: string;
			}>;
		};
	}>;
}

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

interface PastData {
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
	unit?: {
		quarterName?: string;
		location?: string;
		noOfRooms?: string | number;
	};
	allocationStartDate: string;
	allocationEndDate?: string | null;
	durationDays?: number;
	queue?: {
		maritalStatus?: string;
		category?: string;
		gender?: string;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		dependents?: Array<{
			name: string;
			age: number;
			gender: string;
		}>;
	};
}

interface ChartConfig {
	id: string;
	title: string;
	type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
	dataSource: 'queue' | 'pending' | 'active' | 'past';
	xAxis?: string;
	yAxis?: string;
	groupBy?: string;
	aggregation?: 'count' | 'sum' | 'average' | 'min' | 'max';
	filters?: {
		field: string;
		operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
		value: any;
	}[];
	colors?: string[];
	showLegend?: boolean;
	showGrid?: boolean;
	showTooltip?: boolean;
	height?: number;
	width?: number;
	tab?: string; // Which tab this chart belongs to
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

// Helper function to get arm of service
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

// Available fields for each data source
const dataSourceFields = {
	queue: [
		{ value: 'rank', label: 'Rank' },
		{ value: 'maritalStatus', label: 'Marital Status' },
		{ value: 'armOfService', label: 'Service Branch' },
		{ value: 'category', label: 'Category' },
		{ value: 'gender', label: 'Gender' },
		{ value: 'noOfAdultDependents', label: 'Adult Dependents' },
		{ value: 'noOfChildDependents', label: 'Child Dependents' },
		{ value: 'totalDependents', label: 'Total Dependents' },
		{ value: 'waitDays', label: 'Wait Days' },
		{ value: 'entryMonth', label: 'Entry Month' },
		{ value: 'entryYear', label: 'Entry Year' },
	],
	pending: [
		{ value: 'rank', label: 'Rank' },
		{ value: 'maritalStatus', label: 'Marital Status' },
		{ value: 'armOfService', label: 'Service Branch' },
		{ value: 'category', label: 'Category' },
		{ value: 'gender', label: 'Gender' },
		{ value: 'accommodationType', label: 'Accommodation Type' },
		{ value: 'processingDays', label: 'Processing Days' },
		{ value: 'createdMonth', label: 'Created Month' },
	],
	active: [
		{ value: 'rank', label: 'Rank' },
		{ value: 'maritalStatus', label: 'Marital Status' },
		{ value: 'armOfService', label: 'Service Branch' },
		{ value: 'category', label: 'Category' },
		{ value: 'gender', label: 'Gender' },
		{ value: 'quarterName', label: 'Quarter Name' },
		{ value: 'accommodationType', label: 'Accommodation Type' },
		{ value: 'noOfRooms', label: 'Number of Rooms' },
		{ value: 'totalDependents', label: 'Total Dependents' },
		{ value: 'population', label: 'Total Population' },
		{ value: 'location', label: 'Location' },
		{ value: 'hasBQ', label: 'Has BQ' },
	],
	past: [
		{ value: 'rank', label: 'Rank' },
		{ value: 'maritalStatus', label: 'Marital Status' },
		{ value: 'armOfService', label: 'Service Branch' },
		{ value: 'category', label: 'Category' },
		{ value: 'gender', label: 'Gender' },
		{ value: 'quarterName', label: 'Quarter Name' },
		{ value: 'accommodationType', label: 'Accommodation Type' },
		{ value: 'durationDays', label: 'Duration (Days)' },
		{ value: 'durationCategory', label: 'Duration Category' },
		{ value: 'endMonth', label: 'End Month' },
		{ value: 'endYear', label: 'End Year' },
	],
};

// Chart Builder Component
const ChartBuilder = ({ 
	onSave, 
	existingConfig,
	onCancel,
	currentTab 
}: { 
	onSave: (config: ChartConfig) => void;
	existingConfig?: ChartConfig;
	onCancel: () => void;
	currentTab: string;
}) => {
	const [config, setConfig] = useState<ChartConfig>(existingConfig || {
		id: Date.now().toString(),
		title: 'New Chart',
		type: 'bar',
		dataSource: currentTab as any,
		showLegend: true,
		showGrid: true,
		showTooltip: true,
		height: 300,
		aggregation: 'count',
		tab: currentTab,
	});

	const availableFields = dataSourceFields[config.dataSource] || [];

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label>Chart Title</Label>
					<Input
						value={config.title}
						onChange={(e) => setConfig({ ...config, title: e.target.value })}
						placeholder="Enter chart title"
					/>
				</div>

				<div className="space-y-2">
					<Label>Chart Type</Label>
					<Select value={config.type} onValueChange={(value: any) => setConfig({ ...config, type: value })}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="bar">Bar Chart</SelectItem>
							<SelectItem value="line">Line Chart</SelectItem>
							<SelectItem value="pie">Pie Chart</SelectItem>
							<SelectItem value="area">Area Chart</SelectItem>
							<SelectItem value="scatter">Scatter Plot</SelectItem>
							<SelectItem value="radar">Radar Chart</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Data Source</Label>
					<Select value={config.dataSource} onValueChange={(value: any) => setConfig({ ...config, dataSource: value, xAxis: undefined, yAxis: undefined, groupBy: undefined })}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="queue">Queue Data</SelectItem>
							<SelectItem value="pending">Pending Allocations</SelectItem>
							<SelectItem value="active">Active Allocations</SelectItem>
							<SelectItem value="past">Past Allocations</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{config.type !== 'pie' && (
					<div className="space-y-2">
						<Label>X-Axis Field</Label>
						<Select value={config.xAxis} onValueChange={(value) => setConfig({ ...config, xAxis: value })}>
							<SelectTrigger>
								<SelectValue placeholder="Select field" />
							</SelectTrigger>
							<SelectContent>
								{availableFields.map(field => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{config.type !== 'pie' && (
					<div className="space-y-2">
						<Label>Y-Axis Field</Label>
						<Select value={config.yAxis} onValueChange={(value) => setConfig({ ...config, yAxis: value })}>
							<SelectTrigger>
								<SelectValue placeholder="Select field (or leave empty for count)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="_count">Count</SelectItem>
								{availableFields.filter(f => ['noOfAdultDependents', 'noOfChildDependents', 'totalDependents', 'waitDays', 'processingDays', 'durationDays', 'noOfRooms', 'population'].includes(f.value)).map(field => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{config.type === 'pie' && (
					<div className="space-y-2">
						<Label>Group By Field</Label>
						<Select value={config.groupBy} onValueChange={(value) => setConfig({ ...config, groupBy: value })}>
							<SelectTrigger>
								<SelectValue placeholder="Select field" />
							</SelectTrigger>
							<SelectContent>
								{availableFields.map(field => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-2">
					<Label>Aggregation</Label>
					<Select value={config.aggregation} onValueChange={(value: any) => setConfig({ ...config, aggregation: value })}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="count">Count</SelectItem>
							<SelectItem value="sum">Sum</SelectItem>
							<SelectItem value="average">Average</SelectItem>
							<SelectItem value="min">Minimum</SelectItem>
							<SelectItem value="max">Maximum</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Height (px)</Label>
					<Slider
						value={[config.height || 300]}
						onValueChange={([value]) => setConfig({ ...config, height: value })}
						min={200}
						max={600}
						step={50}
					/>
					<span className="text-sm text-muted-foreground">{config.height}px</span>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				<div className="flex items-center space-x-2">
					<Switch
						checked={config.showLegend}
						onCheckedChange={(checked) => setConfig({ ...config, showLegend: checked })}
					/>
					<Label>Show Legend</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Switch
						checked={config.showGrid}
						onCheckedChange={(checked) => setConfig({ ...config, showGrid: checked })}
					/>
					<Label>Show Grid</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Switch
						checked={config.showTooltip}
						onCheckedChange={(checked) => setConfig({ ...config, showTooltip: checked })}
					/>
					<Label>Show Tooltip</Label>
				</div>
			</div>

			<div className="flex justify-end space-x-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={() => onSave(config)}>
					Save Chart
				</Button>
			</div>
		</div>
	);
};

// Dynamic Chart Component
const DynamicChart = ({ 
	config, 
	data,
	onEdit,
	onDelete 
}: { 
	config: ChartConfig;
	data: any[];
	onEdit: () => void;
	onDelete: () => void;
}) => {
	// Process data based on configuration
	const processData = () => {
		if (!data || data.length === 0) return [];

		// Apply filters
		let filteredData = [...data];
		if (config.filters) {
			config.filters.forEach(filter => {
				// Implement filter logic
			});
		}

		// Transform data for the chart
		if (config.type === 'pie') {
			// Group by the specified field
			const grouped = filteredData.reduce((acc, item) => {
				const key = item[config.groupBy || 'category'] || 'Unknown';
				if (!acc[key]) {
					acc[key] = 0;
				}
				acc[key]++;
				return acc;
			}, {} as Record<string, number>);

			return Object.entries(grouped).map(([name, value]) => ({ name, value }));
		} else {
			// For other chart types, group by X-axis
			const grouped = filteredData.reduce((acc, item) => {
				const key = item[config.xAxis || 'category'] || 'Unknown';
				if (!acc[key]) {
					acc[key] = { name: key, value: 0, count: 0 };
				}

				if (config.yAxis === '_count' || !config.yAxis) {
					acc[key].value++;
				} else {
					const yValue = item[config.yAxis] || 0;
					if (config.aggregation === 'sum') {
						acc[key].value += yValue;
					} else if (config.aggregation === 'average') {
						acc[key].value += yValue;
						acc[key].count++;
					} else if (config.aggregation === 'min') {
						acc[key].value = acc[key].value === 0 ? yValue : Math.min(acc[key].value, yValue);
					} else if (config.aggregation === 'max') {
						acc[key].value = Math.max(acc[key].value, yValue);
					} else {
						acc[key].value++;
					}
				}
				return acc;
			}, {} as Record<string, any>);

			return Object.values(grouped).map((item: any) => ({
				...item,
				value: config.aggregation === 'average' && item.count > 0 
					? item.value / item.count 
					: item.value
			}));
		}
	};

	const chartData = processData();

	const renderChart = () => {
		const commonProps = {
			width: "100%",
			height: config.height || 300,
		};

		switch (config.type) {
			case 'bar':
				return (
					<BarChart data={chartData}>
						{config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey="name" />
						<YAxis />
						{config.showTooltip && <Tooltip />}
						{config.showLegend && <Legend />}
						<Bar dataKey="value" fill={COLORS[0]} />
					</BarChart>
				);

			case 'line':
				return (
					<LineChart data={chartData}>
						{config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey="name" />
						<YAxis />
						{config.showTooltip && <Tooltip />}
						{config.showLegend && <Legend />}
						<Line type="monotone" dataKey="value" stroke={COLORS[0]} />
					</LineChart>
				);

			case 'pie':
				return (
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						{config.showTooltip && <Tooltip />}
					</PieChart>
				);

			case 'area':
				return (
					<AreaChart data={chartData}>
						{config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey="name" />
						<YAxis />
						{config.showTooltip && <Tooltip />}
						{config.showLegend && <Legend />}
						<Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
					</AreaChart>
				);

			case 'scatter':
				return (
					<ScatterChart>
						{config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey="name" />
						<YAxis />
						{config.showTooltip && <Tooltip />}
						{config.showLegend && <Legend />}
						<Scatter name="Data" data={chartData} fill={COLORS[0]} />
					</ScatterChart>
				);

			case 'radar':
				return (
					<RadarChart data={chartData}>
						<PolarGrid />
						<PolarAngleAxis dataKey="name" />
						<PolarRadiusAxis />
						{config.showTooltip && <Tooltip />}
						<Radar name="Value" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
					</RadarChart>
				);

			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>{config.title}</CardTitle>
				<div className="flex space-x-2">
					<Button variant="ghost" size="sm" onClick={onEdit}>
						<Settings2 className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" onClick={onDelete}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={config.height || 300}>
					{renderChart() || <div />}
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
};

export default function DirectoryAnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [queueData, setQueueData] = useState<any[]>([]);
	const [activeData, setActiveData] = useState<any[]>([]);
	const [pendingData, setPendingData] = useState<any[]>([]);
	const [pastData, setPastData] = useState<any[]>([]);
	const [charts, setCharts] = useState<ChartConfig[]>([]);
	const [showChartBuilder, setShowChartBuilder] = useState(false);
	const [editingChart, setEditingChart] = useState<ChartConfig | undefined>();
	const [currentTab, setCurrentTab] = useState("queue");

	useEffect(() => {
		fetchAllData();
		// Load saved charts from localStorage
		const savedCharts = localStorage.getItem('analyticsCharts');
		if (savedCharts) {
			setCharts(JSON.parse(savedCharts));
		}
	}, []);

	const fetchAllData = async () => {
		setLoading(true);
		try {
			const [queueRes, activeRes, pendingRes, pastRes] = await Promise.all([
				fetch("/api/queue"),
				fetch("/api/dhq-living-units?status=Occupied"),
				fetch("/api/allocations/requests?status=pending"),
				fetch("/api/allocations/past"),
			]);

			const [queueData, activeData, pendingData, pastData] = await Promise.all([
				queueRes.json(),
				activeRes.json(),
				pendingRes.json(),
				pastRes.json(),
			]);

			// Transform queue data
			const transformedQueue = (Array.isArray(queueData) ? queueData : (queueData as any).data || []).map((item: QueueData) => ({
				...item,
				armOfService: getArmOfService(item.svcNo),
				totalDependents: (item.noOfAdultDependents || 0) + (item.noOfChildDependents || 0),
				waitDays: Math.ceil((new Date().getTime() - new Date(item.entryDateTime).getTime()) / (1000 * 60 * 60 * 24)),
				entryMonth: new Date(item.entryDateTime).toLocaleString('default', { month: 'short' }),
				entryYear: new Date(item.entryDateTime).getFullYear(),
			}));

			// Transform active data
			const transformedActive = (Array.isArray(activeData) ? activeData : (activeData as any).data || []).map((item: ActiveData) => {
				const currentOccupant = item.occupants?.find((o: any) => o.isCurrent);
				const totalDependents = (currentOccupant?.queue?.noOfAdultDependents || 0) + (currentOccupant?.queue?.noOfChildDependents || 0);
				return {
					...item,
					armOfService: getArmOfService(item.currentOccupantServiceNumber),
					rank: item.currentOccupantRank,
					maritalStatus: currentOccupant?.queue?.maritalStatus || "Unknown",
					category: currentOccupant?.queue?.category || "Unknown",
					gender: currentOccupant?.queue?.gender || "Unknown",
					totalDependents,
					population: 1 + totalDependents,
					quarterName: item.quarterName || item.quarter_name || "Unknown",
					accommodationType: item.accommodationType?.name || "Unknown",
					hasBQ: item.bq ? "Yes" : "No",
				};
			});

			// Transform pending data
			const transformedPending = (Array.isArray(pendingData) ? pendingData : (pendingData as any).data || []).map((item: PendingData) => ({
				...item,
				armOfService: getArmOfService(item.personnelData?.serviceNumber || ""),
				rank: item.personnelData?.rank,
				maritalStatus: item.personnelData?.maritalStatus,
				category: item.personnelData?.category,
				gender: item.personnelData?.gender,
				accommodationType: item.unitData?.accommodationType,
				processingDays: Math.ceil((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
				createdMonth: new Date(item.createdAt).toLocaleString('default', { month: 'short' }),
			}));

			// Transform past data
			const transformedPast = (Array.isArray(pastData) ? pastData : (pastData as any).data || []).map((item: PastData) => ({
				...item,
				armOfService: getArmOfService(item.personnelData?.serviceNumber || ""),
				rank: item.personnelData?.rank,
				maritalStatus: item.queue?.maritalStatus || item.personnelData?.maritalStatus,
				category: item.queue?.category || item.personnelData?.category,
				gender: item.queue?.gender || item.personnelData?.gender,
				quarterName: item.unit?.quarterName,
				accommodationType: item.unitData?.accommodationType,
				durationCategory: 
					!item.durationDays ? "Unknown" :
					item.durationDays <= 30 ? "0-30 days" :
					item.durationDays <= 90 ? "31-90 days" :
					item.durationDays <= 180 ? "91-180 days" :
					item.durationDays <= 365 ? "181-365 days" : ">365 days",
				endMonth: item.allocationEndDate ? new Date(item.allocationEndDate).toLocaleString('default', { month: 'short' }) : "Ongoing",
				endYear: item.allocationEndDate ? new Date(item.allocationEndDate).getFullYear() : new Date().getFullYear(),
			}));

			setQueueData(transformedQueue);
			setActiveData(transformedActive);
			setPendingData(transformedPending);
			setPastData(transformedPast);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getDataForSource = (source: string) => {
		switch (source) {
			case 'queue': return queueData;
			case 'pending': return pendingData;
			case 'active': return activeData;
			case 'past': return pastData;
			default: return [];
		}
	};

	const handleSaveChart = (config: ChartConfig) => {
		const configWithTab = { ...config, tab: currentTab };
		let newCharts;
		if (editingChart) {
			newCharts = charts.map(c => c.id === editingChart.id ? configWithTab : c);
		} else {
			newCharts = [...charts, configWithTab];
		}
		setCharts(newCharts);
		localStorage.setItem('analyticsCharts', JSON.stringify(newCharts));
		setShowChartBuilder(false);
		setEditingChart(undefined);
	};

	const handleDeleteChart = (chartId: string) => {
		const newCharts = charts.filter(c => c.id !== chartId);
		setCharts(newCharts);
		localStorage.setItem('analyticsCharts', JSON.stringify(newCharts));
	};

	const handleEditChart = (chart: ChartConfig) => {
		setEditingChart(chart);
		setShowChartBuilder(true);
	};

	// Helper functions for calculations
	const getQueueAnalytics = () => {
		const totalInQueue = queueData.length;
		
		const waitTimes = queueData.map((person) => {
			const entryDate = new Date(person.entryDateTime);
			const today = new Date();
			const diffTime = Math.abs(today.getTime() - entryDate.getTime());
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		});

		const avgWaitTime = waitTimes.length > 0 
			? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
			: 0;
		
		const medianWaitTime = waitTimes.length > 0
			? waitTimes.sort((a, b) => a - b)[Math.floor(waitTimes.length / 2)]
			: 0;

		const byArm = queueData.reduce((acc, person) => {
			const arm = getArmOfService(person.svcNo);
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
			byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
		};
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
			const totalDeps = (currentOccupant?.queue?.noOfAdultDependents || 0) + 
				(currentOccupant?.queue?.noOfChildDependents || 0);
			return totalDeps > 0;
		}).length;

		const quarterOccupancy = activeData.reduce((acc, unit) => {
			const quarterName = unit.quarterName || unit.quarter_name || "Unknown";
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			const population = 1 + (currentOccupant?.queue?.noOfAdultDependents || 0) + 
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
			quarterOccupancy: Object.entries(quarterOccupancy).map(([quarter, data]) => ({
				quarter,
				units: (data as { units: number; population: number }).units,
				population: (data as { units: number; population: number }).population,
			})),
		};
	};

	const getDependentsImpact = () => {
		const totalDependents = activeData.reduce((acc, unit) => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			return acc + (currentOccupant?.queue?.noOfAdultDependents || 0) + 
				(currentOccupant?.queue?.noOfChildDependents || 0);
		}, 0);

		const dependentsByUnit = activeData.map(unit => {
			const currentOccupant = unit.occupants?.find((o: any) => o.isCurrent);
			const adults = currentOccupant?.queue?.noOfAdultDependents || 0;
			const children = currentOccupant?.queue?.noOfChildDependents || 0;
			
			return {
				unit: unit.quarterName || unit.quarter_name || "Unknown",
				adults,
				children,
				total: adults + children,
			};
		}).filter(u => u.total > 0)
			.sort((a, b) => b.total - a.total)
			.slice(0, 20);

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
			dependentsByUnit,
			avgDependentsPerUnit: activeData.length > 0 ? (totalDependents / activeData.length).toFixed(2) : "0",
		};
	};

	const getTurnoverStats = () => {
		const completedAllocations = pastData.filter(p => p.durationDays);
		
		const avgOccupancyDuration = completedAllocations.length > 0
			? Math.round(completedAllocations.reduce((acc, p) => acc + (p.durationDays || 0), 0) / completedAllocations.length)
			: 0;

		const quarterTurnover = pastData.reduce((acc, allocation) => {
			const quarterName = allocation.unit.quarterName;
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
			const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
			
			const count = pastData.filter(p => {
				if (!p.allocationEndDate) return false;
				const endDate = new Date(p.allocationEndDate);
				return endDate.getMonth() === date.getMonth() && 
					endDate.getFullYear() === date.getFullYear();
			}).length;

			return { month: monthYear, deallocations: count };
		}).reverse();

		return {
			avgOccupancyDuration,
			totalDeallocations: pastData.length,
			quarterTurnover: Object.entries(quarterTurnover).map(([quarter, data]) => {
				const typedData = data as { count: number; totalDuration: number };
				return {
					quarter,
					turnoverCount: typedData.count,
					avgDuration: typedData.count > 0 ? Math.round(typedData.totalDuration / typedData.count) : 0,
				};
			}),
			monthlyTurnover,
		};
	};

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	const queueAnalytics = getQueueAnalytics();
	const occupancyStats = getOccupancyStats();
	const dependentsImpact = getDependentsImpact();
	const turnoverStats = getTurnoverStats();

	const getChartsForTab = (tab: string) => {
		return charts.filter(chart => chart.tab === tab);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Directory Analytics</h1>
					<p className="text-muted-foreground">
						Real-time insights and analytics for accommodation management
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => fetchAllData()} variant="outline">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh Data
					</Button>
					<Dialog open={showChartBuilder} onOpenChange={(open) => {
						if (!open) {
							setShowChartBuilder(false);
							setEditingChart(undefined);
						}
					}}>
						<DialogTrigger asChild>
							<Button variant="default" onClick={() => {
								setEditingChart(undefined);
								setShowChartBuilder(true);
							}}>
								<Plus className="h-4 w-4 mr-2" />
								Add Chart
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-3xl">
							<DialogHeader>
								<DialogTitle>{editingChart ? 'Edit Chart' : 'Create New Chart'}</DialogTitle>
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
								currentTab={currentTab}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="queue">Queue</TabsTrigger>
					<TabsTrigger value="pending">Pending Allocation</TabsTrigger>
					<TabsTrigger value="active">Active Allocation</TabsTrigger>
					<TabsTrigger value="past">Past Allocations</TabsTrigger>
				</TabsList>

				{/* Queue Analytics */}
				<TabsContent value="queue" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Queue Size</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{queueAnalytics.totalInQueue}</div>
								<p className="text-xs text-muted-foreground">
									Personnel waiting
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{queueAnalytics.avgWaitTime} days</div>
								<p className="text-xs text-muted-foreground">
									Average duration
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Median Wait</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{queueAnalytics.medianWaitTime} days</div>
								<p className="text-xs text-muted-foreground">
									Median duration
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Categories</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{queueAnalytics.byCategory.length}</div>
								<p className="text-xs text-muted-foreground">
									Different categories
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Queue by Service Branch</CardTitle>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={queueAnalytics.byArm}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{queueAnalytics.byArm.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Queue by Category</CardTitle>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={queueAnalytics.byCategory}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="value" fill="#82ca9d" />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>

					{/* Custom Charts Section */}
					<Separator className="my-6" />
					<div className="mb-6">
						<h3 className="text-lg font-semibold">Custom Charts</h3>
						<p className="text-sm text-muted-foreground">Create custom visualizations with your preferred data</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{getChartsForTab('queue').map((chart) => (
							<DynamicChart
								key={chart.id}
								config={chart}
								data={getDataForSource(chart.dataSource)}
								onEdit={() => handleEditChart(chart)}
								onDelete={() => handleDeleteChart(chart.id)}
							/>
						))}
					</div>
				</TabsContent>

				{/* Pending Allocation Analytics */}
				<TabsContent value="pending" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Pending</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{pendingData.length}</div>
								<p className="text-xs text-muted-foreground">
									Awaiting approval
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{pendingData.length > 0 ? 
										Math.round(pendingData.reduce((acc, p) => {
											const created = new Date(p.createdAt);
											const now = new Date();
											return acc + Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
										}, 0) / pendingData.length)
									: 0} days
								</div>
								<p className="text-xs text-muted-foreground">
									Average wait time
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Officers</CardTitle>
								<Shield className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{pendingData.filter(p => p.category === "Officer").length}
								</div>
								<p className="text-xs text-muted-foreground">
									Officer requests
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">NCOs</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{pendingData.filter(p => p.category === "NCOs").length}
								</div>
								<p className="text-xs text-muted-foreground">
									NCO requests
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Custom Charts Section */}
					<Separator className="my-6" />
					<div className="mb-6">
						<h3 className="text-lg font-semibold">Custom Charts</h3>
						<p className="text-sm text-muted-foreground">Create custom visualizations with your preferred data</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{getChartsForTab('pending').map((chart) => (
							<DynamicChart
								key={chart.id}
								config={chart}
								data={getDataForSource(chart.dataSource)}
								onEdit={() => handleEditChart(chart)}
								onDelete={() => handleDeleteChart(chart.id)}
							/>
						))}
					</div>
				</TabsContent>

				{/* Active Allocation Analytics */}
				<TabsContent value="active" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Active</CardTitle>
								<Home className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{activeData.length}</div>
								<p className="text-xs text-muted-foreground">
									Currently occupied
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Population</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{occupancyStats.totalPopulation}</div>
								<p className="text-xs text-muted-foreground">
									Personnel + Dependents
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">With Dependents</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{occupancyStats.unitsWithDependents}</div>
								<p className="text-xs text-muted-foreground">
									{((occupancyStats.unitsWithDependents / activeData.length) * 100).toFixed(0)}% of units
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Dependents</CardTitle>
								<UserCheck className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{dependentsImpact.totalDependents}</div>
								<p className="text-xs text-muted-foreground">
									{dependentsImpact.adultDependents} adults, {dependentsImpact.childDependents} children
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Population by Quarter</CardTitle>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={occupancyStats.quarterOccupancy}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="quarter" angle={-45} textAnchor="end" height={100} />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="units" fill="#8884d8" name="Units" />
									<Bar dataKey="population" fill="#82ca9d" name="Total Population" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Custom Charts Section */}
					<Separator className="my-6" />
					<div className="mb-6">
						<h3 className="text-lg font-semibold">Custom Charts</h3>
						<p className="text-sm text-muted-foreground">Create custom visualizations with your preferred data</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{getChartsForTab('active').map((chart) => (
							<DynamicChart
								key={chart.id}
								config={chart}
								data={getDataForSource(chart.dataSource)}
								onEdit={() => handleEditChart(chart)}
								onDelete={() => handleDeleteChart(chart.id)}
							/>
						))}
					</div>
				</TabsContent>

				{/* Past Allocations Analytics */}
				<TabsContent value="past" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Past</CardTitle>
								<Archive className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{pastData.length}</div>
								<p className="text-xs text-muted-foreground">
									Historical allocations
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{turnoverStats.avgOccupancyDuration} days</div>
								<p className="text-xs text-muted-foreground">
									Average occupancy
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">This Month</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{pastData.filter(p => {
										if (!p.allocationEndDate) return false;
										const endDate = new Date(p.allocationEndDate);
										const now = new Date();
										return endDate.getMonth() === now.getMonth() && 
											endDate.getFullYear() === now.getFullYear();
									}).length}
								</div>
								<p className="text-xs text-muted-foreground">
									Deallocations
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Longest Stay</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{Math.max(...pastData.map(p => p.durationDays || 0), 0)} days
								</div>
								<p className="text-xs text-muted-foreground">
									Maximum duration
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Monthly Deallocation Trend</CardTitle>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={turnoverStats.monthlyTurnover}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis />
									<Tooltip />
									<Area type="monotone" dataKey="deallocations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
								</AreaChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Custom Charts Section */}
					<Separator className="my-6" />
					<div className="mb-6">
						<h3 className="text-lg font-semibold">Custom Charts</h3>
						<p className="text-sm text-muted-foreground">Create custom visualizations with your preferred data</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{getChartsForTab('past').map((chart) => (
							<DynamicChart
								key={chart.id}
								config={chart}
								data={getDataForSource(chart.dataSource)}
								onEdit={() => handleEditChart(chart)}
								onDelete={() => handleDeleteChart(chart.id)}
							/>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}