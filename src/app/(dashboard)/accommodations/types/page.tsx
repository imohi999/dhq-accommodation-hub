"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { HousingType } from "@/types/accommodation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HousingTypes() {
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState<HousingType | null>(null);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const { toast } = useToast();

	const { data: housingTypes = [], error, isLoading } = useSWR<HousingType[]>(
		'/api/housing-types',
		fetcher
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast({
				title: "Error",
				description: "Housing type name is required",
				variant: "destructive",
			});
			return;
		}

		try {
			if (editingItem) {
				const response = await fetch(`/api/housing-types/${editingItem.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: formData.name,
						description: formData.description,
					}),
				});

				if (!response.ok) throw new Error("Failed to update housing type");

				toast({
					title: "Success",
					description: "Housing type updated successfully",
				});
			} else {
				const response = await fetch("/api/housing-types", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: formData.name,
						description: formData.description,
					}),
				});

				if (!response.ok) throw new Error("Failed to create housing type");

				toast({
					title: "Success",
					description: "Housing type created successfully",
				});
			}

			setShowForm(false);
			setEditingItem(null);
			setFormData({ name: "", description: "" });
			mutate('/api/housing-types');
		} catch (error) {
			console.error("Error:", error);
			toast({
				title: "Error",
				description: "Failed to save housing type",
				variant: "destructive",
			});
		}
	};

	const handleEdit = (item: HousingType) => {
		setEditingItem(item);
		setFormData({ name: item.name, description: item.description || "" });
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this housing type?")) {
			return;
		}

		try {
			const response = await fetch(`/api/housing-types/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete housing type");

			toast({
				title: "Success",
				description: "Housing type deleted successfully",
			});

			mutate('/api/housing-types');
		} catch (error) {
			console.error("Error:", error);
			toast({
				title: "Error",
				description: "Failed to delete housing type",
				variant: "destructive",
			});
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
							Error loading housing types. Please try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return <div className='flex justify-center p-8'>Loading...</div>;
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-[#1B365D]'>Housing Types</h1>
					<p className='text-muted-foreground'>
						Manage housing type categories for accommodation units
					</p>
				</div>
				<Dialog open={showForm} onOpenChange={setShowForm}>
					<DialogTrigger asChild>
						<Button
							onClick={() => setShowForm(true)}
							className='flex items-center gap-2'>
							<Plus className='h-4 w-4' />
							Add Housing Type
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingItem ? "Edit Housing Type" : "Add New Housing Type"}
							</DialogTitle>
							<DialogDescription>
								{editingItem
									? "Update the housing type details."
									: "Create a new housing type for accommodation units."}
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
									placeholder='Enter housing type name'
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
								<Button type='button' variant='outline' onClick={resetForm}>
									Cancel
								</Button>
								<Button type='submit'>
									{editingItem ? "Update" : "Create"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Housing Types</CardTitle>
					<CardDescription>
						Currently managing {housingTypes.length} housing types
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
												onClick={() => handleEdit(item)}>
												<Edit className='h-3 w-3' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleDelete(item.id)}>
												<Trash2 className='h-3 w-3' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{housingTypes.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className='text-center text-muted-foreground'>
										No housing types found
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
