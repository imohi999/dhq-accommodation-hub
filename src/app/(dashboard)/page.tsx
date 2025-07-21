import { Metadata } from "next";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Users,
	Home,
	FileText,
	CheckCircle,
	Clock,
	Wrench,
	AlertTriangle,
	Building,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Dashboard | DHQ Accommodation Hub",
	description: "DHQ Accommodation Management Dashboard",
};

async function getDashboardStats() {
	const [
		queueStats,
		pendingAllocations,
		activeAllocations,
		pastAllocations,
		accommodationStats,
		maintenanceTasks,
		maintenanceRequests,
	] = await Promise.all([
		// Queue statistics
		Promise.all([
			prisma.queue.count({}),
			prisma.queue.count({ where: { category: "Officer" } }),
			prisma.queue.count({ where: { category: "NCO" } }),
			prisma.queue.count({ where: { armOfService: "Nigerian Army" } }),
			prisma.queue.count({ where: { armOfService: "Nigerian Navy" } }),
			prisma.queue.count({ where: { armOfService: "Nigerian Air Force" } }),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Army",
					category: "Officer",
				},
			}),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Army",
					category: "NCO",
				},
			}),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Navy",
					category: "Officer",
				},
			}),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Navy",
					category: "NCO",
				},
			}),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Air Force",
					category: "Officer",
				},
			}),
			prisma.queue.count({
				where: {
					armOfService: "Nigerian Air Force",
					category: "NCO",
				},
			}),
		]),
		// Pending allocations
		Promise.all([
			prisma.allocationRequest.count({ where: { status: "pending" } }),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["category"], equals: "Officer" },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["category"], equals: "NCO" },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Army" },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Navy" },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: {
						path: ["armOfService"],
						equals: "Nigerian Air Force",
					},
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Army" },
					AND: { personnelData: { path: ["category"], equals: "Officer" } },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Army" },
					AND: { personnelData: { path: ["category"], equals: "NCO" } },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Navy" },
					AND: { personnelData: { path: ["category"], equals: "Officer" } },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: { path: ["armOfService"], equals: "Nigerian Navy" },
					AND: { personnelData: { path: ["category"], equals: "NCO" } },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: {
						path: ["armOfService"],
						equals: "Nigerian Air Force",
					},
					AND: { personnelData: { path: ["category"], equals: "Officer" } },
				},
			}),
			prisma.allocationRequest.count({
				where: {
					status: "pending",
					personnelData: {
						path: ["armOfService"],
						equals: "Nigerian Air Force",
					},
					AND: { personnelData: { path: ["category"], equals: "NCO" } },
				},
			}),
		]),
		// Active allocations (get from unit occupants with their service data)
		Promise.all([
			prisma.dhqLivingUnit.count({ where: { status: "Occupied" } }),
			prisma.dhqLivingUnit.count({
				where: { status: "Occupied", category: "Officer" },
			}),
			prisma.dhqLivingUnit.count({
				where: { status: "Occupied", category: "NCO" },
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Army" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Navy" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Air Force" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Army", category: "Officer" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Army", category: "NCO" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Navy", category: "Officer" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Navy", category: "NCO" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Air Force", category: "Officer" },
				},
			}),
			prisma.unitOccupant.count({
				where: {
					isCurrent: true,
					queue: { armOfService: "Nigerian Air Force", category: "NCO" },
				},
			}),
		]),
		// Past allocations
		Promise.all([
			prisma.pastAllocation.count(),
			prisma.pastAllocation.count({
				where: { personnelData: { path: ["category"], equals: "Officer" } },
			}),
			prisma.pastAllocation.count({
				where: { personnelData: { path: ["category"], equals: "NCO" } },
			}),
			prisma.pastAllocation.count({
				where: { queue: { armOfService: "Nigerian Army" } },
			}),
			prisma.pastAllocation.count({
				where: { queue: { armOfService: "Nigerian Navy" } },
			}),
			prisma.pastAllocation.count({
				where: { queue: { armOfService: "Nigerian Air Force" } },
			}),
			prisma.pastAllocation.count({
				where: {
					queue: { armOfService: "Nigerian Army", category: "Officer" },
				},
			}),
			prisma.pastAllocation.count({
				where: { queue: { armOfService: "Nigerian Army", category: "NCO" } },
			}),
			prisma.pastAllocation.count({
				where: {
					queue: { armOfService: "Nigerian Navy", category: "Officer" },
				},
			}),
			prisma.pastAllocation.count({
				where: { queue: { armOfService: "Nigerian Navy", category: "NCO" } },
			}),
			prisma.pastAllocation.count({
				where: {
					queue: { armOfService: "Nigerian Air Force", category: "Officer" },
				},
			}),
			prisma.pastAllocation.count({
				where: {
					queue: { armOfService: "Nigerian Air Force", category: "NCO" },
				},
			}),
		]),
		// DHQ accommodation statistics
		Promise.all([
			prisma.dhqLivingUnit.count(),
			prisma.dhqLivingUnit.count({ where: { status: "Vacant" } }),
			prisma.dhqLivingUnit.count({ where: { status: "Occupied" } }),
			prisma.dhqLivingUnit.count({ where: { status: "Not In Use" } }),
		]),
		// Maintenance tasks
		Promise.all([
			prisma.unitMaintenance.count({
				where: { recordType: "task", status: "Pending" },
			}),
			prisma.unitMaintenance.count({
				where: {
					recordType: "task",
					status: "Pending",
					maintenanceDate: { lt: new Date() },
				},
			}),
			prisma.unitMaintenance.count({
				where: { recordType: "task", status: "Completed" },
			}),
		]),
		// Maintenance requests
		Promise.all([
			prisma.unitMaintenance.count({
				where: { recordType: "request", status: "Pending" },
			}),
			prisma.unitMaintenance.count({
				where: {
					recordType: "request",
					status: "Pending",
					maintenanceDate: { lt: new Date() },
				},
			}),
			prisma.unitMaintenance.count({
				where: { recordType: "request", status: "Completed" },
			}),
		]),
	]);

	return {
		queue: {
			total: queueStats[0],
			officers: queueStats[1],
			nco: queueStats[2],
			army: {
				total: queueStats[3],
				officers: queueStats[6],
				nco: queueStats[7],
			},
			navy: {
				total: queueStats[4],
				officers: queueStats[8],
				nco: queueStats[9],
			},
			airForce: {
				total: queueStats[5],
				officers: queueStats[10],
				nco: queueStats[11],
			},
		},
		pendingAllocations: {
			total: pendingAllocations[0],
			officers: pendingAllocations[1],
			nco: pendingAllocations[2],
			army: {
				total: pendingAllocations[3],
				officers: pendingAllocations[6],
				nco: pendingAllocations[7],
			},
			navy: {
				total: pendingAllocations[4],
				officers: pendingAllocations[8],
				nco: pendingAllocations[9],
			},
			airForce: {
				total: pendingAllocations[5],
				officers: pendingAllocations[10],
				nco: pendingAllocations[11],
			},
		},
		activeAllocations: {
			total: activeAllocations[0],
			officers: activeAllocations[1],
			nco: activeAllocations[2],
			army: {
				total: activeAllocations[3],
				officers: activeAllocations[6],
				nco: activeAllocations[7],
			},
			navy: {
				total: activeAllocations[4],
				officers: activeAllocations[8],
				nco: activeAllocations[9],
			},
			airForce: {
				total: activeAllocations[5],
				officers: activeAllocations[10],
				nco: activeAllocations[11],
			},
		},
		pastAllocations: {
			total: pastAllocations[0],
			officers: pastAllocations[1],
			nco: pastAllocations[2],
			army: {
				total: pastAllocations[3],
				officers: pastAllocations[6],
				nco: pastAllocations[7],
			},
			navy: {
				total: pastAllocations[4],
				officers: pastAllocations[8],
				nco: pastAllocations[9],
			},
			airForce: {
				total: pastAllocations[5],
				officers: pastAllocations[10],
				nco: pastAllocations[11],
			},
		},
		accommodation: {
			total: accommodationStats[0],
			vacant: accommodationStats[1],
			occupied: accommodationStats[2],
			notInUse: accommodationStats[3],
		},
		maintenanceTasks: {
			pending: maintenanceTasks[0],
			overdue: maintenanceTasks[1],
			completed: maintenanceTasks[2],
		},
		maintenanceRequests: {
			pending: maintenanceRequests[0],
			overdue: maintenanceRequests[1],
			completed: maintenanceRequests[2],
		},
	};
}

