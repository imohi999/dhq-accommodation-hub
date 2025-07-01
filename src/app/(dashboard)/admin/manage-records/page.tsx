"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Database, Trash2, ShieldAlert } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

// Define available tables for management
const MANAGEABLE_TABLES = [
	{
		name: "Queue",
		key: "queue",
		description: "Personnel queue records",
		cascades: ["Allocation Requests", "Past Allocations", "Unit Occupants"],
		warning: "This will delete all personnel records and their allocation history.",
		critical: true,
	},
	{
		name: "DHQ Living Units",
		key: "dhqLivingUnit",
		description: "Accommodation unit records",
		cascades: ["Allocation Requests", "Past Allocations", "Unit History", "Unit Inventory", "Unit Maintenance", "Unit Occupants"],
		warning: "This will delete all accommodation units and their related data.",
		critical: true,
	},
	{
		name: "Allocation Requests",
		key: "allocationRequest",
		description: "Pending and approved allocation requests",
		cascades: [],
		warning: "This will delete all allocation request records.",
		critical: false,
	},
	{
		name: "Past Allocations",
		key: "pastAllocation",
		description: "Historical allocation records",
		cascades: ["Clearance Inspections"],
		warning: "This will delete all past allocation records and clearance inspections.",
		critical: false,
	},
	{
		name: "Unit History",
		key: "unitHistory",
		description: "Accommodation unit occupancy history",
		cascades: [],
		warning: "This will delete all unit history records.",
		critical: false,
	},
	{
		name: "Unit Inventory",
		key: "unitInventory",
		description: "Inventory items for accommodation units",
		cascades: [],
		warning: "This will delete all inventory records.",
		critical: false,
	},
	{
		name: "Unit Maintenance",
		key: "unitMaintenance",
		description: "Maintenance records for accommodation units",
		cascades: [],
		warning: "This will delete all maintenance records.",
		critical: false,
	},
	{
		name: "Clearance Inspections",
		key: "clearanceInspection",
		description: "Clearance inspection records",
		cascades: [],
		warning: "This will delete all clearance inspection records.",
		critical: false,
	},
	{
		name: "Stamp Settings",
		key: "stampSetting",
		description: "Digital stamp configurations",
		cascades: [],
		warning: "This will delete all stamp settings.",
		critical: false,
	},
	{
		name: "Audit Logs",
		key: "auditLog",
		description: "System audit trail records",
		cascades: [],
		warning: "This will delete all audit logs. This action is irreversible and may affect compliance.",
		critical: true,
	},
];

