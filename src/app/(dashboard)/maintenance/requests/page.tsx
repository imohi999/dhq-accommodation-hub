"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingState } from "@/components/ui/spinner";
import { MaintenanceRequestForm } from "@/components/maintenance/MaintenanceRequestForm";
import { MaintenanceRequestTable } from "@/components/maintenance/MaintenanceRequestTable";
import useSWR, { mutate } from "swr";

export interface MaintenanceRequest {
	id: string;
	unitId: string;
	unitName: string;
	issueCategory: string;
	issueDescription: string;
	priorityLevel: string;
	reportedBy: string;
	reportedAt: string;
	status: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MaintenanceRequestsPage() {
	const [showForm, setShowForm] = useState(false);
	const [editingRequest, setEditingRequest] =
		useState<MaintenanceRequest | null>(null);

	const {
		data: requests = [],
		error,
		isLoading,
	} = useSWR<MaintenanceRequest[]>("/api/maintenance/requests", fetcher);

	const handleAdd = () => {
		setEditingRequest(null);
		setShowForm(true);
	};

	const handleEdit = (request: MaintenanceRequest) => {
		setEditingRequest(request);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this maintenance request?")) return;

		try {
			const response = await fetch(`/api/maintenance/requests/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete request");

			toast.success("Request deleted successfully");
			mutate("/api/maintenance/requests");
		} catch (error) {
			console.error("Error deleting request:", error);
			toast.error("Failed to delete request");
		}
	};

	const handleSubmitComplete = () => {
		setShowForm(false);
		setEditingRequest(null);
		mutate("/api/maintenance/requests");
	};

	if (error) {
		return (
			<div className='flex justify-center p-8'>
				<div className='text-center'>
					<p className='text-destructive'>
						Error loading maintenance requests. Please try again later.
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
						Maintenance Requests
					</h1>
					<p className='text-muted-foreground'>
						Manage maintenance requests for accommodation units
					</p>
				</div>
				<Button onClick={handleAdd} className='flex items-center gap-2'>
					<Plus className='h-4 w-4' />
					New Request
				</Button>
			</div>

			{showForm && (
				<MaintenanceRequestForm
					initial={editingRequest}
					onClose={() => setShowForm(false)}
					onComplete={handleSubmitComplete}
				/>
			)}

			<MaintenanceRequestTable
				requests={requests}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