export default async function DashboardPage() {
	const session = await getSession();
	const stats = await getDashboardStats();

	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<p className='text-muted-foreground'>
					Welcome back, {session?.username || session?.email || "User"}
				</p>
			</div>

			{/* 1. Queue Summary */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Queue Summary</h2>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total Queue</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.queue.total}</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.queue.officers} | NCO: {stats.queue.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Army
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.queue.army.total}</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.queue.army.officers} | NCO:{" "}
								{stats.queue.army.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Navy
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-blue-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.queue.navy.total}</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.queue.navy.officers} | NCO:{" "}
								{stats.queue.navy.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Air Force
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-cyan-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.queue.airForce.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.queue.airForce.officers} | NCO:{" "}
								{stats.queue.airForce.nco}
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 2. Pending Allocations */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Pending Allocations</h2>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Pending Allocations
							</CardTitle>
							<Clock className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pendingAllocations.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pendingAllocations.officers} | NCO:{" "}
								{stats.pendingAllocations.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Army
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pendingAllocations.army.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pendingAllocations.army.officers} | NCO:{" "}
								{stats.pendingAllocations.army.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Navy
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-blue-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pendingAllocations.navy.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pendingAllocations.navy.officers} | NCO:{" "}
								{stats.pendingAllocations.navy.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Air Force
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-cyan-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pendingAllocations.airForce.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pendingAllocations.airForce.officers} | NCO:{" "}
								{stats.pendingAllocations.airForce.nco}
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 3. Active Allocations */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Active Allocations</h2>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Active Allocations
							</CardTitle>
							<Home className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.activeAllocations.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.activeAllocations.officers} | NCO:{" "}
								{stats.activeAllocations.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Army
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.activeAllocations.army.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.activeAllocations.army.officers} | NCO:{" "}
								{stats.activeAllocations.army.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Navy
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-blue-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.activeAllocations.navy.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.activeAllocations.navy.officers} | NCO:{" "}
								{stats.activeAllocations.navy.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Air Force
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-cyan-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.activeAllocations.airForce.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.activeAllocations.airForce.officers} | NCO:{" "}
								{stats.activeAllocations.airForce.nco}
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 4. Past Allocations */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Past Allocations</h2>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Past Allocations
							</CardTitle>
							<Clock className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pastAllocations.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pastAllocations.officers} | NCO:{" "}
								{stats.pastAllocations.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Army
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pastAllocations.army.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pastAllocations.army.officers} | NCO:{" "}
								{stats.pastAllocations.army.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Navy
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-blue-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pastAllocations.navy.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pastAllocations.navy.officers} | NCO:{" "}
								{stats.pastAllocations.navy.nco}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Nigerian Air Force
							</CardTitle>
							<div className='w-4 h-4 rounded-full bg-cyan-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.pastAllocations.airForce.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Officers: {stats.pastAllocations.airForce.officers} | NCO:{" "}
								{stats.pastAllocations.airForce.nco}
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 5. DHQ Accommodation */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>DHQ Accommodation</h2>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total</CardTitle>
							<Building className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.accommodation.total}
							</div>
							<p className='text-xs text-muted-foreground'>
								Total accommodation units
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Vacant</CardTitle>
							<Home className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.accommodation.vacant}
							</div>
							<p className='text-xs text-muted-foreground'>
								Available for allocation
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Occupied</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.accommodation.occupied}
							</div>
							<p className='text-xs text-muted-foreground'>
								Currently allocated
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Not In Use</CardTitle>
							<AlertTriangle className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.accommodation.notInUse}
							</div>
							<p className='text-xs text-muted-foreground'>
								Maintenance or unavailable
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 6. Maintenance Tasks */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Maintenance Tasks</h2>
				<div className='grid gap-4 md:grid-cols-3'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Pending</CardTitle>
							<Clock className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.maintenanceTasks.pending}
							</div>
							<p className='text-xs text-muted-foreground'>
								Awaiting completion
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Overdue</CardTitle>
							<AlertTriangle className='h-4 w-4 text-destructive' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-destructive'>
								{stats.maintenanceTasks.overdue}
							</div>
							<p className='text-xs text-muted-foreground'>Past due date</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Completed</CardTitle>
							<CheckCircle className='h-4 w-4 text-green-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-green-600'>
								{stats.maintenanceTasks.completed}
							</div>
							<p className='text-xs text-muted-foreground'>
								Successfully completed
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 7. Maintenance Requests */}
			<section className='space-y-4'>
				<h2 className='text-xl font-semibold'>Maintenance Requests</h2>
				<div className='grid gap-4 md:grid-cols-3'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Pending</CardTitle>
							<FileText className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.maintenanceRequests.pending}
							</div>
							<p className='text-xs text-muted-foreground'>
								Awaiting processing
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Overdue</CardTitle>
							<AlertTriangle className='h-4 w-4 text-destructive' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-destructive'>
								{stats.maintenanceRequests.overdue}
							</div>
							<p className='text-xs text-muted-foreground'>Past due date</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Completed</CardTitle>
							<CheckCircle className='h-4 w-4 text-green-600' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-green-600'>
								{stats.maintenanceRequests.completed}
							</div>
							<p className='text-xs text-muted-foreground'>
								Successfully completed
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
