"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Shield, UserPlus, Trash2, Eye, EyeOff } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

// REAL ACTIONS based on actual dashboard pages
const PAGE_ACTIONS = {
	dashboard: ["access"],
	queue: ["access"],
	"queue.list": ["access", "add_queue", "edit", "delete", "allocate", "export"],
	"queue.units": ["access", "add_quarters", "edit", "delete"],
	allocations: ["access"],
	"allocations.pending": ["access", "view_letter", "approve", "refuse"],
	"allocations.active": [
		"access",
		"view_letter",
		"ejection_notice",
		"transfer",
		"post_out",
	],
	"allocations.past": ["access", "view_letter"],
	"allocations.stamp-settings": ["access", "add_stamp", "edit", "delete"],
	directory: ["access", "export_data"],
	analytics: ["access"],
	"analytics.queue": ["access", "export_report"],
	"analytics.pending": ["access", "export_report"],
	"analytics.active-allocations": ["access", "export_report"],
	"analytics.past-allocations": ["access", "export_report"],
	accommodation: ["access"],
	"accommodation.units": [
		"access",
		"add_quarters",
		"edit",
		"delete",
		"import",
		"export",
		"view_history",
		"maintenance_request",
		"inventory",
	],
	"accommodation.types": ["access", "add_type", "edit", "delete"],
	maintenance: ["access"],
	"maintenance.tasks": [
		"access",
		"new_task",
		"edit",
		"delete",
		"mark_complete",
	],
	"maintenance.requests": [
		"access",
		"new_request",
		"edit",
		"delete",
		"approve",
	],
	administration: ["access"],
	"administration.users": [
		"access",
		"create_user",
		"edit_permissions",
		"delete_user",
	],
	"administration.roles": ["access", "create_role", "edit", "delete"],
	"administration.audit-logs": ["access", "export_logs"],
	"administration.auth-info": ["access", "manage_sessions"],
};

// User-friendly action names
const ACTION_LABELS = {
	access: "Access",
	add_queue: "Add Queue",
	edit: "Edit",
	delete: "Delete",
	allocate: "Allocate",
	export: "Export",
	add_quarters: "Add Unit",
	view_letter: "View Letter",
	approve: "Approve",
	refuse: "Refuse",
	ejection_notice: "Ejection Notice",
	transfer: "Transfer",
	post_out: "Post Out",
	add_stamp: "Add Stamp",
	import: "Import",
	view_history: "View History",
	maintenance_request: "Maintenance Request",
	inventory: "Inventory",
	add_type: "Add Type",
	new_request: "New Request",
	new_task: "New Task",
	mark_complete: "Mark Complete",
	create_user: "Create User",
	edit_permissions: "Edit Permissions",
	delete_user: "Delete User",
	create_role: "Create Role",
	export_logs: "Export Logs",
	manage_sessions: "Manage Sessions",
	export_report: "Export Report",
	export_data: "Export Data",
};

// Page structure for hierarchy
const PAGES = [
	{
		key: "dashboard",
		title: "Dashboard",
		children: [],
	},
	{
		key: "queue",
		title: "Queue",
		children: [
			{ key: "queue.list", title: "Queue List" },
			{ key: "queue.units", title: "Current Units" },
		],
	},
	{
		key: "allocations",
		title: "Allocations",
		children: [
			{ key: "allocations.pending", title: "Pending Approval" },
			{ key: "allocations.active", title: "Active Allocations" },
			{ key: "allocations.past", title: "Past Allocations" },
			{ key: "allocations.stamp-settings", title: "Stamp Settings" },
		],
	},
	{
		key: "directory",
		title: "Directory",
		children: [],
	},
	{
		key: "analytics",
		title: "Analytics",
		children: [
			{ key: "analytics.queue", title: "Queue Analytics" },
			{ key: "analytics.pending", title: "Pending Allocation Analytics" },
			{ key: "analytics.active-allocations", title: "Active Allocations" },
			{ key: "analytics.past-allocations", title: "Past Allocations" },
		],
	},
	{
		key: "accommodation",
		title: "Accommodation",
		children: [
			{ key: "accommodation.units", title: "DHQ Accommodation" },
			{ key: "accommodation.types", title: "Accommodation Types" },
		],
	},
	{
		key: "maintenance",
		title: "Maintenance",
		children: [
			{ key: "maintenance.tasks", title: "Maintenance Tasks" },
			{ key: "maintenance.requests", title: "Maintenance Requests" },
		],
	},
	{
		key: "administration",
		title: "Administration",
		children: [
			{ key: "administration.users", title: "User Management" },
			{ key: "administration.roles", title: "Role Profiles" },
			{ key: "administration.audit-logs", title: "Audit Logs" },
			{ key: "administration.auth-info", title: "Authentication Info" },
		],
	},
];

