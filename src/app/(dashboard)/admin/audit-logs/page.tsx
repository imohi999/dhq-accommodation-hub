"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	Search,
	Monitor,
	Shield,
	Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/spinner";

interface AuditLog {
	id: string;
	userId: string;
	action: string;
	entityType?: string;
	entityId?: string;
	oldData?: any;
	newData?: any;
	ipAddress: string;
	userAgent?: string;
	createdAt: string;
	user: {
		id: string;
		username: string;
		email: string;
	};
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export default function AuditLogsPage() {
	const { user, loading: authLoading } = useAuth();
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 50,
		total: 0,
		pages: 0,
	});
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState({
		userId: "",
		action: "",
		entityType: "",
	});
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const isSuperAdmin = user?.profile?.role === "superadmin";

	const fetchAuditLogs = useCallback(async () => {
		if (!isSuperAdmin) return;

		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(filters.userId && { userId: filters.userId }),
				...(filters.action && { action: filters.action }),
				...(filters.entityType && { entityType: filters.entityType }),
			});

			const response = await fetch(`/api/audit-logs?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch audit logs");
			}

			const data = await response.json();
			setAuditLogs(data.auditLogs);
			setPagination(data.pagination);
		} catch (error) {
			console.error("Error fetching audit logs:", error);
			toast.error("Failed to fetch audit logs");
		} finally {
			setLoading(false);
		}
	}, [pagination.page, pagination.limit, filters, isSuperAdmin]);

	useEffect(() => {
		fetchAuditLogs();
	}, [pagination.page, filters, fetchAuditLogs]);

	const handlePageChange = (newPage: number) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	const handleFilterChange = (key: string, value: string) => {
		// Convert "all" back to empty string for API
		const apiValue = value === "all" ? "" : value;
		setFilters((prev) => ({ ...prev, [key]: apiValue }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const getActionBadgeVariant = (action: string) => {
		if (action.includes("LOGIN") || action.includes("SIGNUP")) return "default";
		if (action.includes("CREATE") || action.includes("ADD")) return "default";
		if (action.includes("UPDATE") || action.includes("EDIT"))
			return "secondary";
		if (action.includes("DELETE") || action.includes("REMOVE"))
			return "destructive";
		if (action.includes("FAILED")) return "destructive";
		if (action.includes("APPROVED") || action.includes("ALLOCATE"))
			return "default";
		if (action.includes("NOT APPROVED") || action.includes("POSTED OUT"))
			return "destructive";
		if (action.includes("RE-ALLOCATE") || action.includes("INSPECT"))
			return "secondary";
		if (action.includes("IMPORT")) return "default";
		return "outline";
	};

	if (authLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	if (!isSuperAdmin) {
		return (
			<div className='flex justify-center p-8'>
				<Card className='w-full max-w-md'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-2'>
							<Shield className='h-12 w-12 text-muted-foreground mx-auto' />
							<p className='text-lg font-semibold'>Access Denied</p>
							<p className='text-muted-foreground'>
								Only superadmins can view audit logs.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold flex items-center gap-2'>
					<Monitor className='h-8 w-8' />
					Audit Logs
				</h1>
				<p className='text-muted-foreground'>
					View system activity and user actions
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>
						Filter audit logs by user, action, or entity type
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<label className='text-sm font-medium mb-1 block'>User ID</label>
							<Input
								placeholder='Filter by user ID'
								value={filters.userId}
								onChange={(e) => handleFilterChange("userId", e.target.value)}
							/>
						</div>
						<div>
							<label className='text-sm font-medium mb-1 block'>Action</label>
							<Select
								value={filters.action || "all"}
								onValueChange={(value) => handleFilterChange("action", value)}>
								<SelectTrigger>
									<SelectValue placeholder='All actions' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All actions</SelectItem>
									<SelectItem value='LOGIN'>LOGIN</SelectItem>
									<SelectItem value='LOGOUT'>LOGOUT</SelectItem>
									<SelectItem value='SIGNUP'>SIGNUP</SelectItem>
									<SelectItem value='FAILED_LOGIN'>FAILED_LOGIN</SelectItem>
									<SelectItem value='CREATE'>CREATE</SelectItem>
									<SelectItem value='UPDATE'>UPDATE</SelectItem>
									<SelectItem value='DELETE'>DELETE</SelectItem>
									<SelectItem value='APPROVED'>APPROVED</SelectItem>
									<SelectItem value='NOT APPROVED'>NOT APPROVED</SelectItem>
									<SelectItem value='ALLOCATE'>ALLOCATE</SelectItem>
									<SelectItem value='POSTED OUT'>POSTED OUT</SelectItem>
									<SelectItem value='RE-ALLOCATE'>RE-ALLOCATE</SelectItem>
									<SelectItem value='INSPECT'>INSPECT</SelectItem>
									<SelectItem value='MAINTAIN'>MAINTAIN</SelectItem>
									<SelectItem value='IMPORT'>IMPORT</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className='text-sm font-medium mb-1 block'>
								Entity Type
							</label>
							<Select
								value={filters.entityType || "all"}
								onValueChange={(value) =>
									handleFilterChange("entityType", value)
								}>
								<SelectTrigger>
									<SelectValue placeholder='All entities' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All entities</SelectItem>
									<SelectItem value='user'>User</SelectItem>
									<SelectItem value='profile'>Profile</SelectItem>
									<SelectItem value='queue'>Queue</SelectItem>
									<SelectItem value='allocation'>Allocation</SelectItem>
									<SelectItem value='unit'>Unit</SelectItem>
									<SelectItem value='maintenance'>Maintenance</SelectItem>
									<SelectItem value='inventory'>Inventory</SelectItem>
									<SelectItem value='stamp_setting'>Stamp Setting</SelectItem>
									<SelectItem value='clearance_inspection'>
										Clearance Inspection
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Audit Log Entries</CardTitle>
					<CardDescription>
						Showing {auditLogs.length} of {pagination.total} entries
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={6} className='text-center'>
											Loading...
										</TableCell>
									</TableRow>
								) : auditLogs.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className='text-center'>
											No audit logs found
										</TableCell>
									</TableRow>
								) : (
									auditLogs.map((log) => (
										<TableRow key={log.id}>
											<TableCell className='font-mono text-sm'>
												{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
											</TableCell>
											<TableCell>
												<div>
													<div className='font-medium'>{log.user.username}</div>
													<div className='text-sm text-muted-foreground'>
														{log.user.email}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={getActionBadgeVariant(log.action)}>
													{log.action}
												</Badge>
											</TableCell>
											<TableCell>
												{log.entityType && (
													<div>
														<div className='font-medium'>{log.entityType}</div>
														{log.entityId && (
															<div className='text-sm text-muted-foreground'>
																ID: {log.entityId}
															</div>
														)}
													</div>
												)}
											</TableCell>
											<TableCell className='font-mono text-sm'>
												{log.ipAddress}
											</TableCell>
											<TableCell>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => {
														setSelectedLog(log);
														setIsDialogOpen(true);
													}}>
													<Eye className='h-4 w-4' />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-4'>
						<div className='flex items-center gap-2'>
							<span className='text-sm text-muted-foreground'>Show</span>
							<Select
								value={pagination.limit.toString()}
								onValueChange={(value) => {
									setPagination((prev) => ({
										...prev,
										limit: parseInt(value),
										page: 1,
									}));
								}}>
								<SelectTrigger className='w-[70px]'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='25'>25</SelectItem>
									<SelectItem value='50'>50</SelectItem>
									<SelectItem value='100'>100</SelectItem>
								</SelectContent>
							</Select>
							<span className='text-sm text-muted-foreground'>entries</span>
						</div>

						<div className='flex items-center gap-2'>
							<div className='text-sm text-muted-foreground'>
								Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
								{Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
								{pagination.total} entries
							</div>
						</div>

						<div className='flex items-center gap-1'>
							<Button
								variant='outline'
								size='icon'
								onClick={() => handlePageChange(1)}
								disabled={pagination.page === 1}>
								<ChevronLeft className='h-4 w-4' />
								<ChevronLeft className='h-4 w-4 -ml-3' />
							</Button>
							<Button
								variant='outline'
								size='icon'
								onClick={() => handlePageChange(pagination.page - 1)}
								disabled={pagination.page === 1}>
								<ChevronLeft className='h-4 w-4' />
							</Button>
							
							{/* Page number buttons */}
							<div className='flex items-center gap-1'>
								{(() => {
									const totalPages = pagination.pages;
									const currentPage = pagination.page;
									const pages = [];
									
									// Always show first page
									if (currentPage > 3) {
										pages.push(
											<Button
												key={1}
												variant='outline'
												size='sm'
												onClick={() => handlePageChange(1)}>
												1
											</Button>
										);
										if (currentPage > 4) {
											pages.push(<span key='dots-1' className='px-1'>...</span>);
										}
									}
									
									// Show pages around current page
									for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
										pages.push(
											<Button
												key={i}
												variant={i === currentPage ? 'default' : 'outline'}
												size='sm'
												onClick={() => handlePageChange(i)}
												disabled={i === currentPage}>
												{i}
											</Button>
										);
									}
									
									// Always show last page
									if (currentPage < totalPages - 2) {
										if (currentPage < totalPages - 3) {
											pages.push(<span key='dots-2' className='px-1'>...</span>);
										}
										pages.push(
											<Button
												key={totalPages}
												variant='outline'
												size='sm'
												onClick={() => handlePageChange(totalPages)}>
												{totalPages}
											</Button>
										);
									}
									
									return pages;
								})()}
							</div>
							
							<Button
								variant='outline'
								size='icon'
								onClick={() => handlePageChange(pagination.page + 1)}
								disabled={pagination.page === pagination.pages}>
								<ChevronRight className='h-4 w-4' />
							</Button>
							<Button
								variant='outline'
								size='icon'
								onClick={() => handlePageChange(pagination.pages)}
								disabled={pagination.page === pagination.pages}>
								<ChevronRight className='h-4 w-4 -mr-3' />
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Audit Log Details</DialogTitle>
						<DialogDescription>
							Detailed information about this audit log entry
						</DialogDescription>
					</DialogHeader>
					{selectedLog && (
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										Timestamp
									</p>
									<p className='text-sm'>
										{format(
											new Date(selectedLog.createdAt),
											"yyyy-MM-dd HH:mm:ss"
										)}
									</p>
								</div>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										Action
									</p>
									<Badge variant={getActionBadgeVariant(selectedLog.action)}>
										{selectedLog.action}
									</Badge>
								</div>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										User
									</p>
									<p className='text-sm'>
										{selectedLog.user.username} ({selectedLog.user.email})
									</p>
								</div>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										IP Address
									</p>
									<p className='text-sm font-mono'>{selectedLog.ipAddress}</p>
								</div>
								{selectedLog.entityType && (
									<div>
										<p className='text-sm font-medium text-muted-foreground'>
											Entity Type
										</p>
										<p className='text-sm'>{selectedLog.entityType}</p>
									</div>
								)}
								{selectedLog.entityId && (
									<div>
										<p className='text-sm font-medium text-muted-foreground'>
											Entity ID
										</p>
										<p className='text-sm font-mono'>{selectedLog.entityId}</p>
									</div>
								)}
							</div>
							{selectedLog.userAgent && (
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										User Agent
									</p>
									<p className='text-sm text-wrap break-words'>
										{selectedLog.userAgent}
									</p>
								</div>
							)}
							{selectedLog.oldData && (
								<div>
									<p className='text-sm font-medium text-muted-foreground mb-2'>
										Old Data
									</p>
									<pre className='text-xs bg-muted p-4 rounded-md overflow-x-auto'>
										{JSON.stringify(selectedLog.oldData, null, 2)}
									</pre>
								</div>
							)}
							{selectedLog.newData && (
								<div>
									<p className='text-sm font-medium text-muted-foreground mb-2'>
										New Data
									</p>
									<pre className='text-xs bg-muted p-4 rounded-md overflow-x-auto'>
										{JSON.stringify(selectedLog.newData, null, 2)}
									</pre>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
