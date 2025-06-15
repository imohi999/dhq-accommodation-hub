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
import { Edit, Trash2 } from "lucide-react";
import { QueueTableControls } from "@/components/queue/QueueTableControls";
import { QueueItem } from "@/types/queue";

interface QueueTableViewProps {
	queueItems: QueueItem[];
	onEdit: (item: QueueItem) => void;
	onDelete: (id: string) => void;
}

export const QueueTableView = ({
	queueItems,
	onEdit,
	onDelete,
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
			current_unit: true,
			phone: true,
			date_tos: true,
			date_sos: true,
			entry_date_time: true,
			appointment: true,
		}
	);

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
											<Button
												variant='outline'
												size='sm'
												onClick={() => onEdit(item)}>
												<Edit className='h-3 w-3' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => onDelete(item.id)}>
												<Trash2 className='h-3 w-3' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{queueItems.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={
											Object.values(visibleColumns).filter(Boolean).length + 1
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
		</div>
	);
};
