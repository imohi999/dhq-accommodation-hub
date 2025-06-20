"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AccommodationType } from "@/types/accommodation";
import { toast } from "react-toastify";
import { LoadingState } from "@/components/ui/spinner";
import { LoadingButton } from "@/components/ui/loading-button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HousingTypes() {
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState<AccommodationType | null>(
		null
	);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	const {
		data: housingTypes = [],
		error,
		isLoading,
	} = useSWR<AccommodationType[]>("/api/accommodation-types", fetcher);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Accommodation type name is required");
			return;
		}

		setIsSubmitting(true);
		try {
			if (editingItem) {
				const response = await fetch(
					`/api/accommodation-types/${editingItem.id}`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: formData.name,
							description: formData.description,
						}),
					}
				);

				if (!response.ok)
					throw new Error("Failed to update accommodation type");

				toast.success("Accommodation type updated successfully");
			} else {
				const response = await fetch("/api/accommodation-types", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: formData.name,
						description: formData.description,
					}),
				});

				if (!response.ok)
					throw new Error("Failed to create accommodation type");

				toast.success("Accommodation type created successfully");
			}

			setShowForm(false);
			setEditingItem(null);
			setFormData({ name: "", description: "" });
			mutate("/api/accommodation-types");
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to save accommodation type");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (item: AccommodationType) => {
		setEditingItem(item);
		setFormData({ name: item.name, description: item.description || "" });
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this accommodation type?")) {
			return;
		}

		setIsDeleting(id);
		try {
			const response = await fetch(`/api/accommodation-types/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete accommodation type");

			toast.success("Accommodation type deleted successfully");

			mutate("/api/accommodation-types");
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to delete accommodation type");
		} finally {
			setIsDeleting(null);
		}
	};

	const resetForm = () => {
		setFormData({ name: "", description: "" });
		setEditingItem(null);
		setShowForm(false);
	};

	if (error) {
		return (
			<div className='flex justify-center p-8'>
				<Card className='w-full max-w-md'>
					<CardContent className='pt-6'>
						<p className='text-destructive text-center'>
							Error loading accommodation types. Please try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D]'>
						Accommodation Types
					</h1>
					<p className='text-muted-foreground'>
						Manage accommodation type categories for accommodation quarters
					</p>
				</div>
				<Dialog open={showForm} onOpenChange={setShowForm}>
					<DialogTrigger asChild>
						<Button
							onClick={() => setShowForm(true)}
							className='flex items-center gap-2'>
							<Plus className='h-4 w-4' />
							Add Accommodation Type
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingItem
									? "Edit Accommodation Type"
									: "Add New Accommodation Type"}
							</DialogTitle>
							<DialogDescription>
								{editingItem
									? "Update the accommodation type details."
									: "Create a new accommodation type for accommodation quarters."}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div>
								<Label htmlFor='name'>Name *</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder='Enter accommodation type name'
									required
								/>
							</div>
							<div>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder='Enter description (optional)'
								/>
							</div>
							<div className='flex justify-end gap-2'>
								<Button
									type='button'
									variant='outline'
									onClick={resetForm}
									disabled={isSubmitting}>
									Cancel
								</Button>
								<LoadingButton
									type='submit'
									loading={isSubmitting}
									loadingText={editingItem ? "Updating..." : "Creating..."}>
									{editingItem ? "Update" : "Create"}
								</LoadingButton>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Accommodation Types</CardTitle>
					<CardDescription>
						Currently managing {housingTypes.length} accommodation types
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className='w-[100px]'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{housingTypes.map((item) => (
								<TableRow key={item.id}>
									<TableCell className='font-medium'>{item.name}</TableCell>
									<TableCell>{item.description || "No description"}</TableCell>
									<TableCell>
										{new Date(item.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleEdit(item)}
												disabled={isDeleting === item.id}>
												<Edit className='h-3 w-3' />
											</Button>
											<LoadingButton
												variant='outline'
												size='sm'
												onClick={() => handleDelete(item.id)}
												loading={isDeleting === item.id}
												disabled={isDeleting !== null}>
												<Trash2 className='h-3 w-3' />
											</LoadingButton>
										</div>
									</TableCell>
								</TableRow>
							))}
							{housingTypes.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center text-muted-foreground'>
										No accommodation types found
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
