"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/spinner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { Unit } from "@/types/queue";
import { usePermissions } from "@/hooks/usePermissions";

// API response type
interface ApiUnit {
	id: string;
	name: string;
	description: string | null;
	createdAt: string;
}

// Transform API response to match expected format
const transformUnit = (unit: ApiUnit): Unit => ({
	id: unit.id,
	name: unit.name,
	description: unit.description,
	createdAt: unit.createdAt,
});

// API functions
const fetchUnits = async (): Promise<Unit[]> => {
	const response = await fetch("/api/units");
	if (!response.ok) throw new Error("Failed to fetch units");
	const data: ApiUnit[] = await response.json();
	return data.map(transformUnit);
};

const createUnit = async (data: { name: string; description?: string }) => {
	const response = await fetch("/api/units", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error("Failed to create unit");
	return response.json();
};

const updateUnit = async ({
	id,
	...data
}: {
	id: string;
	name: string;
	description?: string;
}) => {
	const response = await fetch("/api/units", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id, ...data }),
	});
	if (!response.ok) throw new Error("Failed to update unit");
	return response.json();
};

const deleteUnit = async (id: string) => {
	const response = await fetch(`/api/units?id=${id}`, {
		method: "DELETE",
	});
	if (!response.ok) throw new Error("Failed to delete unit");
	return response.json();
};

export default function QueueUnitsPage() {
	const [showForm, setShowForm] = useState(false);
	const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const queryClient = useQueryClient();
	const { canAddQuarters, canEdit, canDelete } = usePermissions();

	// Fetch units
	const { data: units = [], isLoading } = useQuery({
		queryKey: ["units"],
		queryFn: fetchUnits,
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createUnit,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			toast.success("Quarters created successfully");
			handleCancel();
		},
		onError: () => {
			toast.error("Failed to create quarters");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: updateUnit,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			toast.success("Quarter updated successfully");
			handleCancel();
		},
		onError: () => {
			toast.error("Failed to update quarters");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteUnit,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			toast.success("Quarters deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete quarter");
		},
	});

	const handleAdd = () => {
		setEditingUnit(null);
		setFormData({ name: "", description: "" });
		setShowForm(true);
	};

	const handleEdit = (unit: Unit) => {
		setEditingUnit(unit);
		setFormData({
			name: unit.name,
			description: unit.description || "",
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this quarters?")) {
			return;
		}
		deleteMutation.mutate(id);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Quarter name is required");
			return;
		}

		if (editingUnit) {
			updateMutation.mutate({
				id: editingUnit.id,
				name: formData.name,
				description: formData.description,
			});
		} else {
			createMutation.mutate({
				name: formData.name,
				description: formData.description,
			});
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setEditingUnit(null);
		setFormData({ name: "", description: "" });
	};

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
						Quarters Management
					</h1>
					<p className='text-muted-foreground'>
						Manage quarters that appear in the Current Quarters dropdown
					</p>
				</div>
				{canAddQuarters("queue.units") && (
					<Button onClick={handleAdd} className='flex items-center gap-2'>
						<Plus className='h-4 w-4' />
						Add Quarters
					</Button>
				)}
			</div>

			{showForm && (
				<Card>
					<CardHeader>
						<CardTitle>{editingUnit ? "Edit" : "Add"} Quarters</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Quarter Name *</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder='Enter quarter name'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='description'>Description</Label>
									<Textarea
										id='description'
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder='Enter quarter description (optional)'
										rows={3}
									/>
								</div>
							</div>

							<div className='flex gap-4 pt-4'>
								<Button
									type='submit'
									className='flex items-center gap-2'
									disabled={
										createMutation.isPending || updateMutation.isPending
									}>
									<Save className='h-4 w-4' />
									{editingUnit ? "Update" : "Create"} Quarters
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={handleCancel}
									className='flex items-center gap-2'>
									<X className='h-4 w-4' />
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Quarters List</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Quarters Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Created Date</TableHead>
								<TableHead className='w-[120px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{units.map((unit) => (
								<TableRow key={unit.id}>
									<TableCell className='font-medium'>{unit.name}</TableCell>
									<TableCell>{unit.description || "No description"}</TableCell>
									<TableCell>
										{new Date(unit.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className='flex gap-2'>
											{canEdit("queue.units") && (
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEdit(unit)}>
													<Edit className='h-3 w-3' />
												</Button>
											)}
											{canDelete("queue.units") && (
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDelete(unit.id)}
													disabled={deleteMutation.isPending}>
													<Trash2 className='h-3 w-3' />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
							{units.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center text-muted-foreground'>
										No quarters found. Add your first quarters to get started.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