interface Profile {
	id: string;
	userId: string;
	fullName: string | null;
	role: string;
	createdAt: string;
	pagePermissions?: {
		pageKey: string;
		allowedActions: string[];
	}[];
	user: {
		id: string;
		username: string;
		email: string;
		emailVerified: string | null;
		createdAt: string;
		updatedAt: string;
	};
}

const fetcher = (url: string) =>
	fetch(url, {
		cache: "no-store",
		headers: {
			"Cache-Control": "no-cache",
		},
	}).then((res) => res.json());

// Simple permission row component
function PermissionRow({
	pageKey,
	pageTitle,
	userActions,
	onActionChange,
}: {
	pageKey: string;
	pageTitle: string;
	userActions: string[];
	onActionChange: (pageKey: string, action: string, checked: boolean) => void;
}) {
	const availableActions = PAGE_ACTIONS[
		pageKey as keyof typeof PAGE_ACTIONS
	] || ["access"];

	const allActionsSelected = availableActions.every(action => 
		userActions.includes(action)
	);

	const handleSelectAll = () => {
		if (allActionsSelected) {
			// Deselect all actions
			availableActions.forEach(action => {
				onActionChange(pageKey, action, false);
			});
		} else {
			// Select all actions
			availableActions.forEach(action => {
				if (!userActions.includes(action)) {
					onActionChange(pageKey, action, true);
				}
			});
		}
	};

	return (
		<div className='flex items-start justify-between py-3 border-b'>
			<div className='flex-1'>
				<h4 className='font-medium text-sm'>{pageTitle}</h4>
				<p className='text-xs text-muted-foreground mt-1'>
					{availableActions.length} action
					{availableActions.length !== 1 ? "s" : ""} available
				</p>
			</div>
			<div className='flex items-center space-x-3 flex-wrap gap-2 max-w-md'>
				{availableActions.length > 1 && (
					<>
						<div className='flex items-center space-x-1'>
							<Checkbox
								checked={allActionsSelected}
								onCheckedChange={handleSelectAll}
							/>
							<Label className='text-xs whitespace-nowrap font-medium'>
								Select All
							</Label>
						</div>
						<div className='w-px h-4 bg-border' />
					</>
				)}
				{availableActions.map((action) => (
					<div key={action} className='flex items-center space-x-1'>
						<Checkbox
							checked={userActions.includes(action)}
							onCheckedChange={(checked) =>
								onActionChange(pageKey, action, !!checked)
							}
						/>
						<Label className='text-xs whitespace-nowrap'>
							{ACTION_LABELS[action as keyof typeof ACTION_LABELS]}
						</Label>
					</div>
				))}
			</div>
		</div>
	);
}

