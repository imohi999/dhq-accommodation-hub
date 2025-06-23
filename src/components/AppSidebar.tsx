"use client";

import Image from "next/image";
import {
	Home,
	Users,
	Building,
	BarChart3,
	List,
	CheckCircle,
	Wrench,
	ShieldCheck,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarHeader,
	SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

// Define all menu items with their keys
const allMenuItems = [
	{
		key: "dashboard",
		title: "Dashboard",
		url: "/",
		icon: Home,
	},
	{
		key: "queue",
		title: "Queue",
		icon: List,
		items: [
			{
				key: "queue.list",
				title: "Queue List",
				url: "/queue/list",
			},
			{
				key: "queue.units",
				title: "Current Units",
				url: "/queue/units",
			},
		],
	},
	{
		key: "allocations",
		title: "Allocations",
		icon: CheckCircle,
		items: [
			{
				key: "allocations.pending",
				title: "Pending Approval",
				url: "/allocations/pending",
			},
			{
				key: "allocations.active",
				title: "Active Allocations",
				url: "/allocations/active",
			},
			{
				key: "allocations.past",
				title: "Past Allocations",
				url: "/allocations/past",
			},
			{
				key: "allocations.stamp-settings",
				title: "Stamp Settings",
				url: "/allocations/stamp-settings",
			},
		],
	},
	{
		key: "directory",
		title: "Directory",
		url: "/directory",
		icon: Users,
	},
	{
		key: "analytics",
		title: "Analytics",
		icon: BarChart3,
		items: [
			{
				key: "analytics.queue",
				title: "Queue",
				url: "/analytics/queue",
			},
			{
				key: "analytics.pending",
				title: "Pending Allocation",
				url: "/analytics/pending",
			},
			{
				key: "analytics.active-allocations",
				title: "Active Allocations",
				url: "/analytics/active-allocations",
			},
			{
				key: "analytics.past-allocations",
				title: "Past Allocations",
				url: "/analytics/past-allocations",
			},
		],
	},
	{
		key: "accommodation",
		title: "Accommodation",
		icon: Building,
		items: [
			{
				key: "accommodation.units",
				title: "DHQ  Accommodation",
				url: "/accommodations/units",
			},
			{
				key: "accommodation.types",
				title: "Accommodation Types",
				url: "/accommodations/types",
			},
		],
	},
	{
		key: "maintenance",
		title: "Maintenance",
		icon: Wrench,
		items: [
			{
				key: "maintenance.tasks",
				title: "Maintenance Tasks",
				url: "/maintenance/tasks",
			},
			{
				key: "maintenance.requests",
				title: "Maintenance Requests",
				url: "/maintenance/requests",
			},
		],
	},
	{
		key: "administration",
		title: "Administration",
		icon: ShieldCheck,
		items: [
			{
				key: "administration.users",
				title: "User Management",
				url: "/admin/users",
			},
			{
				key: "administration.roles",
				title: "Role Profiles",
				url: "/admin/roles",
			},
			{
				key: "administration.audit-logs",
				title: "Audit Logs",
				url: "/admin/audit-logs",
			},
			{
				key: "administration.auth-info",
				title: "Authentication Info",
				url: "/admin/auth-info",
			},
		],
	},
];

export function AppSidebar() {
	const pathname = usePathname();
	const { user } = useAuth();

	// Filter menu items based on user permissions
	const menuItems = useMemo(() => {
		// If user is not loaded yet, return empty array
		if (!user?.profile) return [];

		// If user is superadmin, show all menu items
		if (user.profile.role === "superadmin") {
			return allMenuItems;
		}

		// Get user's page permissions
		const permissions = user.profile.pagePermissions || [];
		const permissionMap = new Map(permissions.map((p) => [p.pageKey, p]));

		// Debug logging
		console.log("User permissions:", permissions);
		console.log("Permission map:", Array.from(permissionMap.entries()));

		// Filter menu items based on permissions
		return allMenuItems
			.map((item) => {
				// If item has sub-items, check if user has permission for any child
				if (item.items) {
					const visibleSubItems = item.items.filter((subItem) => {
						const subPermission = permissionMap.get(subItem.key);
						// Check both legacy canView and new allowedActions
						return (
							subPermission?.canView ||
							(subPermission?.allowedActions &&
								subPermission.allowedActions.includes("access"))
						);
					});

					// If user has permission for any child, show the parent
					if (visibleSubItems.length > 0) {
						return {
							...item,
							items: visibleSubItems,
						};
					}

					// No visible children, don't show parent
					return null;
				}

				// For items without children, check direct permission
				const permission = permissionMap.get(item.key);
				// Check both legacy canView and new allowedActions
				if (
					!permission?.canView &&
					!(
						permission?.allowedActions &&
						permission.allowedActions.includes("access")
					)
				) {
					return null;
				}

				return item;
			})
			.filter((item) => item !== null);
	}, [user]);

	return (
		<Sidebar>
			<SidebarHeader className='border-b border-border p-4'>
				<div className='flex items-center gap-2'>
					<Image
						src='/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png'
						alt='DAP Logo'
						width={32}
						height={32}
						className='h-8 w-8'
					/>
					<div>
						<h2 className='text-lg font-semibold'>DAP</h2>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = item.url ? pathname === item.url : false;
								const hasActiveSubItem = item.items?.some(
									(subItem) => pathname === subItem.url
								);

								return (
									<SidebarMenuItem key={item.title}>
										{item.items ? (
											<>
												<SidebarMenuButton
													className={cn(
														hasActiveSubItem &&
															"bg-primary text-primary-foreground font-bold"
													)}>
													<item.icon />
													<span>{item.title}</span>
												</SidebarMenuButton>
												<SidebarMenuSub>
													{item.items.map((subItem) => {
														const isSubItemActive = pathname === subItem.url;

														return (
															<SidebarMenuSubItem key={subItem.title}>
																<SidebarMenuSubButton asChild>
																	<Link
																		href={subItem.url}
																		className={cn(
																			isSubItemActive &&
																				"bg-primary/20 text-primary font-bold border-l-4 border-primary pl-4"
																		)}>
																		{subItem.title}
																	</Link>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														);
													})}
												</SidebarMenuSub>
											</>
										) : (
											<SidebarMenuButton asChild>
												<Link
													href={item.url}
													className={cn(
														isActive &&
															"bg-primary text-primary-foreground font-bold"
													)}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										)}
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className='border-t border-border p-4'>
				<p className='text-xs text-muted-foreground'>
					© DHQ Accommodation Platform
				</p>
			</SidebarFooter>
		</Sidebar>
	);
}
