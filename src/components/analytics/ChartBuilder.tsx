"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export interface ChartConfig {
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
	tab?: string;
}

export const dataSourceFields = {
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

export const ChartBuilder = ({ 
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