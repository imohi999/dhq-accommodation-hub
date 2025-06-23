import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Wrench, Calendar, DollarSign, AlertCircle, ListChecks } from "lucide-react";
import { toast } from "react-toastify";
import { UnitMaintenance } from "@/types/accommodation";
import useSWR, { mutate } from "swr";
import { usePermissions } from "@/hooks/usePermissions";

interface MaintenanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	unitId: string;
	unitName: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const MaintenanceModal = ({
	isOpen,
	onClose,
	unitId,
	unitName,
}: MaintenanceModalProps) => {
	const { canMaintenanceRequest, hasPermission } = usePermissions();
	const canCreateMaintenanceRequest = canMaintenanceRequest();
	// Check if user has permission for maintenance tasks (using the maintenance.tasks page permissions)
	const canCreateMaintenanceTask = hasPermission('maintenance.tasks', 'new_task');
	const canEditMaintenance = hasPermission('maintenance.tasks', 'edit') || hasPermission('maintenance.requests', 'edit');
	const canDeleteMaintenance = hasPermission('maintenance.tasks', 'delete') || hasPermission('maintenance.requests', 'delete');

	const [editingItem, setEditingItem] = useState<UnitMaintenance | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("all");
	const [recordType, setRecordType] = useState<"request" | "task" | null>(null);
	const [formData, setFormData] = useState({
		maintenance_type: "",
		description: "",
		maintenance_date: new Date().toISOString().split("T")[0],
		performed_by: "",
		cost: "",
		status: "Completed",
		priority: "Medium",
		remarks: "",
	});

	// Use SWR to fetch maintenance records
	const {
		data: maintenance = [],
		error,
		isLoading,
	} = useSWR<UnitMaintenance[]>(
		isOpen ? `/api/units/maintenance?unitId=${unitId}` : null,
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	useEffect(() => {
		if (error) {
			console.error("Error fetching maintenance:", error);
			toast.error("Failed to fetch maintenance records");
		}
	}, [error]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		try {
			const dataToSubmit = {
				...formData,
				unit_id: unitId,
				record_type: recordType || (editingItem?.record_type) || "request",
			};

			if (editingItem) {
				const response = await fetch(
					`/api/units/maintenance/${editingItem.id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(dataToSubmit),
					}
				);

				if (!response.ok)
					throw new Error("Failed to update maintenance record");
				toast.success("Maintenance record updated successfully");
			} else {
				const response = await fetch("/api/units/maintenance", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(dataToSubmit),
				});

				if (!response.ok) throw new Error("Failed to add maintenance record");
				toast.success("Maintenance record added successfully");
			}

			// Revalidate the maintenance data
			await mutate(`/api/units/maintenance?unitId=${unitId}`);
			resetForm();
		} catch (error) {
			console.error("Error saving maintenance record:", error);
			toast.error("Failed to save maintenance record");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this maintenance record?"))
			return;

		setIsDeleting(id);
		try {
			const response = await fetch(`/api/units/maintenance/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete maintenance record");
			toast.success("Maintenance record deleted successfully");

			// Revalidate the maintenance data
			await mutate(`/api/units/maintenance?unitId=${unitId}`);
		} catch (error) {
			console.error("Error deleting maintenance record:", error);
			toast.error("Failed to delete maintenance record");
		} finally {
			setIsDeleting(null);
		}
	};

	const handleEdit = (item: UnitMaintenance) => {
		setEditingItem(item);
		setRecordType(item.record_type as "request" | "task" || "request");
		setFormData({
			maintenance_type: item.maintenance_type,
			description: item.description,
			maintenance_date: item.maintenance_date,
			performed_by: item.performed_by,
			cost: item.cost?.toString() || "",
			status: item.status,
			priority: item.priority,
			remarks: item.remarks || "",
		});
		setShowForm(true);
	};

	const resetForm = () => {
		setEditingItem(null);
		setRecordType(null);
		setFormData({
			maintenance_type: "",
			description: "",
			maintenance_date: new Date().toISOString().split("T")[0],
			performed_by: "",
			cost: "",
			status: "Completed",
			priority: "Medium",
			remarks: "",
		});
		setShowForm(false);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const openCreateForm = (type: "request" | "task") => {
		setRecordType(type);
		setShowForm(true);
		// Set appropriate defaults based on type
		if (type === "task") {
			setFormData(prev => ({
				...prev,
				status: "Scheduled",
				maintenance_type: "Preventive Maintenance",
			}));
		} else {
			setFormData(prev => ({
				...prev,
				status: "Pending",
				maintenance_type: "",
			}));
		}
	};

	// Maintenance item component
	const MaintenanceItem = ({ item }: { item: UnitMaintenance }) => (
		<div className='border rounded-lg p-4'>
			<div className='flex items-start justify-between mb-3'>
				<div className='space-y-1'>
					<div className='flex items-center gap-2'>
						{item.record_type === "task" ? (
							<ListChecks className='h-4 w-4 text-blue-600' />
						) : (
							<AlertCircle className='h-4 w-4 text-orange-600' />
						)}
						<h4 className='font-semibold'>
							{item.maintenance_type}
						</h4>
						<Badge
							variant={
								item.status === "Completed"
									? "default"
									: item.status === "In Progress"
									? "secondary"
									: "outline"
							}>
							{item.status}
						</Badge>
						<Badge
							variant={
								item.priority === "High"
									? "destructive"
									: item.priority === "Medium"
									? "secondary"
									: "outline"
							}>
							{item.priority}
						</Badge>
					</div>
					<p className='text-sm text-muted-foreground'>
						{item.description}
					</p>
				</div>
				{(canEditMaintenance || canDeleteMaintenance) && (
					<div className='flex gap-1'>
						{canEditMaintenance && (
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleEdit(item)}>
								<Edit className='h-3 w-3' />
							</Button>
						)}
						{canDeleteMaintenance && (
							<LoadingButton
								variant='outline'
								size='sm'
								onClick={() => handleDelete(item.id)}
								loading={isDeleting === item.id}
								disabled={!!isDeleting}>
								<Trash2 className='h-3 w-3' />
							</LoadingButton>
						)}
					</div>
				)}
			</div>

			<div className='grid grid-cols-3 gap-4 text-sm'>
				<div className='flex items-center gap-1'>
					<Calendar className='h-3 w-3 text-muted-foreground' />
					<span>{formatDate(item.maintenance_date)}</span>
				</div>
				<div>
					<span className='text-muted-foreground'>
						{item.record_type === "task" ? "Assigned to:" : "Reported by:"}
					</span>{" "}
					{item.performed_by}
				</div>
				{item.cost && (
					<div className='flex items-center gap-1'>
						<DollarSign className='h-3 w-3 text-muted-foreground' />
						<span>{item.cost.toFixed(2)}</span>
					</div>
				)}
			</div>

			{item.remarks && (
				<div className='mt-2 text-sm'>
					<span className='text-muted-foreground'>Remarks:</span>
					<p className='mt-1'>{item.remarks}</p>
				</div>
			)}
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Wrench className='h-5 w-5' />
						Maintenance Records - {unitName}
					</DialogTitle>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<div className='flex justify-between items-center mb-4'>
						<TabsList className='grid w-fit grid-cols-3'>
							<TabsTrigger value='all'>All ({maintenance.length})</TabsTrigger>
							<TabsTrigger value='requests'>
								<AlertCircle className='h-4 w-4 mr-1' />
								Requests ({maintenance.filter(m => m.record_type === 'request').length})
							</TabsTrigger>
							<TabsTrigger value='tasks'>
								<ListChecks className='h-4 w-4 mr-1' />
								Tasks ({maintenance.filter(m => m.record_type === 'task').length})
							</TabsTrigger>
						</TabsList>
						<div className='flex gap-2'>
							{canCreateMaintenanceRequest && (
								<Button
									onClick={() => openCreateForm('request')}
									className='flex items-center gap-2'
									variant='outline'>
									<AlertCircle className='h-4 w-4' />
									New Request
								</Button>
							)}
							{canCreateMaintenanceTask && (
								<Button
									onClick={() => openCreateForm('task')}
									className='flex items-center gap-2'>
									<Plus className='h-4 w-4' />
									New Task
								</Button>
							)}
						</div>
					</div>

					{showForm && (
						<form
							onSubmit={handleSubmit}
							className='border rounded-lg p-4 space-y-4 mb-4'>
							<div className='flex items-center gap-2'>
								<h4 className='font-semibold'>
									{editingItem ? "Edit" : "Add New"} {recordType === "task" ? "Task" : "Request"}
								</h4>
								<Badge variant={recordType === "task" ? "default" : "secondary"}>
									{recordType === "task" ? "Scheduled Task" : "Maintenance Request"}
								</Badge>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='maintenance_type'>Maintenance Type</Label>
									<Input
										id='maintenance_type'
										value={formData.maintenance_type}
										onChange={(e) =>
											setFormData({
												...formData,
												maintenance_type: e.target.value,
											})
										}
										placeholder='e.g., Plumbing, Electrical'
										required
									/>
								</div>

								<div>
									<Label htmlFor='maintenance_date'>Date</Label>
									<Input
										id='maintenance_date'
										type='date'
										value={formData.maintenance_date}
										onChange={(e) =>
											setFormData({
												...formData,
												maintenance_date: e.target.value,
											})
										}
										required
									/>
								</div>
							</div>

							<div>
								<Label htmlFor='description'>Description</Label>
								<Input
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									required
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='performed_by'>
										{recordType === "task" ? "Assigned To" : "Reported By"}
									</Label>
									<Input
										id='performed_by'
										value={formData.performed_by}
										onChange={(e) =>
											setFormData({ ...formData, performed_by: e.target.value })
										}
										required
									/>
								</div>

								<div>
									<Label htmlFor='cost'>Cost ($)</Label>
									<Input
										id='cost'
										type='number'
										step='0.01'
										value={formData.cost}
										onChange={(e) =>
											setFormData({ ...formData, cost: e.target.value })
										}
										placeholder='Optional'
									/>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='status'>Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value) =>
											setFormData({ ...formData, status: value })
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Completed'>Completed</SelectItem>
											<SelectItem value='In Progress'>In Progress</SelectItem>
											<SelectItem value='Scheduled'>Scheduled</SelectItem>
											<SelectItem value='Pending'>Pending</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor='priority'>Priority</Label>
									<Select
										value={formData.priority}
										onValueChange={(value) =>
											setFormData({ ...formData, priority: value })
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Low'>Low</SelectItem>
											<SelectItem value='Medium'>Medium</SelectItem>
											<SelectItem value='High'>High</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor='remarks'>Remarks</Label>
								<Textarea
									id='remarks'
									value={formData.remarks}
									onChange={(e) =>
										setFormData({ ...formData, remarks: e.target.value })
									}
								/>
							</div>

							<div className='flex gap-2'>
								<LoadingButton type='submit' loading={isSubmitting}>
									{editingItem ? "Update" : "Add"} {recordType === "task" ? "Task" : "Request"}
								</LoadingButton>
								<Button type='button' variant='outline' onClick={resetForm}>
									Cancel
								</Button>
							</div>
						</form>
					)}

					<TabsContent value='all' className='space-y-3 mt-4'>
						{isLoading ? (
							<div className='text-center py-4'>
								Loading maintenance records...
							</div>
						) : maintenance.length > 0 ? (
							maintenance.map((item) => (
								<MaintenanceItem key={item.id} item={item} />
							))
						) : (
							<div className='text-center py-8 text-muted-foreground'>
								<Wrench className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No maintenance records found for this unit.</p>
								<div className='flex gap-2 justify-center mt-2'>
									{canCreateMaintenanceRequest && (
										<Button onClick={() => openCreateForm('request')} variant='outline'>
											Create Request
										</Button>
									)}
									{canCreateMaintenanceTask && (
										<Button onClick={() => openCreateForm('task')}>
											Schedule Task
										</Button>
									)}
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value='requests' className='space-y-3 mt-4'>
						{isLoading ? (
							<div className='text-center py-4'>
								Loading maintenance records...
							</div>
						) : maintenance.filter(m => m.record_type === 'request').length > 0 ? (
							maintenance.filter(m => m.record_type === 'request').map((item) => (
								<MaintenanceItem key={item.id} item={item} />
							))
						) : (
							<div className='text-center py-8 text-muted-foreground'>
								<AlertCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No maintenance requests found.</p>
								{canCreateMaintenanceRequest && (
									<Button onClick={() => openCreateForm('request')} className='mt-2'>
										Create First Request
									</Button>
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value='tasks' className='space-y-3 mt-4'>
						{isLoading ? (
							<div className='text-center py-4'>
								Loading maintenance records...
							</div>
						) : maintenance.filter(m => m.record_type === 'task').length > 0 ? (
							maintenance.filter(m => m.record_type === 'task').map((item) => (
								<MaintenanceItem key={item.id} item={item} />
							))
						) : (
							<div className='text-center py-8 text-muted-foreground'>
								<ListChecks className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No scheduled maintenance tasks found.</p>
								{canCreateMaintenanceTask && (
									<Button onClick={() => openCreateForm('task')} className='mt-2'>
										Schedule First Task
									</Button>
								)}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};