export default function ManageRecordsPage() {
	const { user } = useAuth();
	const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteProgress, setDeleteProgress] = useState<{ table: string; status: string }[]>([]);

	// Only superadmins can access this page
	if (!user || user.profile?.role !== "superadmin") {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShieldAlert className="h-5 w-5 text-destructive" />
							Access Denied
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Only superadmins can access record management.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const handleSelectTable = (tableKey: string, checked: boolean) => {
		setSelectedTables((prev) => {
			const newSet = new Set(prev);
			if (checked) {
				newSet.add(tableKey);
			} else {
				newSet.delete(tableKey);
			}
			return newSet;
		});
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedTables(new Set(MANAGEABLE_TABLES.map(t => t.key)));
		} else {
			setSelectedTables(new Set());
		}
	};

	const handleDeleteClick = () => {
		if (selectedTables.size === 0) {
			toast.error("Please select at least one table to delete");
			return;
		}
		setShowConfirmDialog(true);
	};

	const performDelete = async () => {
		setIsDeleting(true);
		setDeleteProgress([]);
		setShowConfirmDialog(false);

		const tablesToDelete = Array.from(selectedTables);
		const results: { table: string; status: string }[] = [];

		for (const tableKey of tablesToDelete) {
			const table = MANAGEABLE_TABLES.find(t => t.key === tableKey);
			if (!table) continue;

			try {
				setDeleteProgress(prev => [...prev, { table: table.name, status: "Deleting..." }]);
				
				const response = await fetch("/api/admin/manage-records", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ table: tableKey }),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "Failed to delete table");
				}

				const result = await response.json();
				results.push({ table: table.name, status: `✓ Deleted ${result.count} records` });
				setDeleteProgress([...results]);
			} catch (error) {
				console.error(`Error deleting ${table.name}:`, error);
				results.push({ table: table.name, status: `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}` });
				setDeleteProgress([...results]);
			}
		}

		// Clear selections after deletion
		setSelectedTables(new Set());
		setIsDeleting(false);

		// Show summary
		const successCount = results.filter(r => r.status.includes("✓")).length;
		const failCount = results.filter(r => r.status.includes("✗")).length;
		
		if (successCount > 0 && failCount === 0) {
			toast.success(`Successfully deleted data from ${successCount} table(s)`);
		} else if (successCount > 0 && failCount > 0) {
			toast.warning(`Deleted data from ${successCount} table(s), ${failCount} failed`);
		} else {
			toast.error(`Failed to delete data from ${failCount} table(s)`);
		}
	};

	const selectedTableDetails = MANAGEABLE_TABLES.filter(t => selectedTables.has(t.key));
	const hasCriticalTables = selectedTableDetails.some(t => t.critical);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-bold text-[#1B365D] dark:text-foreground">
						Manage Records
					</h1>
					<p className="text-muted-foreground">
						Manage database records with cascading delete operations
					</p>
				</div>
				<Badge variant="destructive" className="flex items-center gap-1">
					<ShieldAlert className="h-3 w-3" />
					Superadmin Only
				</Badge>
			</div>

			<Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
				<CardHeader>
					<CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Critical Operation Warning
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-amber-700 dark:text-amber-300">
						This tool allows you to delete entire tables from the database. All deletions are permanent 
						and will cascade to related records. Use with extreme caution.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						Select Tables to Delete
					</CardTitle>
					<CardDescription>
						Choose which tables to clear. Related records will be automatically deleted.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between pb-4 border-b">
							<div className="flex items-center gap-2">
								<Checkbox
									id="select-all"
									checked={selectedTables.size === MANAGEABLE_TABLES.length}
									onCheckedChange={handleSelectAll}
									ref={(el) => {
										if (el) {
											const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
											if (checkbox) {
												checkbox.indeterminate = selectedTables.size > 0 && selectedTables.size < MANAGEABLE_TABLES.length;
											}
										}
									}}
								/>
								<label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
									Select All Tables
								</label>
							</div>
							<Button
								variant="destructive"
								onClick={handleDeleteClick}
								disabled={selectedTables.size === 0 || isDeleting}
								className="flex items-center gap-2"
							>
								<Trash2 className="h-4 w-4" />
								Delete Selected ({selectedTables.size})
							</Button>
						</div>

						<div className="grid gap-4">
							{MANAGEABLE_TABLES.map((table) => (
								<div
									key={table.key}
									className={`border rounded-lg p-4 transition-colors ${
										selectedTables.has(table.key) 
											? table.critical 
												? "border-destructive bg-destructive/5" 
												: "border-primary bg-primary/5"
											: ""
									}`}
								>
									<div className="flex items-start gap-3">
										<Checkbox
											id={table.key}
											checked={selectedTables.has(table.key)}
											onCheckedChange={(checked) => handleSelectTable(table.key, checked as boolean)}
											className="mt-1"
										/>
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<label htmlFor={table.key} className="text-sm font-medium cursor-pointer">
													{table.name}
												</label>
												{table.critical && (
													<Badge variant="destructive" className="text-xs">
														Critical
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												{table.description}
											</p>
											{table.cascades.length > 0 && (
												<div className="flex items-center gap-2 text-xs">
													<span className="text-muted-foreground">Cascades to:</span>
													<div className="flex flex-wrap gap-1">
														{table.cascades.map((cascade) => (
															<Badge key={cascade} variant="outline" className="text-xs">
																{cascade}
															</Badge>
														))}
													</div>
												</div>
											)}
											{selectedTables.has(table.key) && (
												<p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
													⚠️ {table.warning}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Delete Progress */}
			{deleteProgress.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Delete Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 font-mono text-sm">
							{deleteProgress.map((progress, index) => (
								<div key={index} className="flex items-center gap-2">
									<span className="font-medium">{progress.table}:</span>
									<span className={
										progress.status.includes("✓") ? "text-green-600 dark:text-green-400" :
										progress.status.includes("✗") ? "text-red-600 dark:text-red-400" :
										"text-muted-foreground"
									}>
										{progress.status}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Confirmation Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Confirm Database Deletion
						</DialogTitle>
						<DialogDescription>
							You are about to permanently delete data from {selectedTables.size} table(s).
							{hasCriticalTables && (
								<div className="mt-3 p-3 bg-destructive/10 rounded-md border border-destructive/20">
									<p className="font-medium text-destructive">
										⚠️ Critical tables selected!
									</p>
									<p className="text-sm mt-1">
										You have selected critical system tables. This action may severely impact system functionality.
									</p>
								</div>
							)}
							<div className="mt-4 space-y-2">
								<p className="font-medium">The following tables will be cleared:</p>
								<ul className="list-disc list-inside space-y-1 text-sm">
									{selectedTableDetails.map((table) => (
										<li key={table.key} className={table.critical ? "text-destructive" : ""}>
											{table.name}
											{table.cascades.length > 0 && (
												<span className="text-muted-foreground">
													{" "}(+ {table.cascades.length} related tables)
												</span>
											)}
										</li>
									))}
								</ul>
							</div>
							<p className="mt-4 font-medium text-destructive">
								This action cannot be undone. All data will be permanently lost.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowConfirmDialog(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={performDelete}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Spinner size="sm" className="mr-2" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="h-4 w-4 mr-2" />
									Permanently Delete
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}