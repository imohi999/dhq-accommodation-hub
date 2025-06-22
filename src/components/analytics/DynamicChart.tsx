"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, X } from "lucide-react";
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
import { ChartConfig } from "./ChartBuilder";

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

// Common theme-aware styles for charts
const axisStyle = {
	tick: {
		fill: "hsl(var(--foreground))",
		fontSize: 12,
		fontWeight: 500,
	},
	axisLine: {
		stroke: "hsl(var(--foreground) / 0.5)",
		strokeWidth: 1,
	},
	tickLine: {
		stroke: "hsl(var(--foreground) / 0.3)",
	},
	label: {
		fill: "hsl(var(--foreground))",
		fontSize: 14,
		fontWeight: 600,
		offset: -5,
	},
};

const tooltipStyle = {
	contentStyle: {
		backgroundColor: "hsl(var(--background))",
		border: "1px solid hsl(var(--border))",
		borderRadius: "6px",
		color: "hsl(var(--foreground))",
	},
	labelStyle: {
		color: "hsl(var(--foreground))",
	},
};

const legendStyle = {
	wrapperStyle: {
		color: "hsl(var(--foreground))",
	},
};

const gridStyle = {
	stroke: "hsl(var(--foreground) / 0.1)",
};

export const DynamicChart = ({
	config,
	data,
	onEdit,
	onDelete,
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
			config.filters.forEach((filter) => {
				// Implement filter logic
			});
		}

		// Transform data for the chart
		if (config.type === "pie") {
			// Group by the specified field
			const grouped = filteredData.reduce((acc, item) => {
				const key = item[config.groupBy || "category"] || "Unknown";
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
				const key = item[config.xAxis || "category"] || "Unknown";
				if (!acc[key]) {
					acc[key] = { name: key, value: 0, count: 0 };
				}

				if (config.yAxis === "_count" || !config.yAxis) {
					acc[key].value++;
				} else {
					const yValue = item[config.yAxis] || 0;
					if (config.aggregation === "sum") {
						acc[key].value += yValue;
					} else if (config.aggregation === "average") {
						acc[key].value += yValue;
						acc[key].count++;
					} else if (config.aggregation === "min") {
						acc[key].value =
							acc[key].value === 0 ? yValue : Math.min(acc[key].value, yValue);
					} else if (config.aggregation === "max") {
						acc[key].value = Math.max(acc[key].value, yValue);
					} else {
						acc[key].value++;
					}
				}
				return acc;
			}, {} as Record<string, any>);

			return Object.values(grouped).map((item: any) => ({
				...item,
				value:
					config.aggregation === "average" && item.count > 0
						? item.value / item.count
						: item.value,
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
			case "bar":
				return (
					<BarChart data={chartData}>
						{config.showGrid && (
							<CartesianGrid strokeDasharray='3 3' {...gridStyle} />
						)}
						<XAxis
							dataKey='name'
							{...axisStyle}
							angle={chartData.length > 5 ? -45 : 0}
							textAnchor={chartData.length > 5 ? "end" : "middle"}
							height={chartData.length > 5 ? 100 : 60}
						/>
						<YAxis {...axisStyle} width={60} />
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
						{config.showLegend && <Legend {...legendStyle} />}
						<Bar dataKey='value' fill={COLORS[0]} />
					</BarChart>
				);

			case "line":
				return (
					<LineChart data={chartData}>
						{config.showGrid && (
							<CartesianGrid strokeDasharray='3 3' {...gridStyle} />
						)}
						<XAxis
							dataKey='name'
							{...axisStyle}
							angle={chartData.length > 5 ? -45 : 0}
							textAnchor={chartData.length > 5 ? "end" : "middle"}
							height={chartData.length > 5 ? 100 : 60}
						/>
						<YAxis {...axisStyle} width={60} />
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
						{config.showLegend && <Legend {...legendStyle} />}
						<Line type='monotone' dataKey='value' stroke={COLORS[0]} />
					</LineChart>
				);

			case "pie":
				return (
					<PieChart>
						<Pie
							data={chartData}
							cx='50%'
							cy='50%'
							labelLine={false}
							label={({ name, percent }) =>
								`${name} ${(percent * 100).toFixed(0)}%`
							}
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
					</PieChart>
				);

			case "area":
				return (
					<AreaChart data={chartData}>
						{config.showGrid && (
							<CartesianGrid strokeDasharray='3 3' {...gridStyle} />
						)}
						<XAxis
							dataKey='name'
							{...axisStyle}
							angle={chartData.length > 5 ? -45 : 0}
							textAnchor={chartData.length > 5 ? "end" : "middle"}
							height={chartData.length > 5 ? 100 : 60}
						/>
						<YAxis {...axisStyle} width={60} />
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
						{config.showLegend && <Legend {...legendStyle} />}
						<Area
							type='monotone'
							dataKey='value'
							stroke={COLORS[0]}
							fill={COLORS[0]}
							fillOpacity={0.6}
						/>
					</AreaChart>
				);

			case "scatter":
				return (
					<ScatterChart>
						{config.showGrid && (
							<CartesianGrid strokeDasharray='3 3' {...gridStyle} />
						)}
						<XAxis
							dataKey='name'
							{...axisStyle}
							angle={chartData.length > 5 ? -45 : 0}
							textAnchor={chartData.length > 5 ? "end" : "middle"}
							height={chartData.length > 5 ? 100 : 60}
						/>
						<YAxis {...axisStyle} width={60} />
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
						{config.showLegend && <Legend {...legendStyle} />}
						<Scatter name='Data' data={chartData} fill={COLORS[0]} />
					</ScatterChart>
				);

			case "radar":
				return (
					<RadarChart data={chartData}>
						<PolarGrid {...gridStyle} />
						<PolarAngleAxis
							dataKey='name'
							tick={{ fill: "hsl(var(--foreground))" }}
						/>
						<PolarRadiusAxis tick={{ fill: "hsl(var(--foreground))" }} />
						{config.showTooltip && <Tooltip {...tooltipStyle} />}
						<Radar
							name='Value'
							dataKey='value'
							stroke={COLORS[0]}
							fill={COLORS[0]}
							fillOpacity={0.6}
						/>
					</RadarChart>
				);

			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>{config.title}</CardTitle>
				<div className='flex space-x-2'>
					<Button variant='ghost' size='sm' onClick={onEdit}>
						<Settings2 className='h-4 w-4' />
					</Button>
					<Button variant='ghost' size='sm' onClick={onDelete}>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width='100%' height={config.height || 300}>
					{renderChart() || <div />}
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
};
