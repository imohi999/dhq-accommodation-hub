import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Trash2, Edit } from "lucide-react";
import { useState } from "react";

interface MaintenanceRequest {
	id: string;
	unitId: string;
	unitName: string;
	issueCategory: string;
	issueDescription: string;
	priorityLevel: string;
	reportedBy: string;
	reportedAt: string;
	status: string;
	remarks: string;
	createdAt: string;
	updatedAt: string;
}

export function MaintenanceRequestTable({
	requests,
	loading,
	onEdit,
	onDelete,
}: {
	requests: MaintenanceRequest[];
	loading: boolean;
	onEdit: (req: MaintenanceRequest) => void;
	onDelete: (id: string) => void;
}) {
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleDelete = async (id: string) => {
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

	if (!requests.length) {
		return (
			<div className='p-8 text-center text-muted-foreground'>
				No maintenance requests yet.
			</div>
		);
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "Emergency":
				return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
			case "High":
				return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400";
			case "Medium":
				return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
			case "Low":
				return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
			default:
				return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
			case "In Progress":
				return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
			case "Rejected":
				return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
			case "Pending":
				return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
			default:
				return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400";
		}
	};

	return (
		<div className='rounded-lg overflow-x-auto border shadow-sm bg-white dark:bg-card'>
			<table className='min-w-full text-sm'>
				<thead>
					<tr className='bg-muted text-foreground'>
						<th className='p-3 text-left'>Unit Name</th>
						<th className='p-3 text-left'>Category</th>
						<th className='p-3 text-left'>Priority</th>
						<th className='p-3 text-left'>Reported By</th>
						<th className='p-3 text-left'>Reported Date</th>
						<th className='p-3 text-left'>Status</th>
						<th className='p-3 text-left'>Description</th>
						<th className='p-3 text-left'>Remarks</th>
						<th className='p-3 text-left'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{requests.map((req) => (
						<tr key={req.id} className='border-b hover:bg-muted/50'>
							<td className='p-3 font-medium'>{req.unitName}</td>
							<td className='p-3'>{req.issueCategory}</td>
							<td className='p-3'>
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
										req.priorityLevel
									)}`}>
									{req.priorityLevel}
								</span>
							</td>
							<td className='p-3'>{req.reportedBy}</td>
							<td className='p-3'>
								{req.reportedAt
									? new Date(req.reportedAt).toLocaleDateString()
									: "-"}
							</td>
							<td className='p-3'>
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
										req.status
									)}`}>
									{req.status}
								</span>
							</td>
							<td className='p-3 max-w-xs break-words'>
								{req.issueDescription}
							</td>
							<td className='p-3'>{req.remarks}</td>
							<td className='p-3'>
								<div className='flex gap-2'>
									<LoadingButton
										variant='outline'
										size='sm'
										onClick={() => onEdit(req)}
										disabled={deletingId === req.id}>
										<Edit className='h-3 w-3' />
									</LoadingButton>
									<LoadingButton
										variant='outline'
										size='sm'
										onClick={() => handleDelete(req.id)}
										loading={deletingId === req.id}
										disabled={deletingId !== null}>
										<Trash2 className='h-3 w-3' />
									</LoadingButton>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