export default function UserManagementPage() {
	const { user, loading: authLoading } = useAuth();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<Profile | null>(null);
	const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
	const [userPermissions, setUserPermissions] = useState<
		Record<string, string[]>
	>({});
	const [newUserData, setNewUserData] = useState({
		username: "",
		email: "",
		password: "",
		fullName: "",
		role: "user",
	});
	const [newUserPermissions, setNewUserPermissions] = useState<
		Record<string, string[]>
	>({});
	const [isCreating, setIsCreating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const isSuperAdmin = user?.profile?.role === "superadmin";

	// Debug logging
	console.log("[UserManagementPage] User role:", user?.profile?.role);
	console.log("[UserManagementPage] Is superadmin:", isSuperAdmin);
	console.log("[UserManagementPage] Auth loading:", authLoading);

	const {
		data: profiles = [],
		error,
		isLoading,
	} = useSWR<Profile[]>(isSuperAdmin ? "/api/profiles" : null, fetcher, {
		revalidateOnFocus: true,
		revalidateOnMount: true,
		refreshInterval: 0,
		dedupingInterval: 0,
	});

	// Log the fetched data
	useEffect(() => {
		if (!isLoading && !error) {
			console.log("[UserManagementPage] Profiles loaded:", profiles.length);
			profiles.forEach((profile, index) => {
				console.log(
					`[UserManagementPage] Profile ${index + 1}:`,
					profile.user.username
				);
			});
		}
	}, [profiles, isLoading, error]);

	// Load user permissions when editing
	useEffect(() => {
		if (editingUser) {
			const permissions: Record<string, string[]> = {};

			if (editingUser.pagePermissions) {
				editingUser.pagePermissions.forEach((perm) => {
					permissions[perm.pageKey] = perm.allowedActions || [];
				});
			}

			setUserPermissions(permissions);
		}
	}, [editingUser]);

	const handleActionChange = (
		pageKey: string,
		action: string,
		checked: boolean
	) => {
		setUserPermissions((prev) => {
			const newPermissions = { ...prev };
			const currentActions = newPermissions[pageKey] || [];

			if (checked) {
				// Add action if not present
				if (!currentActions.includes(action)) {
					newPermissions[pageKey] = [...currentActions, action];
				}

				// Auto-enable access if adding any action
				if (action !== "access" && !currentActions.includes("access")) {
					newPermissions[pageKey] = ["access", ...newPermissions[pageKey]];
				}

				// Auto-enable parent access for child pages
				const parent = PAGES.find((p) =>
					p.children.some((c) => c.key === pageKey)
				);
				if (parent && !newPermissions[parent.key]?.includes("access")) {
					newPermissions[parent.key] = ["access"];
				}
			} else {
				// Remove action
				newPermissions[pageKey] = currentActions.filter((a) => a !== action);

				// If removing access, remove all actions for this page
				if (action === "access") {
					newPermissions[pageKey] = [];

					// Also remove access from child pages
					const parentPage = PAGES.find((p) => p.key === pageKey);
					if (parentPage) {
						parentPage.children.forEach((child) => {
							newPermissions[child.key] = [];
						});
					}
				}
			}

			return newPermissions;
		});
	};

	const handleNewUserActionChange = (
		pageKey: string,
		action: string,
		checked: boolean
	) => {
		setNewUserPermissions((prev) => {
			const newPermissions = { ...prev };
			const currentActions = newPermissions[pageKey] || [];

			if (checked) {
				// Add action if not present
				if (!currentActions.includes(action)) {
					newPermissions[pageKey] = [...currentActions, action];
				}

				// Auto-enable access if adding any action
				if (action !== "access" && !currentActions.includes("access")) {
					newPermissions[pageKey] = ["access", ...newPermissions[pageKey]];
				}

				// Auto-enable parent access for child pages
				const parent = PAGES.find((p) =>
					p.children.some((c) => c.key === pageKey)
				);
				if (parent && !newPermissions[parent.key]?.includes("access")) {
					newPermissions[parent.key] = ["access"];
				}
			} else {
				// Remove action
				newPermissions[pageKey] = currentActions.filter((a) => a !== action);

				// If removing access, remove all actions for this page
				if (action === "access") {
					newPermissions[pageKey] = [];

					// Also remove access from child pages
					const parentPage = PAGES.find((p) => p.key === pageKey);
					if (parentPage) {
						parentPage.children.forEach((child) => {
							newPermissions[child.key] = [];
						});
					}
				}
			}

			return newPermissions;
		});
	};

	const handleCreateUser = async () => {
		if (!newUserData.username || !newUserData.email || !newUserData.password) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Validate password length
		if (newUserData.password.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		setIsCreating(true);
		try {
			// First create the user
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUserData),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to create user");
			} else {
				// If user created successfully, set their permissions
				if (Object.keys(newUserPermissions).length > 0) {
					const permissions = Object.entries(newUserPermissions)
						.filter(([_, actions]) => actions.length > 0)
						.map(([pageKey, actions]) => ({
							pageKey,
							allowedActions: actions,
						}));

					const permResponse = await fetch(`/api/profiles/${data.user.id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ permissions }),
					});

					if (!permResponse.ok) {
						toast.warning("User created but failed to set permissions");
					}
				}

				toast.success("User created successfully");
				setIsCreateModalOpen(false);
				setNewUserData({
					username: "",
					email: "",
					password: "",
					fullName: "",
					role: "user",
				});
				setNewUserPermissions({});
				mutate("/api/profiles");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!deletingUser) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/users/${deletingUser.userId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error || "Failed to delete user");
			} else {
				toast.success("User deleted successfully");
				setIsDeleteModalOpen(false);
				setDeletingUser(null);
				mutate("/api/profiles");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleUpdateUser = async () => {
		if (!editingUser) return;

		try {
			// Convert permissions to API format
			const permissions = Object.entries(userPermissions)
				.filter(([_, actions]) => actions.length > 0)
				.map(([pageKey, actions]) => ({
					pageKey,
					allowedActions: actions,
				}));

			const response = await fetch(`/api/profiles/${editingUser.userId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ permissions }),
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error || "Failed to update permissions");
			} else {
				toast.success("Permissions updated successfully");
				setIsEditModalOpen(false);
				setEditingUser(null);
				setUserPermissions({});
				mutate("/api/profiles");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("An unexpected error occurred");
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "superadmin":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "admin":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "moderator":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	if (authLoading || isLoading) {
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
								Only superadmins can manage users.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center p-8'>
				<Card className='w-full max-w-md'>
					<CardContent className='pt-6'>
						<p className='text-destructive text-center'>
							Error loading users. Please try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
			<div className='flex items-center justify-between space-y-2'>
				<h2 className='text-3xl font-bold tracking-tight text-foreground'>
					User Management
				</h2>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<UserPlus className='w-4 h-4 mr-2' />
					Create User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Users ({profiles.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Username</TableHead>
								<TableHead>Full Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{profiles.map((profile) => (
								<TableRow key={profile.id}>
									<TableCell className='font-medium'>
										{profile.user.username}
									</TableCell>
									<TableCell>{profile.fullName || "N/A"}</TableCell>
									<TableCell>{profile.user.email}</TableCell>
									<TableCell>
										<Badge className={getRoleColor(profile.role)}>
											<Shield className='w-3 h-3 mr-1' />
											{profile.role.toUpperCase()}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(profile.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {
													setEditingUser(profile);
													setIsEditModalOpen(true);
												}}>
												<Edit className='w-3 h-3 mr-1' />
												Edit Permissions
											</Button>
											{profile.role !== "superadmin" && (
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setDeletingUser(profile);
														setIsDeleteModalOpen(true);
													}}
													className='text-destructive hover:text-destructive'>
													<Trash2 className='w-3 h-3' />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Edit Permissions Dialog */}
			<Dialog
				open={isEditModalOpen}
				onOpenChange={(open) => {
					setIsEditModalOpen(open);
					if (!open) {
						setEditingUser(null);
						setUserPermissions({});
					}
				}}>
				<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Edit User Permissions</DialogTitle>
					</DialogHeader>
					{editingUser && (
						<div className='space-y-4'>
							<div className='space-y-2'>
								<p className='text-sm font-medium'>
									User: {editingUser.user.username}
								</p>
								<p className='text-sm text-muted-foreground'>
									Email: {editingUser.user.email}
								</p>
								<p className='text-sm text-muted-foreground'>
									Role: {editingUser.role}
								</p>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<div>
										<Label>Page Permissions</Label>
										<p className='text-sm text-muted-foreground'>
											Configure which actions this user can perform on each page
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											const newPermissions: Record<string, string[]> = {};
											PAGES.forEach(page => {
												const actions = PAGE_ACTIONS[page.key as keyof typeof PAGE_ACTIONS] || [];
												newPermissions[page.key] = [...actions];
												page.children.forEach(child => {
													const childActions = PAGE_ACTIONS[child.key as keyof typeof PAGE_ACTIONS] || [];
													newPermissions[child.key] = [...childActions];
												});
											});
											setUserPermissions(newPermissions);
										}}
										className="text-xs"
									>
										Grant All Permissions
									</Button>
								</div>
								<ScrollArea className='h-[400px] border rounded-md p-4'>
									<div className='space-y-1'>
										{PAGES.map((page) => (
											<div key={page.key}>
												{/* Parent page permissions */}
												<PermissionRow
													pageKey={page.key}
													pageTitle={page.title}
													userActions={userPermissions[page.key] || []}
													onActionChange={handleActionChange}
												/>

												{/* Child page permissions */}
												{page.children.map((child) => (
													<div key={child.key} className='ml-6'>
														<PermissionRow
															pageKey={child.key}
															pageTitle={child.title}
															userActions={userPermissions[child.key] || []}
															onActionChange={handleActionChange}
														/>
													</div>
												))}
											</div>
										))}
									</div>
								</ScrollArea>
							</div>

							<LoadingButton onClick={handleUpdateUser} className='w-full'>
								Update Permissions
							</LoadingButton>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Create User Dialog */}
			<Dialog
				open={isCreateModalOpen}
				onOpenChange={(open) => {
					setIsCreateModalOpen(open);
					if (!open) {
						setNewUserPermissions({});
						setShowPassword(false);
					}
				}}>
				<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='username'>Username *</Label>
							<Input
								id='username'
								value={newUserData.username}
								onChange={(e) =>
									setNewUserData({ ...newUserData, username: e.target.value })
								}
								placeholder='Enter username'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email *</Label>
							<Input
								id='email'
								type='email'
								value={newUserData.email}
								onChange={(e) =>
									setNewUserData({ ...newUserData, email: e.target.value })
								}
								placeholder='Enter email'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password *</Label>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									value={newUserData.password}
									onChange={(e) =>
										setNewUserData({ ...newUserData, password: e.target.value })
									}
									placeholder='Enter password (min 8 characters)'
									className={`pr-10 ${
										newUserData.password && newUserData.password.length < 8
											? 'border-destructive'
											: ''
									}`}
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className='h-4 w-4 text-muted-foreground' />
									) : (
										<Eye className='h-4 w-4 text-muted-foreground' />
									)}
								</Button>
							</div>
							{newUserData.password && newUserData.password.length < 8 && (
								<p className='text-sm text-destructive'>
									Password must be at least 8 characters long
								</p>
							)}
						</div>
						<div className='space-y-2'>
							<Label htmlFor='fullName'>Full Name</Label>
							<Input
								id='fullName'
								value={newUserData.fullName}
								onChange={(e) =>
									setNewUserData({ ...newUserData, fullName: e.target.value })
								}
								placeholder='Enter full name'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='role'>Role</Label>
							<Select
								value={newUserData.role}
								onValueChange={(value) =>
									setNewUserData({ ...newUserData, role: value })
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='user'>User</SelectItem>
									<SelectItem value='moderator'>Moderator</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<div>
									<Label>Page Permissions</Label>
									<p className='text-sm text-muted-foreground'>
										Configure which actions this user can perform on each page
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const newPermissions: Record<string, string[]> = {};
										PAGES.forEach(page => {
											const actions = PAGE_ACTIONS[page.key as keyof typeof PAGE_ACTIONS] || [];
											newPermissions[page.key] = [...actions];
											page.children.forEach(child => {
												const childActions = PAGE_ACTIONS[child.key as keyof typeof PAGE_ACTIONS] || [];
												newPermissions[child.key] = [...childActions];
											});
										});
										setNewUserPermissions(newPermissions);
									}}
									className="text-xs"
								>
									Grant All Permissions
								</Button>
							</div>
							<ScrollArea className='h-[300px] border rounded-md p-4'>
								<div className='space-y-1'>
									{PAGES.map((page) => (
										<div key={page.key}>
											{/* Parent page permissions */}
											<PermissionRow
												pageKey={page.key}
												pageTitle={page.title}
												userActions={newUserPermissions[page.key] || []}
												onActionChange={handleNewUserActionChange}
											/>

											{/* Child page permissions */}
											{page.children.map((child) => (
												<div key={child.key} className='ml-6'>
													<PermissionRow
														pageKey={child.key}
														pageTitle={child.title}
														userActions={newUserPermissions[child.key] || []}
														onActionChange={handleNewUserActionChange}
													/>
												</div>
											))}
										</div>
									))}
								</div>
							</ScrollArea>
						</div>

						<LoadingButton
							onClick={handleCreateUser}
							className='w-full'
							loading={isCreating}>
							Create User
						</LoadingButton>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete User Dialog */}
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
					</DialogHeader>
					{deletingUser && (
						<div className='space-y-4'>
							<p className='text-sm text-muted-foreground'>
								Are you sure you want to delete this user? This action cannot be
								undone.
							</p>
							<div className='space-y-2 bg-muted p-3 rounded-md'>
								<p className='text-sm font-medium'>
									User: {deletingUser.user.username}
								</p>
								<p className='text-sm text-muted-foreground'>
									Email: {deletingUser.user.email}
								</p>
								<p className='text-sm text-muted-foreground'>
									Role: {deletingUser.role}
								</p>
							</div>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									onClick={() => {
										setIsDeleteModalOpen(false);
										setDeletingUser(null);
									}}
									className='flex-1'>
									Cancel
								</Button>
								<LoadingButton
									onClick={handleDeleteUser}
									variant='destructive'
									className='flex-1'
									loading={isDeleting}>
									Delete User
								</LoadingButton>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
