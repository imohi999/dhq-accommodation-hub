import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Eye } from "lucide-react";
import { QueueTableControls } from "@/components/queue/QueueTableControls";
import { QueueItem } from "@/types/queue";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface QueueTableViewProps {
	queueItems: QueueItem[];
	onEdit: (item: QueueItem) => void;
	onDelete: (id: string) => void;
	deletingIds?: Set<string>;
	canEdit?: boolean;
	canDelete?: boolean;
	selectedIds?: Set<string>;
	onSelectItem?: (id: string, checked: boolean) => void;
	showSelection?: boolean;
}

export const QueueTableView = ({
	queueItems,
	onEdit,
	onDelete,
	deletingIds = new Set(),
	canEdit = true,
	canDelete = true,
	selectedIds = new Set(),
	onSelectItem,
	showSelection = false,
}: QueueTableViewProps) => {
	// Column visibility state - all visible by default
	const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
		{
			sequence: true,
			full_name: true,
			svc_no: true,
			gender: true,
			arm_of_service: true,
			category: true,
			rank: true,
			marital_status: true,
			no_of_adult_dependents: true,
			no_of_child_dependents: true,
			dependents: true,
			current_unit: true,
			phone: true,
			date_tos: true,
			date_sos: true,
			entry_date_time: true,
			appointment: true,
		}
	);
	const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

	const handleColumnVisibilityChange = (column: string, visible: boolean) => {
		setVisibleColumns((prev) => ({
			...prev,
			[column]: visible,
		}));
	};

	return (
		<div>
			<QueueTableControls
				data={queueItems}
				visibleColumns={visibleColumns}
				onColumnVisibilityChange={handleColumnVisibilityChange}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Personnel Queue</CardTitle>
					<CardDescription>
						Current waiting list with {queueItems.length} personnel
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								{showSelection && (
									<TableHead className='w-[50px]'>
										<span className="sr-only">Select</span>
									</TableHead>
								)}
								{visibleColumns.sequence && (
									<TableHead className='w-[60px]'>Seq</TableHead>
								)}
								{visibleColumns.full_name && <TableHead>Full Name</TableHead>}
								{visibleColumns.svc_no && <TableHead>Service No</TableHead>}
								{visibleColumns.gender && <TableHead>Gender</TableHead>}
								{visibleColumns.arm_of_service && (
									<TableHead>Service</TableHead>
								)}
								{visibleColumns.category && <TableHead>Category</TableHead>}
								{visibleColumns.rank && <TableHead>Rank</TableHead>}
								{visibleColumns.marital_status && (
									<TableHead>Marital Status</TableHead>
								)}
								{visibleColumns.no_of_adult_dependents && (
									<TableHead>Adult Deps</TableHead>
								)}
								{visibleColumns.no_of_child_dependents && (
									<TableHead>Child Deps</TableHead>
								)}
								{visibleColumns.dependents && (
									<TableHead>Dependents</TableHead>
								)}
								{visibleColumns.current_unit && <TableHead>Unit</TableHead>}
								{visibleColumns.phone && <TableHead>Phone</TableHead>}
								{visibleColumns.date_tos && <TableHead>Date TOS</TableHead>}
								{visibleColumns.date_sos && <TableHead>Date SOS</TableHead>}
								{visibleColumns.entry_date_time && (
									<TableHead>Entry Date</TableHead>
								)}
								{visibleColumns.appointment && (
									<TableHead>Appointment</TableHead>
								)}
								<TableHead className='w-[100px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{queueItems.map((item, index) => (
								<TableRow key={item.id}>
									{showSelection && (
										<TableCell>
											<Checkbox
												checked={selectedIds.has(item.id)}
												onCheckedChange={(checked) => 
													onSelectItem?.(item.id, checked as boolean)
												}
											/>
										</TableCell>
									)}
									{visibleColumns.sequence && (
										<TableCell className='font-medium'>#{index + 1}</TableCell>
									)}
									{visibleColumns.full_name && (
										<TableCell>{item.full_name}</TableCell>
									)}
									{visibleColumns.svc_no && (
										<TableCell>{item.svc_no}</TableCell>
									)}
									{visibleColumns.gender && (
										<TableCell>{item.gender}</TableCell>
									)}
									{visibleColumns.arm_of_service && (
										<TableCell>{item.arm_of_service}</TableCell>
									)}
									{visibleColumns.category && (
										<TableCell>{item.category}</TableCell>
									)}
									{visibleColumns.rank && <TableCell>{item.rank}</TableCell>}
									{visibleColumns.marital_status && (
										<TableCell>{item.marital_status}</TableCell>
									)}
									{visibleColumns.no_of_adult_dependents && (
										<TableCell>{item.no_of_adult_dependents}</TableCell>
									)}
									{visibleColumns.no_of_child_dependents && (
										<TableCell>{item.no_of_child_dependents}</TableCell>
									)}
									{visibleColumns.dependents && (
										<TableCell>
											{item.dependents && item.dependents.length > 0 ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setSelectedItem(item)}
													className="text-xs"
												>
													<Eye className="h-3 w-3 mr-1" />
													View ({item.dependents.length})
												</Button>
											) : (
												<span className="text-muted-foreground">None</span>
											)}
										</TableCell>
									)}
									{visibleColumns.current_unit && (
										<TableCell>{item.current_unit || "N/A"}</TableCell>
									)}
									{visibleColumns.phone && (
										<TableCell>{item.phone || "N/A"}</TableCell>
									)}
									{visibleColumns.date_tos && (
										<TableCell>
											{item.date_tos
												? new Date(item.date_tos).toLocaleDateString()
												: "N/A"}
										</TableCell>
									)}
									{visibleColumns.date_sos && (
										<TableCell>
											{item.date_sos
												? new Date(item.date_sos).toLocaleDateString()
												: "N/A"}
										</TableCell>
									)}
									{visibleColumns.entry_date_time && (
										<TableCell>
											{new Date(item.entry_date_time).toLocaleDateString()}
										</TableCell>
									)}
									{visibleColumns.appointment && (
										<TableCell>{item.appointment || "N/A"}</TableCell>
									)}
									<TableCell>
										<div className='flex gap-2'>
											{canEdit && (
												<Button
													variant='outline'
													size='sm'
													onClick={() => onEdit(item)}>
													<Edit className='h-3 w-3' />
												</Button>
											)}
											{canDelete && (
												<LoadingButton
													variant='outline'
													size='sm'
													loading={deletingIds.has(item.id)}
													onClick={() => onDelete(item.id)}>
													<Trash2 className='h-3 w-3' />
												</LoadingButton>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
							{queueItems.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={
											Object.values(visibleColumns).filter(Boolean).length + 
											1 + // Actions column
											(showSelection ? 1 : 0) // Selection column
										}
										className='text-center text-muted-foreground'>
										No personnel matching current filters
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			
			{/* Dependents Dialog */}
			<Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Dependents Details</DialogTitle>
						<DialogDescription>
							{selectedItem?.full_name} - {selectedItem?.svc_no}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedItem?.dependents && selectedItem.dependents.length > 0 ? (
							<div className="space-y-2">
								{selectedItem.dependents.map((dependent, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex items-center gap-4">
											<span className="font-medium">{dependent.name}</span>
											<Badge variant="outline" className="text-xs">
												{dependent.gender}
											</Badge>
											<span className="text-sm text-muted-foreground">
												{dependent.age} years
											</span>
										</div>
										<Badge variant="secondary" className="text-xs">
											{dependent.age >= 18 ? "Adult" : "Child"}
										</Badge>
									</div>
								))}
							</div>
						) : (
							<p className="text-center text-muted-foreground">No dependents</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
