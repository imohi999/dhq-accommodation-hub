import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "react-toastify";
interface MaintenanceTask {
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
import { useAllUnits } from "@/hooks/useAllUnits";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

const TASK_STATUSES = ["Pending", "Completed", "Overdue"];

export function MaintenanceTaskForm({
	initial,
	onClose,
	onComplete,
}: {
	initial?: MaintenanceTask | null;
	onClose?: () => void;
	onComplete?: () => void;
}) {
	const [form, setForm] = useState({
		taskName: "",
		taskDescription: "",
		lastPerformedDate: "",
		nextDueDate: "",
		status: "Pending",
		remarks: "",
	});
	const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const { units, loading } = useAllUnits();

	useEffect(() => {
		if (initial) {
			setForm({
				taskName: initial.taskName || "",
				taskDescription: initial.taskDescription || "",
				lastPerformedDate: initial.lastPerformedDate || "",
				nextDueDate: initial.nextDueDate || "",
				status: initial.status || "Pending",
				remarks: initial.remarks || "",
			});
			setSelectedUnits([initial.unitId]);
		} else {
			setForm({
				taskName: "",
				taskDescription: "",
				lastPerformedDate: "",
				nextDueDate: "",
				status: "Pending",
				remarks: "",
			});
			setSelectedUnits([]);
		}
	}, [initial]);

	const handleUnitToggle = (unitId: string) => {
		setSelectedUnits((prev) =>
			prev.includes(unitId)
				? prev.filter((id) => id !== unitId)
				: [...prev, unitId]
		);
	};

	const handleSelectAll = () => {
		if (selectedUnits.length === units.length) {
			setSelectedUnits([]);
		} else {
			setSelectedUnits(
				units.map((unit: DHQLivingUnitWithHousingType) => unit.id)
			);
		}
	};

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (selectedUnits.length === 0) {
			toast.error("Please select at least one unit");
			return;
		}

		setSubmitting(true);

		try {
			if (initial && initial.id) {
				// Update existing task
				const selectedUnit = units.find((u) => u.id === selectedUnits[0]);
				const updateData = {
					...form,
					unitId: selectedUnits[0],
					unitName: selectedUnit?.unitName || "",
					recordType: "task",
				};

				const response = await fetch(`/api/maintenance/tasks/${initial.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updateData),
				});

				if (!response.ok) throw new Error("Failed to update task");
			} else {
				// Create new tasks for selected units
				const tasksToInsert = selectedUnits.map((unitId) => {
					const unit = units.find((u) => u.id === unitId);
					return {
						...form,
						unitId: unitId,
						unitName: unit?.unitName || "",
						recordType: "task",
					};
				});

				const response = await fetch("/api/maintenance/tasks", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ tasks: tasksToInsert }),
				});

				if (!response.ok) throw new Error("Failed to create tasks");
			}

			toast.success(
				initial
					? "Task updated successfully"
					: `${selectedUnits.length} task(s) created successfully`
			);
			if (onComplete) onComplete();
		} catch (error) {
			console.error("Error saving task:", error);
			toast.error("Failed to save task");
		}

		setSubmitting(false);
	}

	if (loading) {
		return <div className='p-6 text-muted-foreground'>Loading units...</div>;
	}

	return (
		<div className='bg-white dark:bg-card border rounded-lg p-6 mb-6 space-y-6 shadow-lg'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<Label>Task Name</Label>
						<Input
							value={form.taskName}
							onChange={(e) =>
								setForm((f) => ({ ...f, taskName: e.target.value }))
							}
							required
							autoComplete='off'
						/>
					</div>
					<div>
						<Label>Status</Label>
						<Select
							value={form.status}
							onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
							required>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select Status' />
							</SelectTrigger>
							<SelectContent>
								{TASK_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div>
					<Label>Task Description</Label>
					<Textarea
						value={form.taskDescription}
						onChange={(e) =>
							setForm((f) => ({ ...f, taskDescription: e.target.value }))
						}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<Label>Last Performed Date</Label>
						<Input
							type='date'
							value={form.lastPerformedDate}
							onChange={(e) =>
								setForm((f) => ({ ...f, lastPerformedDate: e.target.value }))
							}
						/>
					</div>
					<div>
						<Label>Next Due Date</Label>
						<Input
							type='date'
							value={form.nextDueDate}
							onChange={(e) =>
								setForm((f) => ({ ...f, nextDueDate: e.target.value }))
							}
						/>
					</div>
				</div>

				<div>
					<Label>Remarks</Label>
					<Input
						value={form.remarks}
						onChange={(e) =>
							setForm((f) => ({ ...f, remarks: e.target.value }))
						}
						autoComplete='off'
					/>
				</div>

				<div className='flex gap-2'>
					<LoadingButton
						type='submit'
						loading={submitting}
						loadingText={initial ? "Updating..." : "Creating..."}>
						{initial
							? "Update Task"
							: `Create Task${
									selectedUnits.length > 1 ? `s (${selectedUnits.length})` : ""
							  }`}
					</LoadingButton>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						disabled={submitting}>
						Cancel
					</Button>
				</div>
			</form>

			{!initial && (
				<div className='border-t pt-6'>
					<h3 className='text-lg font-semibold mb-4'>Select Quarters</h3>

					<div className='mt-4 mb-2'>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='selectAll'
								checked={
									selectedUnits.length === units.length && units.length > 0
								}
								onCheckedChange={handleSelectAll}
							/>
							<label htmlFor='selectAll' className='text-sm font-medium'>
								Select All ({units.length} quarters)
							</label>
						</div>
					</div>

					<div className='max-h-64 overflow-y-auto border rounded-lg'>
						<div className='grid gap-2 p-4'>
							{units.map((unit: DHQLivingUnitWithHousingType) => (
								<div key={unit.id} className='flex items-center space-x-2'>
									<Checkbox
										id={unit.id}
										checked={selectedUnits.includes(unit.id)}
										onCheckedChange={() => handleUnitToggle(unit.id)}
									/>
									<label htmlFor={unit.id} className='text-sm'>
										{unit.unitName} - {unit.quarterName} ({unit.status})
									</label>
								</div>
							))}
						</div>
					</div>

					<div className='mt-2 text-sm text-muted-foreground'>
						Selected: {selectedUnits.length} unit(s)
					</div>
				</div>
			)}
		</div>
	);
}
