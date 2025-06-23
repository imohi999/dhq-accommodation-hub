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
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search, Monitor } from "lucide-react";
import { toast } from "sonner";

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

	const fetchAuditLogs = useCallback(async () => {
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
	}, [pagination.page, pagination.limit, filters]);

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
		return "outline";
	};

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
									<SelectItem value='LOGIN'>Login</SelectItem>
									<SelectItem value='LOGOUT'>Logout</SelectItem>
									<SelectItem value='SIGNUP'>Signup</SelectItem>
									<SelectItem value='FAILED_LOGIN'>Failed Login</SelectItem>
									<SelectItem value='CREATE'>Create</SelectItem>
									<SelectItem value='UPDATE'>Update</SelectItem>
									<SelectItem value='DELETE'>Delete</SelectItem>
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
									<SelectItem value='queue'>Queue</SelectItem>
									<SelectItem value='allocation'>Allocation</SelectItem>
									<SelectItem value='unit'>Unit</SelectItem>
									<SelectItem value='maintenance'>Maintenance</SelectItem>
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
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{pagination.pages > 1 && (
						<div className='flex items-center justify-between mt-4'>
							<div className='text-sm text-muted-foreground'>
								Page {pagination.page} of {pagination.pages}
							</div>
							<div className='flex items-center gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={pagination.page === 1}>
									<ChevronLeft className='h-4 w-4' />
									Previous
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={pagination.page === pagination.pages}>
									Next
									<ChevronRight className='h-4 w-4' />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
