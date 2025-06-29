import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { useMaintenanceFilters } from "@/hooks/useMaintenanceFilters";

interface MaintenanceTask {
	id: string;
	unitId: string;
	unitName: string;
	quarterName: string;
	location: string;
	blockName: string;
	taskName: string;
	taskDescription: string;
	lastPerformedDate: string;
	nextDueDate: string;
	status: string;
	remarks: string;
	createdAt: string;
	updatedAt: string;
}

export function MaintenanceTaskTable({
	tasks,
	loading,
	onEdit,
	onDelete,
}: {
	tasks: MaintenanceTask[];
	loading: boolean;
	onEdit?: (task: MaintenanceTask) => void;
	onDelete?: (id: string) => void;
}) {
	const [deletingId, setDeletingId] = useState<string | null>(null);

	// Use the maintenance filters hook
	const {
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		priorityFilter,
		setPriorityFilter,
		categoryFilter,
		setCategoryFilter,
		quarterFilter,
		setQuarterFilter,
		locationFilter,
		setLocationFilter,
		filteredItems: filteredTasks,
		availableQuarters,
		availableLocations,
		availableCategories,
	} = useMaintenanceFilters(
		tasks,
		(task) => [
			task.unitName,
			task.quarterName,
			task.location,
			task.blockName,
			task.taskName,
			task.taskDescription,
			task.remarks,
		],
		(task) => task.status,
		undefined, // no priority for tasks
		undefined, // no category for tasks
		(task) => task.quarterName,
		(task) => task.location
	);

	const handleDelete = async (id: string) => {
		if (!onDelete) return;
		setDeletingId(id);
		try {
			await onDelete(id);
		} finally {
			setDeletingId(null);
		}
	};

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<>
			{/* Filters */}
			<MaintenanceFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				priorityFilter={priorityFilter}
				onPriorityChange={setPriorityFilter}
				categoryFilter={categoryFilter}
				onCategoryChange={setCategoryFilter}
				quarterFilter={quarterFilter}
				onQuarterChange={setQuarterFilter}
				locationFilter={locationFilter}
				onLocationChange={setLocationFilter}
				availableQuarters={availableQuarters}
				availableLocations={availableLocations}
				availableCategories={availableCategories}
			/>

			{/* Table */}
			{!filteredTasks.length ? (
				<div className='p-8 text-center text-muted-foreground bg-white dark:bg-card rounded-lg border'>
					{tasks.length === 0 
						? "No maintenance tasks yet." 
						: "No tasks match your search criteria."}
				</div>
			) : (
				<div className='rounded-lg overflow-x-auto border shadow-sm dark:bg-card'>
			<table className='min-w-full text-sm'>
				<thead>
					<tr className='bg-muted text-foreground'>
						<th className='p-3 text-left'>Unit Name</th>
						<th className='p-3 text-left'>Task Name</th>
						<th className='p-3 text-left'>Description</th>
						<th className='p-3 text-left'>Last Performed</th>
						<th className='p-3 text-left'>Next Due</th>
						<th className='p-3 text-left'>Status</th>
						<th className='p-3 text-left'>Remarks</th>
						{(onEdit || onDelete) && <th className='p-3 text-left'>Actions</th>}
					</tr>
				</thead>
				<tbody>
					{filteredTasks.map((task) => (
						<tr key={task.id} className='border-b hover:bg-muted/50'>
							<td className='p-3'>{task.unitName}</td>
							<td className='p-3 font-medium'>{task.taskName}</td>
							<td className='p-3 max-w-xs break-words'>
								{task.taskDescription}
							</td>
							<td className='p-3'>
								{task.lastPerformedDate
									? new Date(task.lastPerformedDate).toLocaleDateString()
									: "-"}
							</td>
							<td className='p-3'>
								{task.nextDueDate
									? new Date(task.nextDueDate).toLocaleDateString()
									: "-"}
							</td>
							<td className='p-3'>
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${
										task.status === "Completed"
											? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
											: task.status === "Overdue"
											? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
											: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
									}`}>
									{task.status}
								</span>
							</td>
							<td className='p-3'>{task.remarks}</td>
							{(onEdit || onDelete) && (
								<td className='p-3'>
									<div className='flex gap-2'>
										{onEdit && (
											<LoadingButton
												variant='outline'
												size='sm'
												onClick={() => onEdit(task)}
												disabled={deletingId === task.id}>
												<Edit className='h-3 w-3' />
											</LoadingButton>
										)}
										{onDelete && (
											<LoadingButton
												variant='outline'
												size='sm'
												onClick={() => handleDelete(task.id)}
												loading={deletingId === task.id}
												disabled={deletingId !== null}>
												<Trash2 className='h-3 w-3' />
											</LoadingButton>
										)}
									</div>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
			)}
		</>
	);
}
