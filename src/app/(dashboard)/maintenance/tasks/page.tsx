"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingState } from "@/components/ui/spinner";
import { MaintenanceTaskForm } from "@/components/maintenance/MaintenanceTaskForm";
import { MaintenanceTaskTable } from "@/components/maintenance/MaintenanceTaskTable";
import useSWR, { mutate } from "swr";

export interface MaintenanceTask {
	id: string;
	unitId: string;
	unitName: string;
	taskName: string;
	taskDescription: string;
	lastPerformedDate: string;
	nextDueDate: string;
	status: string;
	remarks: string;
	createdAt: string;
	updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MaintenanceTasksPage() {
	const [showForm, setShowForm] = useState(false);
	const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);

	const {
		data: tasks = [],
		error,
		isLoading,
	} = useSWR<MaintenanceTask[]>("/api/maintenance/tasks", fetcher);

	const handleAdd = () => {
		setEditingTask(null);
		setShowForm(true);
	};

	const handleEdit = (task: MaintenanceTask) => {
		setEditingTask(task);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this maintenance task?")) return;

		try {
			const response = await fetch(`/api/maintenance/tasks/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete task");

			toast.success("Task deleted successfully");
			mutate("/api/maintenance/tasks");
		} catch (error) {
			console.error("Error deleting task:", error);
			toast.error("Failed to delete task");
		}
	};

	const handleSubmitComplete = () => {
		setShowForm(false);
		setEditingTask(null);
		mutate("/api/maintenance/tasks");
	};

	if (error) {
		return (
			<div className='flex justify-center p-8'>
				<div className='text-center'>
					<p className='text-destructive'>
						Error loading maintenance tasks. Please try again later.
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingState isLoading={true} children={null} />;
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D]'>
						Maintenance Tasks
					</h1>
					<p className='text-muted-foreground'>
						Manage scheduled maintenance tasks for accommodation units
					</p>
				</div>
				<Button onClick={handleAdd} className='flex items-center gap-2'>
					<Plus className='h-4 w-4' />
					New Task
				</Button>
			</div>

			{showForm && (
				<MaintenanceTaskForm
					initial={editingTask}
					onClose={() => setShowForm(false)}
					onComplete={handleSubmitComplete}
				/>
			)}

			<MaintenanceTaskTable
				tasks={tasks}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
